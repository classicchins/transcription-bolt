import { cn } from "@/lib/utils";
import { formatTranscriptionStatus } from '@/lib/transcription-utils';
import type { TranscriptionStatus } from '@/lib/types';

interface TranscriptionStatusBadgeProps {
  status: TranscriptionStatus;
  className?: string;
}

export function TranscriptionStatusBadge({ status, className }: TranscriptionStatusBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      status === 'completed' && "bg-green-100 text-green-700",
      status === 'processing' && "bg-blue-100 text-blue-700",
      status === 'pending' && "bg-yellow-100 text-yellow-700",
      status === 'error' && "bg-red-100 text-red-700",
      className
    )}>
      {formatTranscriptionStatus(status)}
    </div>
  );
}