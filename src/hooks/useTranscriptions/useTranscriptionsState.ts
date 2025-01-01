import { useState } from 'react';
import type { Transcription } from '@/lib/types';
import type { TranscriptionsState } from './types';

export function useTranscriptionsState() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [filteredTranscriptions, setFilteredTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  return {
    transcriptions,
    filteredTranscriptions,
    loading,
    error,
    deleting,
    setTranscriptions,
    setFilteredTranscriptions,
    setLoading,
    setError,
    setDeleting,
  };
}