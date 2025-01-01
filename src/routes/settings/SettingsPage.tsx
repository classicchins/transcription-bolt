import React from 'react';
import { Settings } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function SettingsPage() {
  useDocumentTitle('Settings');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <EmptyState
        icon={Settings}
        title="Coming Soon"
        description="Account settings and preferences will be available here."
        className="min-h-[400px]"
      />
    </div>
  );
}