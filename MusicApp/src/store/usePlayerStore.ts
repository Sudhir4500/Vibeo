import { create } from "zustand";
import { Song } from "@/types/music";
import { musicService } from "@/services/musicService";

interface PlayerState {
    currentSong: Song | null;
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    position: number;
    duration: number;
    isSeeking: boolean;
    isLoadingNext: boolean; // Add loading state
    setCurrentSong: (song: Song) => void;
    togglePlay: () => void;
    setProgress: (position: number, duration: number) => void;
    seek: (time: number) => void;
    setIsSeeking: (seeking: boolean) => void;
    setQueue: (queue: Song[], index: number) => void;
    playNext: () => Promise<void>;
    playPrevious: () => Promise<void>;
    preloadNext: () => Promise<void>;
    fetchSuggestions: () => Promise<void>;
    playNewQueue: (songs: Song[], startIndex: number) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    currentIndex: -1,
    queue: [],
    isSeeking: false,
    isLoadingNext: false,

    setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, position: 0 }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setProgress: (position, duration) =>
        set((state) => (state.isSeeking ? {} : { position, duration })),

    seek: (time) => set({ position: time, isSeeking: false }),

    setIsSeeking: (seeking) => set({ isSeeking: seeking }),

    setQueue: (queue, index) => set({
        queue,
        currentIndex: index,
        currentSong: queue[index],
        isPlaying: true
    }),

playNext: async () => {
    const { currentIndex, queue, fetchSuggestions, preloadNext } = get();

    // 1. Check if we have a next song at all
    if (currentIndex < queue.length - 1) {
        const nextIndex = currentIndex + 1;
        const nextSong = queue[nextIndex];

        // 2. Set loading state so the UI can show a spinner
        set({ isLoadingNext: true, isPlaying: false });

        try {
            let playableSong = nextSong;

            // 3. IF NO URL: Fetch it immediately (The Spotify way)
            if (!nextSong.url) {
                const response = await musicService.getStreamUrl(nextSong.id);
                const streamUrl = response.data.stream_url;
                
                playableSong = { ...nextSong, url: streamUrl };

                // Update the queue so we don't have to fetch this again later
                const updatedQueue = [...queue];
                updatedQueue[nextIndex] = playableSong;
                set({ queue: updatedQueue });
            }

            // 4. Update the current song and start playing
            set({
                currentIndex: nextIndex,
                currentSong: playableSong,
                isPlaying: true,
                isLoadingNext: false,
                position: 0
            });

            // 5. Cleanup & Maintenance
            preloadNext(); // Preload the one after this
            if (nextIndex >= queue.length - 3) fetchSuggestions(); // Get more recommendations

        } catch (error) {
            console.error("Failed to skip to next song:", error);
            set({ isLoadingNext: false });
        }
    } else {
        // If we are at the very end, fetch suggestions and try again
        await fetchSuggestions();
    }
},

    playPrevious: async () => {
        const { currentIndex, queue, preloadNext } = get();
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            const prevSong = queue[prevIndex];

            set({ isLoadingNext: true, isPlaying: false });

            try {
                let playableSong = prevSong;
                if (!prevSong.url) {
                    const response = await musicService.getStreamUrl(prevSong.id);
                    const streamUrl = response.data.stream_url;
                    if (streamUrl) {
                        playableSong = { ...prevSong, url: streamUrl };
                        const updatedQueue = [...queue];
                        updatedQueue[prevIndex] = playableSong;
                        set({ queue: updatedQueue });
                    }
                }

                set({
                    currentIndex: prevIndex,
                    currentSong: playableSong,
                    isPlaying: true,
                    isLoadingNext: false,
                    position: 0
                });

                preloadNext();
            } catch (error) {
                console.error("Error loading previous song:", error);
                set({ isLoadingNext: false });
            }
        }
    },

  preloadNext: async () => {
    const { currentIndex, queue } = get();
    // Only preload the immediate next song to ensure the temporary URL stays fresh
    const nextIdx = currentIndex + 1;
    
    if (nextIdx < queue.length && !queue[nextIdx].url) {
        try {
            const response = await musicService.getStreamUrl(queue[nextIdx].id);
            const streamUrl = response.data.stream_url;
            
            const updatedQueue = [...get().queue];
            updatedQueue[nextIdx] = { ...updatedQueue[nextIdx], url: streamUrl };
            set({ queue: updatedQueue });
        } catch (e) {
            console.log("Preload failed", e);
        }
    }
},
playNewQueue: async (songs: Song[], startIndex: number) => {
    // 1. Set the metadata first so the UI updates instantly
    set({ 
        queue: songs, 
        currentIndex: startIndex, 
        currentSong: songs[startIndex], 
        isPlaying: false, 
        isLoadingNext: true 
    });

    // 2. Fetch the URL in the background
    try {
        const res = await musicService.getStreamUrl(songs[startIndex].id);
        const updatedSong = { ...songs[startIndex], url: res.data.stream_url };
        
        const updatedQueue = [...songs];
        updatedQueue[startIndex] = updatedSong;

        set({ 
            currentSong: updatedSong, 
            queue: updatedQueue, 
            isPlaying: true, 
            isLoadingNext: false 
        });
    } catch (e) {
        set({ isLoadingNext: false });
    }
},

   fetchSuggestions: async () => {
    const { currentSong, queue } = get();
    if (!currentSong) return;

    try {
        const response = await musicService.getRecommendations(
            currentSong.id,
            currentSong.title,
            currentSong.artist || ""
        );
        
        const suggestions = response.data.results;

        if (suggestions && suggestions.length > 0) {
            const currentQueue = get().queue;
            const existingIds = new Set(currentQueue.map(s => s.id));
            
            // 1. Filter out duplicates
            const newSongs = suggestions.filter(s => !existingIds.has(s.id));

            if (newSongs.length > 0) {
                // 2. Limit queue size to prevent memory lag (keep last 10, add new ones)
                // This keeps the 'history' short and the 'future' fresh
                const trimmedQueue = currentQueue.length > 50 
                    ? currentQueue.slice(get().currentIndex - 5) 
                    : currentQueue;

                set({ queue: [...trimmedQueue, ...newSongs] });
                get().preloadNext();
            }
        }
    } catch (e) {
        console.error("Discovery error:", e);
    }
},

}));
