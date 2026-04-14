"use client";

import { InsightsDashboard } from '@/components/dashboard/Insights';

export default function InsightsPage() {
  return (
    <div className="flex-1 w-full h-full max-w-6xl mx-auto p-4 md:p-8 overflow-y-auto">
      <InsightsDashboard />
    </div>
  );
}
