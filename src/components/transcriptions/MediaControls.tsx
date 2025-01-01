import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MediaControlsProps {
  playing: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  className?: string;
}

export function MediaControls({
  playing,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  className,
}: MediaControlsProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkipBack}
          title="Skip back 10 seconds"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          className="h-10 w-10"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSkipForward}
          title="Skip forward 10 seconds"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm tabular-nums">
          {formatTime(currentTime)}
        </span>
        
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          className="flex-1"
        />
        
        <span className="text-sm tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}