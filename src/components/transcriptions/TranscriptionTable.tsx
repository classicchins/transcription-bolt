import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { TranscriptionTableHeader } from './TranscriptionTableHeader';
import { TranscriptionTableRow } from './TranscriptionTableRow';
import { BulkActionsMenu } from './BulkActionsMenu';
import { bulkDownload } from '@/lib/download/bulk-download';
import type { Transcription } from '@/lib/types';

interface TranscriptionTableProps {
  transcriptions: Transcription[];
  onDelete: (transcription: Transcription) => Promise<void>;
  className?: string;
}

export function TranscriptionTable({
  transcriptions,
  onDelete,
  className
}: TranscriptionTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  
  const selectedTranscriptions = transcriptions.filter(t => 
    selectedIds.has(t.id)
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(transcriptions.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (transcription: Transcription, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(transcription.id);
    } else {
      newSelected.delete(transcription.id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected transcriptions?`)) return;
    
    for (const transcription of selectedTranscriptions) {
      await onDelete(transcription);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDownload = async (format: 'txt' | 'doc' | 'srt' | 'pdf') => {
    await bulkDownload(selectedTranscriptions, format);
  };

  return (
    <div className="space-y-4">
      <BulkActionsMenu
        selectedTranscriptions={selectedTranscriptions}
        onBulkDelete={handleBulkDelete}
        onBulkDownload={handleBulkDownload}
      />

      <Table className={className}>
        <TranscriptionTableHeader
          onSelectAll={handleSelectAll}
          allSelected={selectedIds.size === transcriptions.length}
          hasSelections={selectedIds.size > 0}
        />
        <TableBody>
          {transcriptions.map((transcription) => (
            <TranscriptionTableRow
              key={transcription.id}
              transcription={transcription}
              onDelete={onDelete}
              selected={selectedIds.has(transcription.id)}
              onSelect={(checked) => handleSelect(transcription, checked)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}