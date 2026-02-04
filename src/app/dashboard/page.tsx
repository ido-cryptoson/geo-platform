'use client';

import { MetricCard } from '@/components/dashboard/metric-card';
import { VisibilityChart } from '@/components/dashboard/visibility-chart';
import { RecentResults } from '@/components/dashboard/recent-results';
import { CompetitorTable } from '@/components/dashboard/competitor-table';
import { mockDashboardData } from '@/lib/mock-data';
import { Store, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { business, currentMetrics, previousMetrics, recentResults, competitors, trend } =
    mockDashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-500">
                  {business.cuisine_type} • {business.neighborhood}, {business.city}
                </p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Run Tracking
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Visibility Score"
            value={currentMetrics.visibility_score}
            previousValue={previousMetrics?.visibility_score}
            type="score"
            description="Overall AI search visibility"
          />
          <MetricCard
            title="Share of Voice"
            value={currentMetrics.share_of_voice}
            previousValue={previousMetrics?.share_of_voice}
            type="percentage"
            description="% of queries mentioning you"
          />
          <MetricCard
            title="Average Position"
            value={currentMetrics.average_position}
            previousValue={previousMetrics?.average_position}
            type="position"
            description="Where you appear in lists"
          />
          <MetricCard
            title="Mentions"
            value={currentMetrics.mention_count}
            suffix={`/ ${currentMetrics.total_queries}`}
            previousValue={previousMetrics?.mention_count}
            description="Times mentioned in AI responses"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Citation Rate"
            value={currentMetrics.citation_rate}
            previousValue={previousMetrics?.citation_rate}
            type="percentage"
            description="Mentions with website link"
          />
          <MetricCard
            title="Sentiment Score"
            value={currentMetrics.sentiment_score}
            previousValue={previousMetrics?.sentiment_score}
            type="percentage"
            description="Positive sentiment in mentions"
          />
          <MetricCard
            title="Competitor Gap"
            value={currentMetrics.competitor_gap}
            previousValue={previousMetrics?.competitor_gap}
            description="Points behind top competitor"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VisibilityChart data={trend} />
          <CompetitorTable competitors={competitors} results={recentResults} />
        </div>

        {/* Recent Results */}
        <RecentResults results={recentResults} />
      </main>
    </div>
  );
}
