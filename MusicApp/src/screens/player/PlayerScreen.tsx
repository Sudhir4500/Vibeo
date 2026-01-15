import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../../store/usePlayerStore';
import { COLORS } from '../../constants/theme';
import { ChevronDownIcon, PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon } from '../../components/icons';
import { LikeButton } from '@/components/form/LikeButton';

const { width, height } = Dimensions.get('window');

export const PlayerScreen = ({ navigation }: any) => {
    const {
        currentSong, isPlaying, togglePlay, position, duration,
        playNext, playPrevious, isLoadingNext, currentIndex, queue
    } = usePlayerStore();

    if (!currentSong) return null;

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronDownIcon color="#fff" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Now Playing</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.artWrapper}>
                <Image source={{ uri: currentSong.thumbnail }} style={styles.albumArt} />
            </View>

            <View style={styles.metaRow}>
                <View style={styles.textWrapper}>
                    <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={styles.artist}>{currentSong.artist}</Text>
                </View>
                <LikeButton song={currentSong} size={30} />
            </View>

            <View style={styles.sliderArea}>
                <Slider
                    value={position}
                    minimumValue={0}
                    maximumValue={duration}
                    thumbTintColor="#fff"
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    onSlidingComplete={(v) => usePlayerStore.getState().seek(v as number)}
                />
                <View style={styles.timeLabels}>
                    <Text style={styles.timeTxt}>{formatTime(position)}</Text>
                    <Text style={styles.timeTxt}>{formatTime(duration)}</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={playPrevious} disabled={currentIndex === 0}>
                    <SkipBackIcon size={36} color={currentIndex === 0 ? '#555' : '#fff'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                    {isLoadingNext ? <ActivityIndicator color="#000" /> : 
                     (isPlaying ? <PauseIcon size={36} color="#000" /> : <PlayIcon size={36} color="#000" />)}
                </TouchableOpacity>

                <TouchableOpacity onPress={playNext} disabled={currentIndex === queue.length - 1}>
                    <SkipForwardIcon size={36} color={currentIndex === queue.length - 1 ? '#555' : '#fff'} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, alignItems: 'center' },
    headerText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    artWrapper: { alignItems: 'center', marginTop: height * 0.05, elevation: 20 },
    albumArt: { width: width - 40, height: width - 40, borderRadius: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
    textWrapper: { flex: 1 },
    title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    artist: { color: '#b3b3b3', fontSize: 16, marginTop: 4 },
    sliderArea: { marginTop: 20 },
    timeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    timeTxt: { color: '#b3b3b3', fontSize: 11 },
    controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 30 },
    playBtn: { backgroundColor: '#fff', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' }
});