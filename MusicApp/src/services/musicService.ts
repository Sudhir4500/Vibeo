import client from "@/api/client";
import { Song } from "@/types/music";

export const musicService = {
    searchSongs: (query: string) => client.get<{ results: Song[] }>(`/music/search/`, {
        params: {
            q: query
        }
    })
}