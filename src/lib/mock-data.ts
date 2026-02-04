// Mock data for development before Supabase is connected

import { Business, Competitor, TrackingResult, VisibilityMetrics, TrendData, DashboardData, CompetitorMention } from '@/types/database';

export const mockBusiness: Business = {
  id: '1',
  user_id: 'user-1',
  name: "Mario's Italian Kitchen",
  slug: 'marios-italian-kitchen',
  cuisine_type: 'Italian',
  city: 'San Francisco',
  neighborhood: 'North Beach',
  address: '123 Columbus Ave, San Francisco, CA 94133',
  website_url: 'https://mariositalian.com',
  is_active: true,
  tracking_enabled: true,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

export const mockCompetitors: Competitor[] = [
  {
    id: 'comp-1',
    business_id: '1',
    name: "Tony's Pizza Napoletana",
    website_url: 'https://tonyspizzanapoletana.com',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'comp-2',
    business_id: '1',
    name: "Caffe Sport",
    website_url: 'https://caffesport.com',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'comp-3',
    business_id: '1',
    name: "Original Joes",
    created_at: '2024-01-15T00:00:00Z',
  },
];

export const mockCurrentMetrics: VisibilityMetrics = {
  business_id: '1',
  date: new Date().toISOString().split('T')[0],
  visibility_score: 72,
  share_of_voice: 18.5,
  average_position: 3.2,
  mention_count: 45,
  total_queries: 100,
  citation_rate: 35,
  sentiment_score: 68,
  competitor_gap: -12, // 12 points behind top competitor
};

export const mockPreviousMetrics: VisibilityMetrics = {
  business_id: '1',
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  visibility_score: 58,
  share_of_voice: 12.3,
  average_position: 4.5,
  mention_count: 32,
  total_queries: 100,
  citation_rate: 22,
  sentiment_score: 55,
  competitor_gap: -22,
};

const mockCompetitorMentions1: CompetitorMention[] = [
  {
    id: 'cm-1',
    tracking_result_id: 'result-1',
    competitor_id: 'comp-1',
    competitor_name: "Tony's Pizza Napoletana",
    mention_position: 1,
    sentiment: 'positive',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cm-2',
    tracking_result_id: 'result-1',
    competitor_id: 'comp-2',
    competitor_name: 'Caffe Sport',
    mention_position: 3,
    sentiment: 'positive',
    created_at: new Date().toISOString(),
  },
];

export const mockTrackingResults: TrackingResult[] = [
  {
    id: 'result-1',
    query_id: 'query-1',
    business_id: '1',
    llm_platform: 'chatgpt',
    raw_response: "For the best Italian restaurants in San Francisco's North Beach, I'd recommend: 1. Tony's Pizza Napoletana - Known for their world champion pizza 2. Mario's Italian Kitchen - Excellent homemade pasta and authentic Italian atmosphere 3. Caffe Sport - A local favorite since 1969...",
    is_mentioned: true,
    mention_position: 2,
    mention_text: "Mario's Italian Kitchen - Excellent homemade pasta and authentic Italian atmosphere",
    has_citation: true,
    citation_url: 'https://mariositalian.com',
    sentiment: 'positive',
    query_timestamp: new Date().toISOString(),
    competitor_mentions: mockCompetitorMentions1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'result-2',
    query_id: 'query-2',
    business_id: '1',
    llm_platform: 'perplexity',
    raw_response: "Looking for authentic Italian food in North Beach? Here are top picks: Mario's Italian Kitchen stands out for their handmade pasta and cozy atmosphere. The restaurant has been a neighborhood staple for over a decade...",
    is_mentioned: true,
    mention_position: 1,
    mention_text: "Mario's Italian Kitchen stands out for their handmade pasta and cozy atmosphere",
    has_citation: false,
    sentiment: 'positive',
    query_timestamp: new Date().toISOString(),
    competitor_mentions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'result-3',
    query_id: 'query-3',
    business_id: '1',
    llm_platform: 'chatgpt',
    raw_response: "The best places for pasta in San Francisco include: 1. Flour + Water - Modern Italian with incredible handmade pasta 2. A16 - Neapolitan-style with great pasta dishes 3. Delfina - Classic Italian cuisine...",
    is_mentioned: false,
    has_citation: false,
    query_timestamp: new Date().toISOString(),
    competitor_mentions: [],
    created_at: new Date().toISOString(),
  },
];

export const mockTrendData: TrendData[] = [
  { date: '2024-01-08', visibility_score: 45, share_of_voice: 8.2, mentions: 18 },
  { date: '2024-01-15', visibility_score: 52, share_of_voice: 10.5, mentions: 24 },
  { date: '2024-01-22', visibility_score: 58, share_of_voice: 12.3, mentions: 32 },
  { date: '2024-01-29', visibility_score: 65, share_of_voice: 15.1, mentions: 38 },
  { date: '2024-02-05', visibility_score: 72, share_of_voice: 18.5, mentions: 45 },
];

export const mockDashboardData: DashboardData = {
  business: mockBusiness,
  currentMetrics: mockCurrentMetrics,
  previousMetrics: mockPreviousMetrics,
  recentResults: mockTrackingResults,
  competitors: mockCompetitors,
  trend: mockTrendData,
};

// Mock ChatGPT responses for testing the parser
export const mockChatGPTResponses = [
  {
    query: "best Italian restaurant in San Francisco",
    response: `Here are some of the best Italian restaurants in San Francisco:

1. **Tony's Pizza Napoletana** - Award-winning pizzeria in North Beach with 12 different styles of pizza
2. **Mario's Italian Kitchen** - Authentic family-run restaurant known for homemade pasta and traditional recipes
3. **Flour + Water** - Modern Italian with an incredible pasta tasting menu
4. **A16** - Neapolitan-style pizza and Southern Italian cuisine
5. **Delfina** - Mission District gem with refined Italian classics

Each offers a unique take on Italian cuisine, from traditional to modern interpretations.`,
  },
  {
    query: "where to eat pasta in North Beach San Francisco",
    response: `North Beach is San Francisco's Little Italy and has excellent pasta options:

**Mario's Italian Kitchen** is a standout for their handmade pasta - try their carbonara or bolognese. The atmosphere is cozy and authentic.

**Caffe Sport** has been serving Sicilian-style dishes since 1969, with generous portions.

**Original Joe's** offers classic Italian-American comfort food in a retro setting.

For pizza instead of pasta, **Tony's Pizza Napoletana** is world-famous.`,
  },
  {
    query: "Italian restaurants with outdoor seating San Francisco",
    response: `For Italian restaurants with outdoor seating in San Francisco:

1. **Caffe Trieste** - North Beach classic with sidewalk tables
2. **A16** - Great patio in the Marina
3. **Fiorella** - Multiple locations with outdoor dining
4. **SPQR** - Pacific Heights spot with heated patio

Note: Always call ahead to confirm outdoor seating availability as it can be weather-dependent.`,
  },
];
