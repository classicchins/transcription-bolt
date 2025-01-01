import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div className={cn("rounded-md bg-green-50 p-3", className)}>
      <div className="flex">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <div className="ml-3">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      </div>
    </div>
  );
}