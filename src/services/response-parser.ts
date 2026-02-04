/**
 * Response Parser Service
 *
 * Parses LLM responses to extract:
 * - Business mentions and positions
 * - Citations/URLs
 * - Sentiment analysis
 * - Competitor mentions
 */

import { ParsedResponse, Sentiment } from '@/types/database';

interface ParseOptions {
  businessName: string;
  businessAliases?: string[];
  websiteUrl?: string;
  competitorNames?: string[];
}

/**
 * Parse an LLM response to extract mention data
 */
export function parseResponse(
  response: string,
  options: ParseOptions
): ParsedResponse {
  const { businessName, businessAliases = [], websiteUrl, competitorNames = [] } = options;

  // All possible names for the business
  const allNames = [businessName, ...businessAliases].filter(Boolean);

  // Find business mention
  const mentionResult = findMention(response, allNames);

  // Find citation
  const citationResult = findCitation(response, websiteUrl);

  // Analyze sentiment of the mention
  const sentimentResult = mentionResult.is_mentioned
    ? analyzeSentiment(mentionResult.mention_text || response, businessName)
    : { sentiment: undefined, sentiment_score: undefined };

  // Find competitor mentions
  const competitorMentions = competitorNames.map(name => {
    const compMention = findMention(response, [name]);
    const compSentiment = compMention.is_mentioned
      ? analyzeSentiment(compMention.mention_text || '', name)
      : { sentiment: undefined };

    return {
      name,
      position: compMention.mention_position,
      mention_text: compMention.mention_text,
      sentiment: compSentiment.sentiment,
    };
  }).filter(m => m.position !== undefined);

  return {
    is_mentioned: mentionResult.is_mentioned,
    mention_position: mentionResult.mention_position,
    mention_text: mentionResult.mention_text,
    has_citation: citationResult.has_citation,
    citation_url: citationResult.citation_url,
    sentiment: sentimentResult.sentiment,
    sentiment_score: sentimentResult.sentiment_score,
    competitor_mentions: competitorMentions,
  };
}

/**
 * Find a business mention in the response
 */
function findMention(
  response: string,
  names: string[]
): { is_mentioned: boolean; mention_position?: number; mention_text?: string } {
  const normalizedResponse = response.toLowerCase();

  for (const name of names) {
    const normalizedName = name.toLowerCase();

    // Check for exact match (case-insensitive)
    if (normalizedResponse.includes(normalizedName)) {
      const position = findPositionInList(response, name);
      const mentionText = extractMentionContext(response, name);

      return {
        is_mentioned: true,
        mention_position: position,
        mention_text: mentionText,
      };
    }

    // Check for fuzzy match (handles minor variations)
    const fuzzyMatch = fuzzyMatchName(normalizedResponse, normalizedName);
    if (fuzzyMatch) {
      const position = findPositionInList(response, fuzzyMatch);
      const mentionText = extractMentionContext(response, fuzzyMatch);

      return {
        is_mentioned: true,
        mention_position: position,
        mention_text: mentionText,
      };
    }
  }

  return { is_mentioned: false };
}

/**
 * Find the position of a business in a numbered/bulleted list
 */
function findPositionInList(response: string, name: string): number | undefined {
  const lines = response.split('\n');
  const normalizedName = name.toLowerCase();

  // Patterns for numbered lists
  const numberPatterns = [
    /^(\d+)\.\s*/,           // "1. " or "1."
    /^\*\*(\d+)\.\*\*\s*/,   // "**1.**"
    /^#(\d+)\s*/,            // "#1"
    /^(\d+)\)\s*/,           // "1)"
  ];

  // Patterns for bullet lists (count position)
  const bulletPatterns = [
    /^[-*•]\s*/,             // "- " or "* " or "• "
    /^\*\*[-*•]\*\*\s*/,     // "**-**" etc
  ];

  let bulletPosition = 0;

  for (const line of lines) {
    const normalizedLine = line.toLowerCase();

    // Check numbered patterns
    for (const pattern of numberPatterns) {
      const match = line.match(pattern);
      if (match && normalizedLine.includes(normalizedName)) {
        return parseInt(match[1], 10);
      }
    }

    // Check bullet patterns
    for (const pattern of bulletPatterns) {
      if (pattern.test(line)) {
        bulletPosition++;
        if (normalizedLine.includes(normalizedName)) {
          return bulletPosition;
        }
      }
    }

    // Check for bold names that might indicate position
    const boldMatch = line.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && normalizedLine.includes(normalizedName)) {
      // If we haven't found a number, estimate based on line position
      const lineIndex = lines.indexOf(line);
      return lineIndex + 1;
    }
  }

  // If mentioned but not in a list, return 1 (first/only mention)
  if (response.toLowerCase().includes(normalizedName)) {
    return 1;
  }

  return undefined;
}

/**
 * Extract the context around a mention
 */
function extractMentionContext(response: string, name: string): string {
  const normalizedResponse = response.toLowerCase();
  const normalizedName = name.toLowerCase();
  const index = normalizedResponse.indexOf(normalizedName);

  if (index === -1) return '';

  // Find the sentence or line containing the mention
  const lines = response.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes(normalizedName)) {
      // Clean up the line
      return line
        .replace(/^[\d\.\-\*•#\s]+/, '')  // Remove list markers
        .replace(/\*\*/g, '')              // Remove bold markers
        .trim();
    }
  }

  // Fallback: extract surrounding text
  const start = Math.max(0, index - 50);
  const end = Math.min(response.length, index + name.length + 100);
  return response.slice(start, end).trim();
}

/**
 * Fuzzy match a name (handles apostrophes, common variations)
 */
function fuzzyMatchName(text: string, name: string): string | null {
  // Remove common characters that might vary
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[''"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedText = normalize(text);
  const normalizedName = normalize(name);

  if (normalizedText.includes(normalizedName)) {
    // Find the original form in the text
    const regex = new RegExp(
      name.split('').map(c => {
        if (c === "'" || c === "'") return "[''']?";
        if (c === ' ') return '\\s+';
        return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }).join(''),
      'i'
    );

    const match = text.match(regex);
    return match ? match[0] : name;
  }

  return null;
}

/**
 * Find citations/URLs in the response
 */
function findCitation(
  response: string,
  websiteUrl?: string
): { has_citation: boolean; citation_url?: string } {
  // Look for markdown links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(response)) !== null) {
    const url = match[2];
    if (websiteUrl && url.includes(new URL(websiteUrl).hostname)) {
      return { has_citation: true, citation_url: url };
    }
  }

  // Look for plain URLs
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = response.match(urlPattern) || [];

  for (const url of urls) {
    if (websiteUrl && url.includes(new URL(websiteUrl).hostname)) {
      return { has_citation: true, citation_url: url };
    }
  }

  // Check if any URL was found (even if not matching business website)
  if (urls.length > 0) {
    return { has_citation: true, citation_url: urls[0] };
  }

  return { has_citation: false };
}

/**
 * Simple sentiment analysis based on keywords
 */
function analyzeSentiment(
  text: string,
  businessName: string
): { sentiment?: Sentiment; sentiment_score?: number } {
  const normalizedText = text.toLowerCase();

  // Positive indicators
  const positiveWords = [
    'best', 'excellent', 'amazing', 'fantastic', 'great', 'wonderful',
    'outstanding', 'superb', 'delicious', 'authentic', 'favorite',
    'highly recommended', 'must-visit', 'top-notch', 'incredible',
    'perfect', 'love', 'loved', 'standout', 'gem', 'exceptional',
    'award-winning', 'renowned', 'famous', 'popular', 'beloved',
  ];

  // Negative indicators
  const negativeWords = [
    'worst', 'terrible', 'awful', 'bad', 'poor', 'disappointing',
    'avoid', 'overpriced', 'mediocre', 'underwhelming', 'slow',
    'rude', 'dirty', 'cold', 'bland', 'stale', 'not recommended',
    'skip', 'pass', 'overrated', 'inconsistent',
  ];

  // Neutral/mixed indicators
  const neutralWords = [
    'okay', 'decent', 'average', 'fair', 'alright', 'fine',
    'reasonable', 'typical', 'standard', 'basic',
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (const word of positiveWords) {
    if (normalizedText.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (normalizedText.includes(word)) negativeCount++;
  }

  for (const word of neutralWords) {
    if (normalizedText.includes(word)) neutralCount++;
  }

  // Calculate sentiment
  const total = positiveCount + negativeCount + neutralCount;

  if (total === 0) {
    return { sentiment: 'neutral', sentiment_score: 0.5 };
  }

  const score = (positiveCount - negativeCount) / Math.max(total, 1);
  const normalizedScore = (score + 1) / 2; // Convert from -1..1 to 0..1

  let sentiment: Sentiment;
  if (normalizedScore >= 0.6) {
    sentiment = 'positive';
  } else if (normalizedScore <= 0.4) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    sentiment_score: Math.round(normalizedScore * 100) / 100,
  };
}

/**
 * Parse multiple responses and aggregate results
 */
export function aggregateParseResults(results: ParsedResponse[]): {
  mentionRate: number;
  avgPosition: number;
  citationRate: number;
  sentimentScore: number;
} {
  const mentions = results.filter(r => r.is_mentioned);
  const citations = results.filter(r => r.has_citation);
  const positions = mentions
    .filter(r => r.mention_position !== undefined)
    .map(r => r.mention_position!);
  const sentiments = mentions
    .filter(r => r.sentiment_score !== undefined)
    .map(r => r.sentiment_score!);

  return {
    mentionRate: results.length > 0 ? (mentions.length / results.length) * 100 : 0,
    avgPosition: positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 0,
    citationRate: mentions.length > 0 ? (citations.length / mentions.length) * 100 : 0,
    sentimentScore: sentiments.length > 0
      ? (sentiments.reduce((a, b) => a + b, 0) / sentiments.length) * 100
      : 50,
  };
}
