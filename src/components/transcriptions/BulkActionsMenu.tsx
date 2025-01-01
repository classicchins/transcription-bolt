import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Transcription } from '@/lib/types';

interface BulkActionsMenuProps {
  selectedTranscriptions: Transcription[];
  onBulkDelete: () => void;
  onBulkDownload: (format: 'txt' | 'docx' | 'srt' | 'pdf') => void;
}

export function BulkActionsMenu({ 
  selectedTranscriptions, 
  onBulkDelete,
  onBulkDownload 
}: BulkActionsMenuProps) {
  const count = selectedTranscriptions.length;
  
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {count} item{count !== 1 ? 's' : ''} selected
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download As
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onBulkDownload('txt')}>
            Text File (.txt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBulkDownload('docx')}>
            Word Document (.docx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBulkDownload('srt')}>
            Subtitles (.srt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBulkDownload('pdf')}>
            PDF Document (.pdf)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant="destructive" 
        size="sm"
        onClick={onBulkDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  );
}