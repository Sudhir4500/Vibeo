import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { COLORS } from '../../constants/theme';
import { PlayIcon, PauseIcon } from '../icons';
import { useNavigation } from '@react-navigation/native';

export const MiniPlayer = () => {
    const navigation = useNavigation<any>();
    const { currentSong, isPlaying, togglePlay } = usePlayerStore();

    if (!currentSong) return null;

    return (
        <Pressable
            style={styles.container}
            onPress={() => navigation.navigate('Player')}
        >
            <Image
                source={{ uri: currentSong.thumbnail }}
                style={styles.thumbnail}
            />

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {currentSong.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {currentSong.artist}
                </Text>
            </View>

            <TouchableOpacity
                onPress={togglePlay}
                style={styles.playBtn}
            >
                {isPlaying ? (
                    <PauseIcon color="#fff" size={24} />
                ) : (
                    <PlayIcon color="#fff" size={24} />
                )}
            </TouchableOpacity>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#282828',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#121212',
    },
    thumbnail: {
        width: 45,
        height: 45,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    artist: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    playBtn: {
        padding: 10,
    },
});