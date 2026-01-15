import React, { useEffect, useRef } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { usePlayerStore } from '@/store/usePlayerStore';

export const PlayerEngine = () => {
    const videoRef = useRef<VideoRef>(null);
    const {
        currentSong,
        isPlaying,
        setProgress,
        position,
        isSeeking,
        playNext,
        queue,
        currentIndex,
        preloadNext
    } = usePlayerStore();

    // Trigger pre-loading when component mounts or song changes
    useEffect(() => {
        if (currentSong) {
            preloadNext();
        }
    }, [currentSong?.id]);

    // Seek when user finishes dragging
    useEffect(() => {
        if (!isSeeking && videoRef.current) {
            videoRef.current.seek(position);
        }
    }, [position, isSeeking]);

    // Reset and play when song changes
   // Inside PlayerEngine.tsx
useEffect(() => {
    if (currentSong?.url && videoRef.current) {
        // Force the video player to reload the new source
        videoRef.current.seek(0);
    }
}, [currentSong?.url]); // Triggered specifically when the URL arrives

    if (!currentSong) return null;

    const nextSong = queue[currentIndex + 1];

    // Buffering configuration for slow networks
    const bufferConfig = {
        minBufferMs: 15000,    // Min duration of media that must be buffered for playback to start
        maxBufferMs: 50000,    // Max duration of media that can be buffered
        bufferForPlaybackMs: 2500, // Playback starts after this amount of buffering
        bufferForPlaybackAfterRebufferMs: 5000 // Playback resumes after this amount of buffering if rebuffering occurs
    };

    return (
        <>
            <Video
                ref={videoRef}
                source={{
                    uri: currentSong.url,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit/537.36',
                    }
                }}
                paused={!isPlaying}
                playInBackground={true}
                playWhenInactive={true}
                bufferConfig={bufferConfig}
                onProgress={(data) => setProgress(data.currentTime, data.seekableDuration)}
                onEnd={() => playNext()}
                onError={(error) => {
                    console.error('Video playback error:', error);
                    // playNext();
                }}
                style={{ width: 0, height: 0 }}
            />
            {/* Background Buffer for Next Song */}
            {nextSong?.url && (
                <Video
                    source={{
                        uri: nextSong.url,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit/537.36',
                        }
                    }}
                    paused={true}
                    bufferConfig={bufferConfig}
                    style={{ width: 0, height: 0 }}
                />
            )}
        </>
    );
};