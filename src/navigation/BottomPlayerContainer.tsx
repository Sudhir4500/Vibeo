import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TabNavigator } from './TabNavigator';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { usePlayerStore } from '../store/usePlayerStore';

export const BottomPlayerContainer = () => {
    const { currentSong } = usePlayerStore();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TabNavigator />
            </View>
            {currentSong && (
                <View style={styles.miniPlayerContainer}>
                    <MiniPlayer />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    miniPlayerContainer: {
        position: 'absolute',
        bottom: 65, // This should match the TabNavigator height
        left: 0,
        right: 0,
        zIndex: 10,
    },
});
