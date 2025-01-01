import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadOptions } from './DownloadOptions';
import { TranscriptionStatusBadge } from './TranscriptionStatusBadge';
import { DeleteTranscriptionDialog } from './DeleteTranscriptionDialog';
import { formatFileSize } from '@/lib/transcription-utils';
import type { Transcription } from '@/lib/types';

interface TranscriptionTableRowProps {
  transcription: Transcription;
  onDelete: (transcription: Transcription) => Promise<void>;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

export function TranscriptionTableRow({ 
  transcription,
  onDelete,
  selected,
  onSelect
}: TranscriptionTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select ${transcription.file?.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{transcription.file?.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <TranscriptionStatusBadge status={transcription.status} />
      </TableCell>
      <TableCell>
        {formatFileSize(transcription.file?.size || 0)}
      </TableCell>
      <TableCell>
        {new Date(transcription.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          {transcription.status === 'completed' && (
            <DownloadOptions 
              transcription={transcription}
              onError={error => console.error(error)}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to={`/dashboard/transcriptions/${transcription.id}`}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
          <DeleteTranscriptionDialog
            fileName={transcription.file?.name || 'Unknown file'}
            onConfirm={() => onDelete(transcription)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}