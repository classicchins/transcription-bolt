import React from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getTranscriptionContent } from '@/lib/transcription/services/transcription-content';

interface TranscriptionContentProps {
  transcriptionId: string;
  status: string;
  className?: string;
}

export function TranscriptionContent({ transcriptionId, status, className }: TranscriptionContentProps) {
  const [content, setContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchContent() {
      if (status !== 'completed') return;
      
      try {
        setLoading(true);
        const content = await getTranscriptionContent(transcriptionId);
        setContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcription');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [transcriptionId, status]);

  if (status !== 'completed') return null;

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="font-medium mb-4">Transcription Result</h3>
        {loading ? (
          <div className="flex justify-center p-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : content ? (
          <div className="prose prose-sm max-w-none">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No transcription content available</p>
        )}
      </div>
    </Card>
  );
}