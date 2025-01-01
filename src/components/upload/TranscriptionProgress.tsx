import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranscriptionContent } from './TranscriptionContent';
import { cn } from '@/lib/utils';
import type { TranscriptionStatus } from '@/lib/types';

interface TranscriptionProgressProps {
  transcriptionId: string;
  status: TranscriptionStatus;
  error?: string;
  className?: string;
}

export function TranscriptionProgress({ 
  transcriptionId,
  status, 
  error, 
  className 
}: TranscriptionProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status === 'pending' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Waiting to start transcription...</span>
              </>
            )}
            {status === 'processing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Transcribing your file...</span>
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Transcription completed!</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">
                  {error || 'Failed to transcribe file'}
                </span>
              </>
            )}
          </div>
          
          {status === 'completed' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/transcriptions/${transcriptionId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transcription
              </Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Show transcription content when completed */}
      {status === 'completed' && (
        <TranscriptionContent
          transcriptionId={transcriptionId}
          status={status}
        />
      )}
    </div>
  );
}