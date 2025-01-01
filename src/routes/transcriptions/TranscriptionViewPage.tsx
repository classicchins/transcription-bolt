import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { MediaPlayer } from '@/components/transcriptions/MediaPlayer';
import { TranscriptionContent } from '@/components/transcriptions/TranscriptionContent';
import { DownloadOptions } from '@/components/transcriptions/DownloadOptions';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getTranscriptionById } from '@/lib/transcription-utils';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Transcription } from '@/lib/types';

export function TranscriptionViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transcription, setTranscription] = React.useState<Transcription | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mediaElement, setMediaElement] = React.useState<HTMLMediaElement | null>(null);
  
  useDocumentTitle(transcription?.file?.name ? `${transcription.file.name} | Transcription` : 'Transcription Details');

  const mediaControlsRef = React.useRef<{
    togglePlayPause: () => void;
    skipBack: () => void;
    skipForward: () => void;
    seek: (time: number) => void;
  }>(null);

  useKeyboardShortcuts({
    onPlayPause: () => mediaControlsRef.current?.togglePlayPause(),
    onSkipBack: () => mediaControlsRef.current?.skipBack(),
    onSkipForward: () => mediaControlsRef.current?.skipForward(),
  });

  React.useEffect(() => {
    async function loadTranscription() {
      if (!id || !user) return;

      try {
        const { data, error } = await getTranscriptionById(id, user.id);
        if (error) throw error;
        setTranscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcription');
      } finally {
        setLoading(false);
      }
    }

    loadTranscription();
  }, [id, user]);

  const handleTimeUpdate = React.useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleTimeClick = React.useCallback((time: number) => {
    mediaControlsRef.current?.seek(time);
  }, []);

  const handleMediaLoad = React.useCallback((element: HTMLMediaElement) => {
    setMediaElement(element);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/transcriptions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to transcriptions
        </Button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/transcriptions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to transcriptions
        </Button>
        <ErrorMessage message="Transcription not found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/transcriptions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to transcriptions
        </Button>

        {transcription.status === 'completed' && transcription.content && (
          <DownloadOptions
            transcription={transcription}
            onError={setError}
          />
        )}
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{transcription.file?.name}</h1>
        <MediaPlayer
          ref={mediaControlsRef}
          transcription={transcription}
          onTimeUpdate={handleTimeUpdate}
          onMediaLoad={handleMediaLoad}
        />
      </Card>

      <TranscriptionContent
        transcription={transcription}
        currentTime={currentTime}
        onTimeClick={handleTimeClick}
        mediaElement={mediaElement}
      />
    </div>
  );
}