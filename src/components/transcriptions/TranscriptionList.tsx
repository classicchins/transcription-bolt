import React from 'react';
import { FileText, AlertCircle, Clock, Loader2 } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import { formatTranscriptionStatus } from '@/lib/transcription-utils';
import { cn } from '@/lib/utils';

type Transcription = Database['public']['Tables']['transcriptions']['Row'] & {
  file: {
    name: string;
    size: number;
    type: string;
  } | null;
};

interface TranscriptionListProps {
  transcriptions: Transcription[];
  className?: string;
}

export function TranscriptionList({ transcriptions, className }: TranscriptionListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {transcriptions.map((transcription) => (
        <div
          key={transcription.id}
          className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {transcription.file?.name || 'Unknown file'}
              </p>
              <TranscriptionStatus status={transcription.status} />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                {(transcription.file?.size || 0) / 1024 / 1024} MB
              </span>
              <span>•</span>
              <span>
                {new Date(transcription.created_at).toLocaleDateString()}
              </span>
            </div>

            {transcription.content && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {transcription.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TranscriptionStatus({ status }: { status: Transcription['status'] }) {
  return (
    <div className={cn(
      "flex items-center rounded-full px-2 py-1 text-xs font-medium",
      status === 'completed' && "bg-green-50 text-green-700",
      status === 'processing' && "bg-blue-50 text-blue-700",
      status === 'pending' && "bg-yellow-50 text-yellow-700",
      status === 'error' && "bg-red-50 text-red-700"
    )}>
      {status === 'completed' && <FileText className="mr-1 h-3 w-3" />}
      {status === 'processing' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
      {status === 'error' && <AlertCircle className="mr-1 h-3 w-3" />}
      {formatTranscriptionStatus(status)}
    </div>
  );
}