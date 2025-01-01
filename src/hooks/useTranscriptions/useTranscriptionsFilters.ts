import { useCallback } from 'react';
import type { Transcription, TranscriptionStatus } from '@/lib/types';

export function useTranscriptionsFilters(
  transcriptions: Transcription[],
  setFilteredTranscriptions: (transcriptions: Transcription[]) => void
) {
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredTranscriptions(transcriptions);
      return;
    }

    const searchTerm = query.toLowerCase();
    setFilteredTranscriptions(
      transcriptions.filter(t => 
        t.file?.name.toLowerCase().includes(searchTerm) ||
        t.content?.toLowerCase().includes(searchTerm)
      )
    );
  }, [transcriptions, setFilteredTranscriptions]);

  const handleStatusFilter = useCallback((status: TranscriptionStatus | 'all') => {
    if (status === 'all') {
      setFilteredTranscriptions(transcriptions);
      return;
    }

    setFilteredTranscriptions(
      transcriptions.filter(t => t.status === status)
    );
  }, [transcriptions, setFilteredTranscriptions]);

  const handleSort = useCallback((sort: 'newest' | 'oldest') => {
    setFilteredTranscriptions(prev => 
      [...prev].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sort === 'newest' ? dateB - dateA : dateA - dateB;
      })
    );
  }, [setFilteredTranscriptions]);

  return {
    handleSearch,
    handleStatusFilter,
    handleSort
  };
}