import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, ScrollView, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { musicService } from '@/services/musicService';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { COLORS } from '@/constants/theme';
import { Song } from '@/types/music';
import { MusicIcon, PlayIcon } from '@/components/icons';
import { ProfileMenu } from '@/components/ProfileMenu';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { playNewQueue } = usePlayerStore();
    const { likedSongs, fetchLikedSongs } = useLibraryStore();

    const fetchHome = async () => {
        try {
            const res = await musicService.getDiscovery();
            setSections(res?.data?.sections || []);
            await fetchLikedSongs(); // Sync likes on load
        } catch (e) {
            console.error('Home fetch error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { 
        fetchHome(); 
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handlePlayLikedSongs = () => {
        if (likedSongs.length > 0) {
            playNewQueue(likedSongs, 0);
            navigation.navigate('Player');
        }
    };

    const navigateToLibrary = () => {
        navigation.navigate('Library');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container} 
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={fetchHome} 
                    tintColor={COLORS.primary} 
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <ProfileMenu />
            </View>

            {/* Liked Songs Card - Spotify Style */}
            {likedSongs.length > 0 && (
                <TouchableOpacity 
                    style={styles.likedSongsCard}
                    onPress={navigateToLibrary}
                >
                    <View style={styles.likedSongsIconContainer}>
                        <MusicIcon color="#fff" size={32} />
                    </View>
                    <View style={styles.likedSongsInfo}>
                        <Text style={styles.likedSongsTitle}>Liked Songs</Text>
                        <Text style={styles.likedSongsCount}>
                            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.playButton}
                        onPress={handlePlayLikedSongs}
                    >
                        <PlayIcon color="#000" size={20} />
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            {/* Quick Access Grid */}
            {sections.length > 0 && (
                <View style={styles.quickAccessGrid}>
                    {sections[0].data.slice(0, 6).map((item: Song, index: number) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.quickAccessCard}
                            onPress={() => { 
                                playNewQueue(sections[0].data, index); 
                                navigation.navigate('Player'); 
                            }}
                        >
                            <Image 
                                source={{ uri: item.thumbnail }} 
                                style={styles.quickAccessImage} 
                            />
                            <Text 
                                style={styles.quickAccessTitle} 
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Recently Liked Songs - Horizontal Scroll */}
            {likedSongs.length > 0 && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recently Liked</Text>
                        <TouchableOpacity onPress={navigateToLibrary}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        data={likedSongs.slice(0, 10)}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity 
                                style={styles.songCard}
                                onPress={() => { 
                                    playNewQueue(likedSongs, index); 
                                    navigation.navigate('Player'); 
                                }}
                            >
                                <Image 
                                    source={{ uri: item.thumbnail }} 
                                    style={styles.thumbnail} 
                                />
                                <View style={styles.likedBadge}>
                                    <Text style={styles.likedBadgeText}>💚</Text>
                                </View>
                                <Text 
                                    style={styles.songTitle} 
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                <Text 
                                    style={styles.songArtist} 
                                    numberOfLines={1}
                                >
                                    {item.artist || 'Unknown Artist'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Other Horizontal Sections */}
            {sections.map((section, idx) => (
                <View key={idx} style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                    <FlatList
                        horizontal
                        data={section.data}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity 
                                style={styles.songCard}
                                onPress={() => { 
                                    playNewQueue(section.data, index); 
                                    navigation.navigate('Player'); 
                                }}
                            >
                                <Image 
                                    source={{ uri: item.thumbnail }} 
                                    style={styles.thumbnail} 
                                />
                                <Text 
                                    style={styles.songTitle} 
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                <Text 
                                    style={styles.songArtist} 
                                    numberOfLines={1}
                                >
                                    {item.artist}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            ))}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#121212' 
    },
    loadingContainer: { 
        flex: 1, 
        backgroundColor: '#121212', 
        justifyContent: 'center' 
    },
    header: { 
        padding: 16, 
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: { 
        color: '#fff', 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    
    // Liked Songs Card
    likedSongsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e3a5f',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 8,
    },
    likedSongsIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    likedSongsInfo: {
        flex: 1,
    },
    likedSongsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    likedSongsCount: {
        fontSize: 14,
        color: '#b3b3b3',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Quick Access Grid
    quickAccessGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        padding: 8, 
        justifyContent: 'space-between' 
    },
    quickAccessCard: {
        width: (width / 2) - 12,
        height: 56,
        backgroundColor: '#282828',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden'
    },
    quickAccessImage: { 
        width: 56, 
        height: 56 
    },
    quickAccessTitle: { 
        color: '#fff', 
        fontSize: 12, 
        fontWeight: 'bold', 
        paddingHorizontal: 8, 
        flex: 1 
    },

    // Sections
    sectionContainer: { 
        marginTop: 24 
    },
    sectionHeader: { 
        paddingHorizontal: 16, 
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: { 
        color: '#fff', 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    seeAllText: {
        color: '#b3b3b3',
        fontSize: 14,
        fontWeight: '600',
    },
    songCard: { 
        width: 140, 
        marginLeft: 16,
        position: 'relative',
    },
    thumbnail: { 
        width: 140, 
        height: 140, 
        borderRadius: 4, 
        marginBottom: 8 
    },
    likedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    likedBadgeText: {
        fontSize: 16,
    },
    songTitle: { 
        color: '#fff', 
        fontSize: 14, 
        fontWeight: '600' 
    },
    songArtist: { 
        color: '#b3b3b3', 
        fontSize: 12 
    },
});