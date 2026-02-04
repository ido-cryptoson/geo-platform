'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrackingResult } from '@/types/database';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface RecentResultsProps {
  results: TrackingResult[];
}

const platformLogos: Record<string, string> = {
  chatgpt: '🤖',
  perplexity: '🔮',
  gemini: '✨',
  claude: '🧠',
  copilot: '💻',
  grok: '⚡',
};

const platformNames: Record<string, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
  claude: 'Claude',
  copilot: 'Copilot',
  grok: 'Grok',
};

export function RecentResults({ results }: RecentResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tracking Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tracking results yet. Results will appear after queries run.
            </p>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="text-2xl">
                  {platformLogos[result.llm_platform] || '🔍'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {platformNames[result.llm_platform] || result.llm_platform}
                    </span>
                    {result.is_mentioned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Mentioned
                        {result.mention_position && ` #${result.mention_position}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        Not Found
                      </span>
                    )}
                    {result.sentiment && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          result.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : result.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {result.sentiment}
                      </span>
                    )}
                  </div>
                  {result.mention_text && (
                    <p className="text-sm text-gray-600 italic mb-2">
                      "{result.mention_text}"
                    </p>
                  )}
                  {result.citation_url && (
                    <a
                      href={result.citation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {result.citation_url}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDistanceToNow(parseISO(result.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
