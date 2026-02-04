/**
 * Tracking Service
 *
 * Orchestrates the full tracking workflow:
 * 1. Generate queries for a business
 * 2. Execute queries against LLM platforms
 * 3. Parse responses for mentions
 * 4. Store results and calculate metrics
 */

import { Business, Competitor, TrackingResult, LLMPlatform, ParsedResponse } from '@/types/database';
import { generateQueriesForBusiness, getSampleQueries } from './query-generator';
import { parseResponse, aggregateParseResults } from './response-parser';
import { LLMClient, LLMQueryResult } from './llm-client';

export interface TrackingJobConfig {
  platforms: LLMPlatform[];
  maxQueries?: number;
  runsPerQuery?: number;
}

export interface TrackingJobResult {
  business: Business;
  results: TrackingResult[];
  metrics: {
    mentionRate: number;
    avgPosition: number;
    citationRate: number;
    sentimentScore: number;
    totalQueries: number;
    totalMentions: number;
  };
  duration: number;
}

const DEFAULT_CONFIG: TrackingJobConfig = {
  platforms: ['chatgpt', 'perplexity'],
  maxQueries: 20,
  runsPerQuery: 1,
};

/**
 * Run a full tracking job for a business
 */
export async function runTrackingJob(
  business: Business,
  competitors: Competitor[],
  config: Partial<TrackingJobConfig> = {}
): Promise<TrackingJobResult> {
  const startTime = Date.now();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const platforms = mergedConfig.platforms;
  const maxQueries = mergedConfig.maxQueries ?? 20;
  const runsPerQuery = mergedConfig.runsPerQuery ?? 1;

  const client = new LLMClient({ useMockResponses: true });
  const competitorNames = competitors.map(c => c.name);

  // Generate queries
  const queryTemplates = generateQueriesForBusiness(business, {
    maxQueries,
    includeCompetitorQueries: competitorNames.length > 0,
    competitorNames,
  });

  const queries = queryTemplates.slice(0, maxQueries);
  const results: TrackingResult[] = [];
  const parsedResponses: ParsedResponse[] = [];

  // Execute queries
  for (const query of queries) {
    for (let run = 0; run < runsPerQuery; run++) {
      for (const platform of platforms) {
        const llmResult = await client.query(platform, query.generated_query);

        if (llmResult.error) {
          console.error(`Query failed: ${llmResult.error}`);
          continue;
        }

        // Parse the response
        const parsed = parseResponse(llmResult.response, {
          businessName: business.name,
          websiteUrl: business.website_url,
          competitorNames,
        });

        parsedResponses.push(parsed);

        // Create tracking result
        const result: TrackingResult = {
          id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          query_id: query.template, // Would be actual query ID from DB
          business_id: business.id,
          llm_platform: platform,
          raw_response: llmResult.response,
          is_mentioned: parsed.is_mentioned,
          mention_position: parsed.mention_position,
          mention_text: parsed.mention_text,
          has_citation: parsed.has_citation,
          citation_url: parsed.citation_url,
          sentiment: parsed.sentiment,
          sentiment_score: parsed.sentiment_score,
          query_timestamp: llmResult.timestamp,
          response_time_ms: llmResult.responseTimeMs,
          created_at: new Date().toISOString(),
          competitor_mentions: parsed.competitor_mentions.map((m, i) => ({
            id: `cm-${Date.now()}-${i}`,
            tracking_result_id: `result-${Date.now()}`,
            competitor_id: competitors.find(c => c.name === m.name)?.id,
            competitor_name: m.name,
            mention_position: m.position,
            mention_text: m.mention_text,
            sentiment: m.sentiment,
            created_at: new Date().toISOString(),
          })),
        };

        results.push(result);
      }
    }
  }

  // Calculate aggregate metrics
  const aggregated = aggregateParseResults(parsedResponses);

  return {
    business,
    results,
    metrics: {
      ...aggregated,
      totalQueries: results.length,
      totalMentions: results.filter(r => r.is_mentioned).length,
    },
    duration: Date.now() - startTime,
  };
}

/**
 * Run a quick test tracking with sample queries
 */
export async function runQuickTest(
  business: Business,
  competitors: Competitor[] = []
): Promise<TrackingJobResult> {
  return runTrackingJob(business, competitors, {
    platforms: ['chatgpt'],
    maxQueries: 5,
    runsPerQuery: 1,
  });
}

/**
 * Calculate visibility score from metrics
 */
export function calculateVisibilityScore(metrics: {
  mentionRate: number;
  avgPosition: number;
  citationRate: number;
  sentimentScore: number;
}): number {
  const { mentionRate, avgPosition, citationRate, sentimentScore } = metrics;

  // Position score: 1st = 100, 2nd = 80, 3rd = 60, etc.
  const positionScore = avgPosition > 0 ? Math.max(0, 100 - (avgPosition - 1) * 20) : 0;

  // Weighted formula
  const score =
    mentionRate * 0.4 +
    positionScore * 0.3 +
    sentimentScore * 0.2 +
    citationRate * 0.1;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Format tracking results for display
 */
export function formatResultsForDisplay(results: TrackingResult[]): {
  mentioned: TrackingResult[];
  notMentioned: TrackingResult[];
  byPlatform: Record<LLMPlatform, TrackingResult[]>;
} {
  const mentioned = results.filter(r => r.is_mentioned);
  const notMentioned = results.filter(r => !r.is_mentioned);

  const byPlatform: Record<string, TrackingResult[]> = {};
  for (const result of results) {
    if (!byPlatform[result.llm_platform]) {
      byPlatform[result.llm_platform] = [];
    }
    byPlatform[result.llm_platform].push(result);
  }

  return {
    mentioned,
    notMentioned,
    byPlatform: byPlatform as Record<LLMPlatform, TrackingResult[]>,
  };
}
