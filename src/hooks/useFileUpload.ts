import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useAuth } from './useAuth';
import { uploadService } from '@/lib/upload/services/upload-service';
import type { FileProgress, UploadStatus } from '@/types/upload';

export function useFileUpload() {
  const { user } = useAuth();
  const [fileProgresses, setFileProgresses] = useState<FileProgress[]>([]);

  const updateFileProgress = useCallback((
    id: string,
    updates: Partial<FileProgress>
  ) => {
    setFileProgresses(prev => prev.map(fp => 
      fp.id === id ? { ...fp, ...updates } : fp
    ));
  }, []);

  const handleFilesSelect = async (files: File[]) => {
    if (!user || files.length === 0) return;

    // Create initial progress entries
    const newProgresses = files.map(file => ({
      id: nanoid(),
      file,
      fileName: file.name,
      uploadProgress: 0,
      uploadStatus: 'uploading' as UploadStatus,
      transcriptionStatus: 'pending' as const,
      transcriptionId: null
    }));

    setFileProgresses(prev => [...prev, ...newProgresses]);

    // Process each file
    await Promise.all(newProgresses.map(async (progress) => {
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          updateFileProgress(progress.id, {
            uploadProgress: (prev) => Math.min((prev || 0) + 10, 90)
          });
        }, 500);

        // Upload file
        const result = await uploadService.uploadFile(progress.file, user.id);
        clearInterval(progressInterval);

        if (result.errors?.length) {
          updateFileProgress(progress.id, {
            uploadStatus: 'error',
            uploadProgress: 0,
            error: result.errors[0].error
          });
        } else {
          const transcriptionId = result.data[0]?.transcription_id;
          updateFileProgress(progress.id, {
            uploadStatus: 'success',
            uploadProgress: 100,
            transcriptionId,
            transcriptionStatus: 'pending'
          });
        }
      } catch (err) {
        updateFileProgress(progress.id, {
          uploadStatus: 'error',
          uploadProgress: 0,
          error: err instanceof Error ? err.message : 'Upload failed'
        });
      }
    }));
  };

  const removeFile = useCallback((id: string) => {
    setFileProgresses(prev => prev.filter(fp => fp.id !== id));
  }, []);

  return {
    fileProgresses,
    handleFilesSelect,
    removeFile
  };
}