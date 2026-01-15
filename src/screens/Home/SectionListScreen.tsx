import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import {MusicIcon,EllipsisVerticalIcon,PlayIcon,ChevronLeftIcon } from '@/components/icons';
import { musicService } from '@/services/musicService';
import { usePlayerStore } from '@/store/usePlayerStore';
import { COLORS } from '@/constants/theme';
import { Song } from '@/types/music';


interface SectionListScreenProps {
    route: {
        params: {
            title: string;
            section: string;
            query?: string;
        };
    };
    navigation: any;
}

export const SectionListScreen = ({ route, navigation }: SectionListScreenProps) => {
    const { title, section, query } = route.params;
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const { playNewQueue, currentSong } = usePlayerStore();

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const response = await musicService.getSectionSongs(section, query);
            setSongs(response.data.songs);
        } catch (error) {
            console.error('Error fetching section songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (index: number) => {
        playNewQueue(songs, index);
        navigation.navigate('Player');
    };

    const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
        const isPlaying = currentSong?.id === item.id;

        return (
            <TouchableOpacity
                style={styles.songItem}
                onPress={() => handlePlaySong(index)}
                activeOpacity={0.7}
            >
                <View style={styles.songIndex}>
                    {isPlaying ? (
                        <MusicIcon color={COLORS.primary} size={16} />
                    ) : (
                        <Text style={styles.indexText}>{index + 1}</Text>
                    )}
                </View>

                <Image source={{ uri: item.thumbnail }} style={styles.songThumbnail} />

                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                        {item.artist}
                    </Text>
                </View>

                <Text style={styles.songDuration}>{item.duration}</Text>

                <TouchableOpacity style={styles.moreButton}>
                    \<EllipsisVerticalIcon color="#b3b3b3" size={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            {songs.length > 0 && (
                <Image
                    source={{ uri: songs[0].thumbnail }}
                    style={styles.headerImage}
                    blurRadius={50}
                />
            )}
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{songs.length} songs</Text>
                
                <TouchableOpacity
                    style={styles.playAllButton}
                    onPress={() => handlePlaySong(0)}
                >
                    <PlayIcon color="#000" size={24} />
                    <Text style={styles.playAllText}>Play All</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeftIcon color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitleSmall} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <FlatList
                data={songs}
                keyExtractor={(item) => item.id}
                renderItem={renderSongItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitleSmall: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    listContent: {
        paddingBottom: 100,
    },

    // Header Section
    headerSection: {
        height: 300,
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    headerImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    headerContent: {
        padding: 20,
        zIndex: 1,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#b3b3b3',
        fontSize: 14,
        marginBottom: 20,
    },
    playAllButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        alignSelf: 'flex-start',
    },
    playAllText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },

    // Song Item
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    songIndex: {
        width: 30,
        alignItems: 'center',
    },
    indexText: {
        color: '#b3b3b3',
        fontSize: 14,
    },
    songThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#282828',
    },
    songInfo: {
        flex: 1,
        marginRight: 12,
    },
    songTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    songArtist: {
        color: '#b3b3b3',
        fontSize: 12,
    },
    songDuration: {
        color: '#b3b3b3',
        fontSize: 12,
        marginRight: 8,
    },
    moreButton: {
        padding: 8,
    },
});