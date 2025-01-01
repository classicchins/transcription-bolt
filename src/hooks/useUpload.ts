import { useState } from 'react';
import { uploadFiles } from '@/lib/upload-utils';
import type { UploadError } from '@/lib/types';

interface UseUploadOptions {
  onSuccess?: () => void;
  onError?: (errors: UploadError[]) => void;
}

export function useUpload({ onSuccess, onError }: UseUploadOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<UploadError[]>([]);

  const upload = async (files: File[], userId: string) => {
    if (!userId || files.length === 0) return;

    setStatus('uploading');
    setErrors([]);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const { errors } = await uploadFiles(files, userId);

      clearInterval(progressInterval);
      
      if (errors) {
        setErrors(errors);
        setStatus('error');
        onError?.(errors);
      } else {
        setProgress(100);
        setStatus('success');
        onSuccess?.();
      }
    } catch (err) {
      clearInterval(progressInterval);
      setStatus('error');
      const error = {
        fileName: 'Upload',
        error: err instanceof Error ? err.message : 'Failed to upload files'
      };
      setErrors([error]);
      onError?.([error]);
    }
  };

  return {
    upload,
    status,
    progress,
    errors,
    reset: () => {
      setStatus('idle');
      setProgress(0);
      setErrors([]);
    }
  };
}