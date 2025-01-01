import React from 'react';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { FileProgressList } from '@/components/upload/FileProgressList';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function UploadPage() {
  useDocumentTitle('Upload');
  const { fileProgresses, handleFilesSelect, removeFile } = useFileUpload();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
      </div>
      
      <div className="space-y-6">
        <FileUploadZone
          onFilesSelect={handleFilesSelect}
          className="min-h-[400px]"
        />

        {fileProgresses.length > 0 && (
          <FileProgressList 
            files={fileProgresses}
            onRemoveFile={removeFile}
          />
        )}
      </div>
    </div>
  );
}