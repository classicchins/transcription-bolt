import React from 'react';
import { FileProgressItem } from './FileProgressItem';
import { cn } from '@/lib/utils';
import type { FileProgress } from '@/types/upload';

interface FileProgressListProps {
  files: FileProgress[];
  onRemoveFile: (id: string) => void;
  className?: string;
}

export function FileProgressList({ files, onRemoveFile, className }: FileProgressListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {files.map((file) => (
        <FileProgressItem 
          key={file.id} 
          file={file} 
          onRemove={onRemoveFile}
        />
      ))}
    </div>
  );
}