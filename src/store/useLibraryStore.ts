import { create } from "zustand";
import { musicService } from "@/services/musicService";
import { Song } from "@/types/music";

interface LibraryState {
    likedSongs: Song[];
    likedIds: Set<string>; // Fast lookup for the heart icon
    isLoading: boolean;
    error: string | null;
    fetchLikedSongs: () => Promise<void>;
    toggleLike: (song: Song) => Promise<void>;
    isLiked: (songId: string) => boolean;
    clearError: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    likedSongs: [],
    likedIds: new Set(),
    isLoading: false,
    error: null,

    fetchLikedSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await musicService.getLikedSongs();
            
            // Handle both response formats
            const songs = res.data.songs || [];
            
            console.log(`✅ Fetched ${songs.length} liked songs`);
            
            set({ 
                likedSongs: songs, 
                likedIds: new Set(songs.map((s: Song) => s.id)),
                isLoading: false,
                error: null
            });
        } catch (e: any) {
            console.error("❌ Failed to fetch liked songs:", e);
            set({ 
                isLoading: false,
                error: e.message || "Failed to fetch liked songs"
            });
        }
    },

    toggleLike: async (song) => {
        const { likedIds, likedSongs } = get();
        const isCurrentlyLiked = likedIds.has(song.id);

        // Optimistic UI Update
        const newIds = new Set(likedIds);
        let newLikedSongs = [...likedSongs];
        
        if (isCurrentlyLiked) {
            // Remove from liked
            newIds.delete(song.id);
            newLikedSongs = likedSongs.filter(s => s.id !== song.id);
            console.log(`💔 Optimistically unliked: ${song.title}`);
        } else {
            // Add to liked
            newIds.add(song.id);
            newLikedSongs = [song, ...likedSongs]; // Add to beginning
            console.log(`💚 Optimistically liked: ${song.title}`);
        }
        
        set({ 
            likedIds: newIds,
            likedSongs: newLikedSongs
        });

        try {
            const response = await musicService.toggleLike(song);
            console.log(`✅ Toggle like success:`, response.data);
            
            // Refresh the full list to ensure consistency with backend
            await get().fetchLikedSongs();
        } catch (e: any) {
            // Rollback on error
            console.error("❌ Toggle like failed, rolling back:", e);
            set({ 
                likedIds: likedIds,
                likedSongs: likedSongs,
                error: e.message || "Failed to toggle like"
            });
        }
    },

    isLiked: (songId) => {
        const liked = get().likedIds.has(songId);
        return liked;
    },

    clearError: () => set({ error: null }),
}));