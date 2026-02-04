'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Competitor, TrackingResult } from '@/types/database';

interface CompetitorTableProps {
  competitors: Competitor[];
  results: TrackingResult[];
}

export function CompetitorTable({ competitors, results }: CompetitorTableProps) {
  // Calculate competitor metrics from results
  const competitorMetrics = competitors.map(comp => {
    const mentions = results.flatMap(r =>
      r.competitor_mentions.filter(m => m.competitor_id === comp.id)
    );

    const mentionCount = mentions.length;
    const positions = mentions
      .filter(m => m.position !== undefined)
      .map(m => m.position!);
    const avgPosition = positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : null;

    const sentiments = mentions.filter(m => m.sentiment);
    const positiveCount = sentiments.filter(m => m.sentiment === 'positive').length;
    const sentimentScore = sentiments.length > 0
      ? Math.round((positiveCount / sentiments.length) * 100)
      : null;

    return {
      ...comp,
      mentionCount,
      avgPosition,
      sentimentScore,
    };
  });

  // Sort by mention count
  competitorMetrics.sort((a, b) => b.mentionCount - a.mentionCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitor Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Competitor
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  Mentions
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  Avg Position
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody>
              {competitorMetrics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No competitors added yet
                  </td>
                </tr>
              ) : (
                competitorMetrics.map((comp, index) => (
                  <tr
                    key={comp.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{comp.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {comp.mentionCount}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {comp.avgPosition !== null ? (
                        <span className="font-semibold text-gray-900">
                          #{comp.avgPosition.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {comp.sentimentScore !== null ? (
                        <span
                          className={`font-semibold ${
                            comp.sentimentScore >= 70
                              ? 'text-green-600'
                              : comp.sentimentScore >= 40
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {comp.sentimentScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
