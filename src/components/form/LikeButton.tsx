import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { HeartIcon } from '../icons';
import { useLibraryStore } from '@/store/useLibraryStore';
import { Song } from '@/types/music';
import { COLORS } from '../../constants/theme';

interface LikeButtonProps {
    song: Song;
    size?: number;
    showDebug?: boolean; // Optional debug mode
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
    song, 
    size = 28,
    showDebug = false 
}) => {
    const { toggleLike, isLiked } = useLibraryStore();
    const liked = isLiked(song.id);
    
    // Animation values
    const scale = useRef(new Animated.Value(1)).current;

    // Log when liked state changes
    useEffect(() => {
        console.log(`💚 LikeButton for "${song.title}":`, {
            songId: song.id,
            isLiked: liked,
            iconColor: liked ? COLORS.primary : "#b3b3b3",
            iconFill: liked ? COLORS.primary : "none"
        });

        if (liked) {
            // Pop animation when liked
            Animated.sequence([
                Animated.timing(scale, { 
                    toValue: 1.3, 
                    duration: 150, 
                    useNativeDriver: true 
                }),
                Animated.spring(scale, { 
                    toValue: 1, 
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true 
                })
            ]).start();
        }
    }, [liked]);

    const handlePress = () => {
        console.log(`🎵 LikeButton pressed for: ${song.title} (${song.id})`);
        console.log(`   Current state: ${liked ? 'LIKED' : 'NOT LIKED'}`);
        toggleLike(song);
    };

    // Spotify-style colors
    const iconColor = liked ? COLORS.primary : "#b3b3b3";
    const iconFill = liked ? COLORS.primary : "none";

    return (
        <TouchableOpacity 
            onPress={handlePress} 
            activeOpacity={0.7}
            style={styles.container}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Animated.View 
                style={{ 
                    transform: [{ scale }]
                }}
            >
                <HeartIcon 
                    size={size} 
                    color={iconColor} 
                    fill={iconFill}
                />
                {/* Optional debug text */}
                {showDebug && (
                    <Text style={styles.debugText}>
                        {liked ? '💚' : '🤍'}
                    </Text>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    debugText: {
        position: 'absolute',
        bottom: -15,
        fontSize: 10,
        color: '#fff',
    },
});