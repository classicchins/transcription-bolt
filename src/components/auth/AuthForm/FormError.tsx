import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="rounded-md bg-destructive/15 p-3">
      <div className="flex">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <div className="ml-3">
          <p className="text-sm text-destructive">{message}</p>
        </div>
      </div>
    </div>
  );
}