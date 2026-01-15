import client from "@/api/client";
import { Song } from "@/types/music";

export const musicService = {
    searchSongs: async (query: string) => {
        try {
            const response = await client.get<{ results: Song[] }>(`/music/search/`, { 
                params: { q: query } 
            });
            console.log(`🔍 Search results for "${query}":`, response.data.results?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Search error:', error);
            throw error;
        }
    },

    getStreamUrl: async (videoId: string) => {
        try {
            const response = await client.get<{ stream_url: string }>(`/music/stream/`, { 
                params: { id: videoId } 
            });
            console.log(`🎵 Stream URL for ${videoId}:`, response.data.stream_url);
            return response;
        } catch (error) {
            console.error('❌ Stream URL error:', error);
            throw error;
        }
    },

    getRecommendations: async (videoId: string, title: string, artist: string = "") => {
        try {
            const response = await client.get<{ results: Song[] }>(`/music/recommendations/`, {
                params: { id: videoId, title, artist }
            });
            console.log(`💡 Recommendations for "${title}":`, response.data.results?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Recommendations error:', error);
            throw error;
        }
    },

    getDiscovery: async () => {
        try {
            const response = await client.get<{ sections: { title: string; data: Song[] }[] }>(`/music/discovery/`);
            console.log(`🏠 Discovery sections:`, response.data.sections?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Discovery error:', error);
            throw error;
        }
    },

    getSectionSongs: async (section: string, customQuery?: string, limit?: number) => {
        try {
            const response = await client.get('/music/section/', { 
                params: { section, query: customQuery, limit: limit || 50 } 
            });
            console.log(`📂 Section "${section}":`, response.data.songs?.length || 0);
            return response;
        } catch (error) {
            console.error('❌ Section songs error:', error);
            throw error;
        }
    },

    // Get all liked songs
    getLikedSongs: async () => {
        try {
            console.log('📥 Fetching liked songs...');
            const response = await client.get<{ 
                playlist: { id: number; name: string; song_count: number }; 
                songs: Song[] 
            }>(`/music/liked-songs/`);
            
            const songCount = response.data.songs?.length || 0;
            console.log(`💚 Liked songs fetched: ${songCount} songs`);
            console.log('📋 Liked songs:', response.data.songs?.map(s => ({
                id: s.id,
                title: s.title
            })));
            
            return response;
        } catch (error: any) {
            console.error('❌ Get liked songs error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Toggle like/unlike
    toggleLike: async (song: Song) => {
        try {
            const payload = {
                id: song.id,
                title: song.title,
                artist: song.artist || 'Unknown Artist',
                thumbnail: song.thumbnail,
                duration: song.duration || ''
            };
            
            console.log('📤 Toggling like for song:', payload);
            
            const response = await client.post<{ 
                status: string; 
                liked: boolean;
                song_id: string;
            }>(`/music/like/`, payload);
            
            console.log('✅ Toggle like response:', response.data);
            
            return response;
        } catch (error: any) {
            console.error('❌ Toggle like error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    // Optional: Check if a specific song is liked
    checkIfLiked: async (videoId: string) => {
        try {
            const response = await client.get<{ liked: boolean }>(`/music/check-liked/`, {
                params: { id: videoId }
            });
            console.log(`💚 Is "${videoId}" liked?`, response.data.liked);
            return response;
        } catch (error) {
            console.error('❌ Check liked error:', error);
            throw error;
        }
    }
};