import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { TranscriptionDetails } from '@/components/transcriptions/TranscriptionDetails';
import { getTranscriptionById } from '@/lib/transcription-utils';
import { useAuth } from '@/hooks/useAuth';

export function TranscriptionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transcription, setTranscription] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadTranscription() {
      if (!id || !user) return;

      const { data, error } = await getTranscriptionById(id, user.id);
      
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      
      setTranscription(data);
    }

    loadTranscription();
  }, [id, user]);

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
        <ErrorMessage message={`Failed to load transcription: ${error}`} />
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
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard/transcriptions')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to transcriptions
      </Button>

      <TranscriptionDetails transcription={transcription} />
    </div>
  );
}