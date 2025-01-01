import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMediaPlayerOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: Error) => void;
}

export function useMediaPlayer({ onTimeUpdate, onError }: UseMediaPlayerOptions = {}) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    if (!mediaRef.current) return;
    setCurrentTime(mediaRef.current.currentTime);
    onTimeUpdate?.(mediaRef.current.currentTime);
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (!mediaRef.current) return;
    setDuration(mediaRef.current.duration);
  }, []);

  const handleError = useCallback((event: Event) => {
    const media = event.target as HTMLMediaElement;
    const error = media.error;
    onError?.(new Error(error?.message || 'Failed to play media'));
  }, [onError]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', () => setPlaying(false));
    media.addEventListener('error', handleError);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', () => setPlaying(false));
      media.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleError]);

  const togglePlayPause = useCallback(async () => {
    if (!mediaRef.current) return;
    
    try {
      if (mediaRef.current.paused) {
        await mediaRef.current.play();
        setPlaying(true);
      } else {
        mediaRef.current.pause();
        setPlaying(false);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Failed to play media'));
      setPlaying(false);
    }
  }, [onError]);

  const seek = useCallback((time: number) => {
    if (!mediaRef.current) return;
    mediaRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipBack = useCallback(() => {
    if (!mediaRef.current) return;
    const newTime = Math.max(mediaRef.current.currentTime - 10, 0);
    seek(newTime);
  }, [seek]);

  const skipForward = useCallback(() => {
    if (!mediaRef.current) return;
    const newTime = Math.min(mediaRef.current.currentTime + 10, duration);
    seek(newTime);
  }, [seek, duration]);

  const reset = useCallback(() => {
    if (!mediaRef.current) return;
    mediaRef.current.pause();
    mediaRef.current.currentTime = 0;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    mediaRef,
    playing,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    skipBack,
    skipForward,
    reset,
  };
}