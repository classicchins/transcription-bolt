import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function FileUploadZone({
  onFilesSelect,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB default
  className,
}: FileUploadZoneProps) {
  const [previews, setPreviews] = React.useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const validFiles = files.slice(0, maxFiles);
      setPreviews(validFiles);
      onFilesSelect(validFiles);
    },
    maxSize,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: maxFiles > 1,
  });

  const removeFile = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      onFilesSelect(newPreviews);
      return newPreviews;
    });
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed p-12 transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {previews.length > 0 ? (
        <div className="space-y-4">
          {previews.map((file, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {previews.length < maxFiles && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              Add more files
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop files"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse (max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each)
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC, MP4, MOV, AVI, MKV, WEBM
            </p>
          </div>
        </div>
      )}
    </div>
  );
}