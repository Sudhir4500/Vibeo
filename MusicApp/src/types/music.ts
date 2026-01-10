export interface Song {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: string;
    url?: string;
}

export interface SearchResponse {
    results: Song[];
}