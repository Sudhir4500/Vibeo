import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { Song } from '@/types/music'
import { COLORS, SIZES } from '@/constants/theme'
import { usePlayerStore } from '@/store/usePlayerStore'
import { musicService } from '@/services/musicService'

const SearchScreen = ({ navigation }: any) => {
    const { query, setQuery, results, error, loading } = useSearch()
    const { setCurrentSong, setQueue, fetchSuggestions } = usePlayerStore()
    const [isFetching, setIsFetching] = useState(false)

    const handlePlaySong = async (item: Song, index: number) => {
        setIsFetching(true)
        try {
            let playableSong = item;

            // If song doesn't have a URL, fetch it
            if (!item.url) {
                const response = await musicService.getStreamUrl(item.id)
                const streamUrl = response.data.stream_url
                if (streamUrl) {
                    playableSong = { ...item, url: streamUrl };
                } else {
                    Alert.alert("Error", "Could not get stream URL")
                    return;
                }
            }

            // For a "YouTube-like" experience, we set the queue with just this song
            // and then let the recommendation system populate the rest
            setQueue([playableSong], 0)

            // Navigate immediately
            navigation.navigate('Player')

            // Trigger suggestions fetch in background
            fetchSuggestions();

        } catch (error: any) {
            console.error("Stream Fetch Error:", error)
            Alert.alert("Error", "Could not load audio. Please try again.")
        } finally {
            setIsFetching(false)
        }
    }

    const renderSongItem = ({ item, index }: { item: Song, index: number }) => (
        <TouchableOpacity
            style={styles.songCard}
            onPress={() => handlePlaySong(item, index)}
            disabled={isFetching}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.songInfo}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.artist}>{item.artist}</Text>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Search</Text>
            <TextInput
                placeholder='What are you looking for?'
                placeholderTextColor={"#777"}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
            />

            {isFetching && (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
            )}

            <FlatList
                data={results}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    !loading && query.length > 2 ? (
                        <Text style={styles.emptyText}>No results found</Text>
                    ) : null
                }
            />
        </View>
    )
}

export default SearchScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding,
    },
    pageTitle: {
        fontSize: 28,
        color: COLORS.text,
        fontWeight: "bold",
        marginVertical: 20,
    },
    searchInput: {
        backgroundColor: COLORS.text,
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    songCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: "bold",
        marginBottom: 5,
    },
    artist: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    songInfo: {
        flex: 1,
        marginLeft: 15,
    },
    emptyText: {
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    }
})