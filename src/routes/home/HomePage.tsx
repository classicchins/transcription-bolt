import React from 'react';
import { FileText, Clock, CreditCard, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getTranscriptions } from '@/lib/transcription-utils';
import type { Transcription } from '@/lib/types';

export function HomePage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useStats(user?.id);
  const [transcriptions, setTranscriptions] = React.useState<Transcription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const { data, error } = await getTranscriptions(user.id);
        if (error) throw error;
        setTranscriptions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading || statsLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || statsError) {
    return <ErrorMessage message={error || statsError || 'An error occurred'} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Transcriptions"
          value={stats?.totalTranscriptions || 0}
          icon={FileText}
          description="All time transcriptions"
        />
        <StatsCard
          title="Completed"
          value={stats?.completedTranscriptions || 0}
          icon={FileText}
          description="Successfully transcribed"
        />
        <StatsCard
          title="In Progress"
          value={stats?.processingTranscriptions || 0}
          icon={Loader2}
          description="Currently processing"
        />
        <StatsCard
          title="Failed"
          value={stats?.failedTranscriptions || 0}
          icon={CreditCard}
          description="Failed transcriptions"
        />
      </div>

      <RecentActivity
        transcriptions={transcriptions.slice(0, 5)}
      />
    </div>
  );
}