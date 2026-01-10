import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, FlatList } from 'react-native'
import React from 'react'
import { useSearch } from '@/hooks/useSearch'
import { Song } from '@/types/music'
import { COLORS, SIZES } from '@/constants/theme'

const SearchScreen = () => {
    const { query, setQuery, results, loading, error } = useSearch()

    console.log("Song fetch", results)

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity style={styles.songCard}>
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
            <FlatList
                data={results}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    !loading && query.length > 2 ? (
                        <Text style={{ color: "white" }}>No results found</Text>
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
        marginBottom: 15
    },
    thumbnail: {
        width: 50,
        height: 50,
        marginRight: 10
    },
    title: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: "bold",
        marginBottom: 5
    },
    artist: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    songInfo: {
        flex: 1,
        marginLeft: 15
    }
})