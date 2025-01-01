import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={cn("rounded-md bg-destructive/15 p-3", className)}>
      <div className="flex">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <div className="ml-3">
          <p className="text-sm text-destructive">{message}</p>
        </div>
      </div>
    </div>
  );
}