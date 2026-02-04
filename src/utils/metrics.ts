import { VisibilityMetrics, TrackingResult } from '@/types/database';

/**
 * Calculate the change percentage between two values
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate visibility score (0-100) based on tracking results
 * Weighted formula:
 * - Mention rate: 40%
 * - Position score: 30%
 * - Sentiment score: 20%
 * - Citation rate: 10%
 */
export function calculateVisibilityScore(
  mentionRate: number,
  avgPosition: number,
  sentimentScore: number,
  citationRate: number
): number {
  // Position score: 1st = 100, 2nd = 80, 3rd = 60, etc.
  const positionScore = avgPosition > 0 ? Math.max(0, 100 - (avgPosition - 1) * 20) : 0;

  const score =
    mentionRate * 0.4 +
    positionScore * 0.3 +
    sentimentScore * 0.2 +
    citationRate * 0.1;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Calculate metrics from tracking results
 */
export function calculateMetricsFromResults(
  businessId: string,
  results: TrackingResult[]
): VisibilityMetrics {
  const totalQueries = results.length;
  const mentions = results.filter(r => r.is_mentioned);
  const mentionCount = mentions.length;

  // Mention rate (0-100)
  const mentionRate = totalQueries > 0 ? (mentionCount / totalQueries) * 100 : 0;

  // Average position (only for mentions)
  const positions = mentions
    .filter(r => r.mention_position !== undefined)
    .map(r => r.mention_position!);
  const avgPosition = positions.length > 0
    ? positions.reduce((a, b) => a + b, 0) / positions.length
    : 0;

  // Citation rate (mentions with URLs)
  const citations = mentions.filter(r => r.citation_url);
  const citationRate = mentionCount > 0 ? (citations.length / mentionCount) * 100 : 0;

  // Sentiment score (-100 to 100, normalized to 0-100)
  const sentiments = mentions.filter(r => r.sentiment);
  const sentimentValues: number[] = sentiments.map(r => {
    if (r.sentiment === 'positive') return 100;
    if (r.sentiment === 'negative') return 0;
    return 50;
  });
  const sentimentScore = sentimentValues.length > 0
    ? sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length
    : 50;

  // Share of voice (simplified - just mention rate for now)
  const shareOfVoice = mentionRate;

  // Visibility score
  const visibilityScore = calculateVisibilityScore(
    mentionRate,
    avgPosition,
    sentimentScore,
    citationRate
  );

  return {
    business_id: businessId,
    date: new Date().toISOString().split('T')[0],
    visibility_score: visibilityScore,
    share_of_voice: Math.round(shareOfVoice * 10) / 10,
    average_position: Math.round(avgPosition * 10) / 10,
    mention_count: mentionCount,
    total_queries: totalQueries,
    citation_rate: Math.round(citationRate),
    sentiment_score: Math.round(sentimentScore),
    competitor_gap: 0, // Calculated separately with competitor data
  };
}

/**
 * Format a number with + or - prefix for changes
 */
export function formatChange(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return '0%';
}

/**
 * Get color class based on change direction
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-500';
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 70) return 'bg-green-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
}
