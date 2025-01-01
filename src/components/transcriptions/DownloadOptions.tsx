import React from 'react';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { downloadAsDocx } from '@/lib/download/formats/doc';
import { downloadTranscription } from '@/lib/download/utils';
import type { Transcription } from '@/lib/types';

interface DownloadOptionsProps {
  transcription: Transcription;
  onError?: (error: string) => void;
}

export function DownloadOptions({ transcription, onError }: DownloadOptionsProps) {
  const handleDownload = async (format: 'txt' | 'docx' | 'srt' | 'pdf') => {
    try {
      if (format === 'docx') {
        await downloadAsDocx(transcription);
      } else {
        const result = downloadTranscription(transcription, { format });
        if (!result.success && result.error) {
          onError?.(result.error);
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Download failed');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload('txt')}>
          Download as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('docx')}>
          Download as DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('srt')}>
          Download as SRT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('pdf')}>
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}