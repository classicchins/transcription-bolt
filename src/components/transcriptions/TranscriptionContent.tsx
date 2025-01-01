import React from 'react';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useTranscriptionSync } from '@/lib/transcription/hooks/useTranscriptionSync';
import { useWordHighlight } from '@/lib/transcription/hooks/useWordHighlight';
import type { Transcription } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TranscriptionContentProps {
  transcription: Transcription;
  currentTime?: number;
  onTimeClick?: (time: number) => void;
  mediaElement?: HTMLMediaElement | null;
  className?: string;
}

export function TranscriptionContent({
  transcription,
  currentTime = 0,
  onTimeClick,
  mediaElement,
  className
}: TranscriptionContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const words = useTranscriptionSync(
    transcription.content,
    mediaElement?.duration
  );

  const scrollToWord = React.useCallback((index: number) => {
    if (index === -1 || !contentRef.current) return;
    
    const activeElement = contentRef.current.querySelector(`[data-word-index="${index}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, []);

  const activeWordIndex = useWordHighlight(words, currentTime, scrollToWord);

  if (transcription.status === 'pending' || transcription.status === 'processing') {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="sm" />
          <p className="text-sm text-muted-foreground">
            {transcription.status === 'pending' 
              ? 'Waiting to process transcription...'
              : 'Processing transcription...'}
          </p>
        </div>
      </Card>
    );
  }

  if (transcription.status === 'error') {
    return (
      <Card className={cn("p-6", className)}>
        <ErrorMessage message="Failed to process transcription" />
      </Card>
    );
  }

  if (!transcription.content) {
    return (
      <Card className={cn("p-6 text-center text-muted-foreground", className)}>
        <p>No transcription content available</p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div 
        ref={contentRef} 
        className="prose prose-sm max-w-none h-[400px] overflow-y-auto"
      >
        {words.map((word, index) => (
          <span
            key={word.id}
            data-word-index={index}
            data-time={word.start}
            onClick={() => onTimeClick?.(word.start)}
            className={cn(
              "inline-block mx-0.5 px-0.5 rounded cursor-pointer transition-colors duration-100",
              "hover:bg-yellow-50",
              index === activeWordIndex && "bg-yellow-100 font-medium"
            )}
          >
            {word.text}
          </span>
        ))}
      </div>
    </Card>
  );
}