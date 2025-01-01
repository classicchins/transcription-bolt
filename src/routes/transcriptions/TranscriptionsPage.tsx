import React from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { TranscriptionFilters } from '@/components/transcriptions/TranscriptionFilters';
import { TranscriptionTable } from '@/components/transcriptions/TranscriptionTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { useTranscriptions } from '@/hooks/useTranscriptions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { downloadTranscription } from '@/lib/download-utils';
import type { Transcription } from '@/lib/types';

export function TranscriptionsPage() {
  useDocumentTitle('Transcriptions');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    transcriptions,
    loading,
    error,
    handleDelete,
    handleSearch,
    handleStatusFilter,
    handleSort
  } = useTranscriptions(user?.id);

  const handleDownload = (transcription: Transcription) => {
    downloadTranscription(transcription);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (transcriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Transcriptions</h1>
        </div>
        
        <EmptyState
          icon={FileText}
          title="No transcriptions yet"
          description="Upload an audio file to get started with transcription."
          action={{
            label: "Upload File",
            onClick: () => navigate('/dashboard/upload')
          }}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transcriptions</h1>
      </div>
      
      <TranscriptionFilters
        onSearch={handleSearch}
        onStatusChange={handleStatusFilter}
        onSortChange={handleSort}
      />

      <div className="rounded-md border">
        <TranscriptionTable
          transcriptions={transcriptions}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}