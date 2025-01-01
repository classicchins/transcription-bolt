import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { MediaControls } from './MediaControls';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { mediaService } from '@/lib/storage/services/media-service';
import type { Transcription } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MediaPlayerProps {
  transcription: Transcription;
  onTimeUpdate?: (time: number) => void;
  onMediaLoad?: (element: HTMLMediaElement) => void;
  className?: string;
}

export const MediaPlayer = React.forwardRef<
  {
    togglePlayPause: () => void;
    skipBack: () => void;
    skipForward: () => void;
    seek: (time: number) => void;
  },
  MediaPlayerProps
>(({ transcription, onTimeUpdate, onMediaLoad, className }, ref) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const {
    mediaRef,
    playing,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    skipBack,
    skipForward,
    reset
  } = useMediaPlayer({
    onTimeUpdate,
    onError: (err) => {
      console.error('Media playback error:', err);
      setError('Failed to play media file. Please try again.');
    }
  });

  React.useImperativeHandle(ref, () => ({
    togglePlayPause,
    skipBack,
    skipForward,
    seek,
  }));

  React.useEffect(() => {
    async function loadMediaUrl() {
      if (!transcription.file?.storage_path) {
        setError('No media file available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const url = await mediaService.getMediaUrl(transcription.file.storage_path);
        setMediaUrl(url);
      } catch (err) {
        console.error('Error loading media:', err);
        setError('Failed to load media file');
        setMediaUrl(null);
      } finally {
        setLoading(false);
      }
    }

    loadMediaUrl();
  }, [transcription.file?.storage_path]);

  // Notify parent when media is loaded
  React.useEffect(() => {
    if (mediaRef.current) {
      onMediaLoad?.(mediaRef.current);
    }
  }, [mediaRef.current]);

  const handleRetry = () => {
    setRetryCount(count => count + 1);
    reset();
    loadMediaUrl();
  };

  if (loading) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <LoadingSpinner size="sm" className="mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading media...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <ErrorMessage message={error} />
          <Button onClick={handleRetry} variant="outline" size="sm">
            Try Again ({retryCount})
          </Button>
        </div>
      </Card>
    );
  }

  if (!mediaUrl) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-sm text-muted-foreground">No media available</p>
      </Card>
    );
  }

  const isAudio = transcription.file?.type.startsWith('audio/');

  return (
    <div className={className}>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isAudio ? (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={mediaUrl}
            className="w-full h-full"
            preload="metadata"
          />
        ) : (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            className="w-full h-full"
            preload="metadata"
          />
        )}
      </div>

      <MediaControls
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={togglePlayPause}
        onSeek={seek}
        onSkipBack={skipBack}
        onSkipForward={skipForward}
        className="mt-4"
      />
    </div>
  );
});

MediaPlayer.displayName = 'MediaPlayer';