import React from 'react';
import { FileText, Clock, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatTranscriptionStatus, formatFileSize } from '@/lib/transcription-utils';
import type { Transcription } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TranscriptionGridProps {
  transcriptions: Transcription[];
  onDownload: (transcription: Transcription) => void;
  className?: string;
}

export function TranscriptionGrid({
  transcriptions,
  onDownload,
  className
}: TranscriptionGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {transcriptions.map((transcription) => (
        <Card key={transcription.id} className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium leading-none">
                  {transcription.file?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(transcription.file?.size || 0)}
                </p>
              </div>
              <div className={cn(
                "rounded-full px-2 py-1 text-xs font-medium",
                transcription.status === 'completed' && "bg-green-100 text-green-700",
                transcription.status === 'processing' && "bg-blue-100 text-blue-700",
                transcription.status === 'pending' && "bg-yellow-100 text-yellow-700",
                transcription.status === 'error' && "bg-red-100 text-red-700"
              )}>
                {formatTranscriptionStatus(transcription.status)}
              </div>
            </div>

            {transcription.content && (
              <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                {transcription.content}
              </p>
            )}

            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(transcription.created_at).toLocaleDateString()}
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <div className="flex space-x-2">
              {transcription.status === 'completed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDownload(transcription)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/dashboard/transcriptions/${transcription.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}