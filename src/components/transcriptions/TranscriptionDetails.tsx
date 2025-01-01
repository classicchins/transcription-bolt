import React from 'react';
import { FileText, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Transcription } from '@/lib/types';
import { formatTranscriptionStatus } from '@/lib/transcription-utils';
import { cn } from '@/lib/utils';

interface TranscriptionDetailsProps {
  transcription: Transcription;
  className?: string;
}

export function TranscriptionDetails({ transcription, className }: TranscriptionDetailsProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDownload = async () => {
    if (!transcription.content) return;
    
    try {
      setDownloading(true);
      setError(null);

      // Create blob and download
      const blob = new Blob([transcription.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription-${transcription.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download transcription');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {transcription.file?.name || 'Unknown file'}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(transcription.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {transcription.status === 'completed' && (
            <Button
              onClick={handleDownload}
              disabled={downloading || !transcription.content}
            >
              {downloading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={cn(
        "flex items-center rounded-lg border p-4",
        transcription.status === 'completed' && "bg-green-50 border-green-200",
        transcription.status === 'processing' && "bg-blue-50 border-blue-200",
        transcription.status === 'pending' && "bg-yellow-50 border-yellow-200",
        transcription.status === 'error' && "bg-red-50 border-red-200"
      )}>
        <div className="flex-1">
          <p className="font-medium">
            Status: {formatTranscriptionStatus(transcription.status)}
          </p>
          {transcription.status === 'pending' && (
            <p className="text-sm text-muted-foreground">
              Your file is queued for transcription
            </p>
          )}
          {transcription.status === 'processing' && (
            <p className="text-sm text-muted-foreground">
              We're processing your file. This may take a few minutes
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {transcription.status === 'completed' && transcription.content && (
        <div className="rounded-lg border bg-card p-4">
          <pre className="whitespace-pre-wrap text-sm">
            {transcription.content}
          </pre>
        </div>
      )}

      {/* Error */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}