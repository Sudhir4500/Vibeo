import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    StyleSheet, ActivityIndicator, RefreshControl, FlatList
} from 'react-native';
import { useLibraryStore } from '@/store/useLibraryStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { COLORS } from '@/constants/theme';
import { Song } from '@/types/music';
import { LikeButton } from '@/components/form/LikeButton';
import { PlayIcon, MusicIcon } from '@/components/icons';

interface LibraryScreenProps {
    navigation: any;
}

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
    const { likedSongs, fetchLikedSongs, isLoading } = useLibraryStore();
    const { playNewQueue, currentSong, isPlaying } = usePlayerStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchLikedSongs();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLikedSongs();
        setRefreshing(false);
    };

    const handlePlaySong = (song: Song, index: number) => {
        playNewQueue(likedSongs, index);
        navigation.navigate('Player');
    };

    const handlePlayAll = () => {
        if (likedSongs.length > 0) {
            playNewQueue(likedSongs, 0);
            navigation.navigate('Player');
        }
    };

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Header with gradient background */}
                <View style={styles.header}>
                    <View style={styles.likedSongsIcon}>
                        <MusicIcon color="#fff" size={64} />
                    </View>
                    <Text style={styles.headerTitle}>Liked Songs</Text>
                    <Text style={styles.headerSubtitle}>
                        {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                    </Text>
                </View>

                {/* Play All Button */}
                {likedSongs.length > 0 && (
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.playAllButton}
                            onPress={handlePlayAll}
                        >
                            <PlayIcon color="#000" size={24} />
                            <Text style={styles.playAllText}>Play All</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Songs List */}
                {likedSongs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MusicIcon color="#666" size={64} />
                        <Text style={styles.emptyTitle}>No liked songs yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Songs you like will appear here
                        </Text>
                    </View>
                ) : (
                    <View style={styles.songsList}>
                        {likedSongs.map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;
                            return (
                                <TouchableOpacity
                                    key={song.id}
                                    style={[
                                        styles.songItem,
                                        isCurrentSong && styles.songItemActive
                                    ]}
                                    onPress={() => handlePlaySong(song, index)}
                                >
                                    {/* Thumbnail */}
                                    <View style={styles.songImageContainer}>
                                        <Image
                                            source={{ uri: song.thumbnail }}
                                            style={styles.songImage}
                                        />
                                        {isCurrentSong && isPlaying && (
                                            <View style={styles.playingIndicator}>
                                                <View style={styles.bar} />
                                                <View style={[styles.bar, styles.bar2]} />
                                                <View style={[styles.bar, styles.bar3]} />
                                            </View>
                                        )}
                                    </View>

                                    {/* Song Info */}
                                    <View style={styles.songInfo}>
                                        <Text
                                            style={[
                                                styles.songTitle,
                                                isCurrentSong && styles.songTitleActive
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {song.title}
                                        </Text>
                                        <Text style={styles.songArtist} numberOfLines={1}>
                                            {song.artist || 'Unknown Artist'}
                                        </Text>
                                    </View>

                                    {/* Like Button */}
                                    <LikeButton song={song} size={24} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
        backgroundColor: '#1e3a5f',
    },
    likedSongsIcon: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#b3b3b3',
    },
    controls: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    playAllButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
    },
    playAllText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    songsList: {
        paddingHorizontal: 16,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    songItemActive: {
        backgroundColor: '#282828',
        borderRadius: 4,
        paddingHorizontal: 8,
    },
    songImageContainer: {
        position: 'relative',
    },
    songImage: {
        width: 56,
        height: 56,
        borderRadius: 4,
    },
    playingIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 2,
        borderRadius: 4,
    },
    bar: {
        width: 3,
        height: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    bar2: {
        height: 16,
    },
    bar3: {
        height: 8,
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 4,
    },
    songTitleActive: {
        color: COLORS.primary,
    },
    songArtist: {
        fontSize: 14,
        color: '#b3b3b3',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#b3b3b3',
        marginTop: 8,
    },
});

export default LibraryScreen;