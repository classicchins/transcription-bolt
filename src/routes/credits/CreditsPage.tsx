import React from 'react';
import { CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function CreditsPage() {
  useDocumentTitle('Credits');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
      </div>
      
      <EmptyState
        icon={CreditCard}
        title="No credit history"
        description="Your credit usage and purchases will appear here."
        className="min-h-[400px]"
      />
    </div>
  );
}