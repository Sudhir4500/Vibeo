import { useEffect, useState } from "react"
import { Song } from "@/types/music"
import { musicService } from "@/services/musicService"

export const useSearch = () => {
    const [query, setQuery] = useState<string>("")
    const [results, setResults] = useState<Song[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true)
            try {
                const { data } = await musicService.searchSongs(query)
                setResults(data.results)

            } catch (error: any) {
                // get backend error message
                setError(error.response?.data?.detail || error.response?.data?.non_field_errors || "Something went wrong")

            } finally {
                setLoading(false)
            }

        }, 500);

        return () => {
            clearTimeout(delayDebounceFn)
        }
    }, [query])

    return {
        query,
        setQuery,
        results,
        loading,
        error
    }
}