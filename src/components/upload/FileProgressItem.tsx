import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranscriptionProgress } from '@/lib/transcription/hooks/useTranscriptionProgress';
import type { FileProgress } from '@/types/upload';

interface FileProgressItemProps {
  file: FileProgress;
  onRemove: (id: string) => void;
}

export function FileProgressItem({ file, onRemove }: FileProgressItemProps) {
  const { status: transcriptionStatus } = useTranscriptionProgress(file.transcriptionId);

  const canRemove = file.uploadStatus === 'error' || 
    (file.uploadStatus === 'success' && transcriptionStatus !== 'processing');

  return (
    <div className="relative rounded-lg border p-4 space-y-4">
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => onRemove(file.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}

      <div className="pr-8">
        <h3 className="font-medium truncate">{file.fileName}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {file.uploadStatus === 'uploading' && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            {file.uploadStatus === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {file.uploadStatus === 'error' && (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">
              {file.uploadStatus === 'uploading' && 'Uploading...'}
              {file.uploadStatus === 'success' && 'Upload complete'}
              {file.uploadStatus === 'error' && 'Upload failed'}
            </span>
          </div>
          {file.uploadStatus === 'uploading' && (
            <span className="text-sm text-muted-foreground">
              {file.uploadProgress}%
            </span>
          )}
        </div>

        <div className="h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              file.uploadStatus === 'uploading' && "bg-primary",
              file.uploadStatus === 'success' && "bg-green-500",
              file.uploadStatus === 'error' && "bg-destructive"
            )}
            style={{ width: `${file.uploadProgress}%` }}
          />
        </div>
      </div>

      {file.uploadStatus === 'success' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm">
            {transcriptionStatus === 'pending' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                <span>Waiting to process...</span>
              </>
            )}
            {transcriptionStatus === 'processing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Processing transcription...</span>
              </>
            )}
            {transcriptionStatus === 'completed' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Transcription complete</span>
              </>
            )}
            {transcriptionStatus === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span>Transcription failed</span>
              </>
            )}
          </div>

          {transcriptionStatus === 'completed' && file.transcriptionId && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="ml-4"
            >
              <Link to={`/dashboard/transcriptions/${file.transcriptionId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transcription
              </Link>
            </Button>
          )}
        </div>
      )}

      {file.error && (
        <div className="text-sm text-destructive">
          {file.error}
        </div>
      )}
    </div>
  );
}