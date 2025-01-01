import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptionStatus } from '@/lib/types';

interface FileProgress {
  fileName: string;
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  transcriptionStatus: TranscriptionStatus;
  error?: string;
}

interface UploadProgressProps {
  files: FileProgress[];
  className?: string;
}

export function UploadProgress({
  files,
  className,
}: UploadProgressProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {files.map((file, index) => (
        <div key={index} className="rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">{file.fileName}</h3>
          
          {/* Upload Progress */}
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
                <span className="text-sm text-muted-foreground">{file.uploadProgress}%</span>
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

          {/* Transcription Status */}
          {file.uploadStatus === 'success' && (
            <div className="flex items-center space-x-3 text-sm">
              {file.transcriptionStatus === 'pending' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                  <span>Waiting to process...</span>
                </>
              )}
              {file.transcriptionStatus === 'processing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Processing transcription...</span>
                </>
              )}
              {file.transcriptionStatus === 'completed' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Transcription complete</span>
                </>
              )}
              {file.transcriptionStatus === 'error' && (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>Transcription failed</span>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {file.error && (
            <div className="text-sm text-destructive">
              {file.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}