// Database types for GEO Platform
// These types match the Supabase schema in /supabase/migrations/001_initial_schema.sql

// ============================================
// ENUMS
// ============================================

export type PlanType = 'free' | 'starter' | 'growth' | 'multi' | 'agency';

export type QueryType =
  | 'best_in_city'
  | 'top_rated'
  | 'where_to_eat'
  | 'reviews'
  | 'dietary'
  | 'occasion'
  | 'dish_type'
  | 'custom';

export type LLMPlatform =
  | 'chatgpt'
  | 'chatgpt_search'
  | 'perplexity'
  | 'gemini'
  | 'claude'
  | 'copilot'
  | 'grok'
  | 'ai_overviews';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type ReportType = 'weekly' | 'monthly' | 'baseline' | 'comparison';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// ============================================
// DATABASE TABLES
// ============================================

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  company_name?: string;
  plan: PlanType;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  cuisine_type?: string;
  city: string;
  neighborhood?: string;
  address?: string;
  website_url?: string;
  phone?: string;

  // Listing URLs
  foursquare_url?: string;
  yelp_url?: string;
  google_business_url?: string;
  tripadvisor_url?: string;

  // Settings
  is_active: boolean;
  tracking_enabled: boolean;

  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  business_id: string;
  name: string;
  website_url?: string;
  cuisine_type?: string;
  created_at: string;
}

export interface QueryTemplate {
  id: string;
  business_id: string;
  template: string;
  generated_query: string;
  query_type: QueryType;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface TrackingResult {
  id: string;
  query_id: string;
  business_id: string;
  llm_platform: LLMPlatform;

  // Response data
  raw_response?: string;
  response_hash?: string;

  // Mention analysis
  is_mentioned: boolean;
  mention_position?: number;
  mention_text?: string;

  // Citation
  has_citation: boolean;
  citation_url?: string;

  // Sentiment
  sentiment?: Sentiment;
  sentiment_score?: number;

  // Metadata
  query_timestamp: string;
  response_time_ms?: number;

  created_at: string;

  // Joined data (not in DB, added by queries)
  competitor_mentions?: CompetitorMention[];
}

export interface CompetitorMention {
  id: string;
  tracking_result_id: string;
  competitor_id?: string;
  competitor_name: string;
  mention_position?: number;
  mention_text?: string;
  sentiment?: Sentiment;
  created_at: string;
}

export interface DailyMetrics {
  id: string;
  business_id: string;
  date: string;

  // Core metrics
  visibility_score: number;
  share_of_voice: number;
  average_position: number;

  // Counts
  mention_count: number;
  total_queries: number;
  citation_count: number;

  // Derived metrics
  mention_rate: number;
  citation_rate: number;
  sentiment_score: number;

  // Competitor comparison
  competitor_gap: number;

  // Platform breakdown
  platform_breakdown?: PlatformBreakdown;

  created_at: string;
}

export interface PlatformBreakdown {
  [platform: string]: {
    mentions: number;
    position: number;
    sentiment?: number;
  };
}

export interface Report {
  id: string;
  business_id: string;
  report_type: ReportType;
  title?: string;
  start_date: string;
  end_date: string;

  // Metrics snapshot
  metrics: DailyMetrics;
  previous_metrics?: DailyMetrics;

  // Report content
  summary?: string;
  recommendations?: string[];

  // PDF storage
  pdf_storage_path?: string;
  pdf_url?: string;

  // Status
  status: 'generating' | 'generated' | 'sent' | 'failed';
  sent_at?: string;

  created_at: string;
}

export interface TrackingJob {
  id: string;
  business_id: string;
  job_type: 'full_scan' | 'incremental' | 'single_query';
  status: JobStatus;
  queries_total: number;
  queries_completed: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

// ============================================
// VIEW MODELS (for UI)
// ============================================

// Simplified metrics for dashboard display
export interface VisibilityMetrics {
  business_id: string;
  date: string;
  visibility_score: number;
  share_of_voice: number;
  average_position: number;
  mention_count: number;
  total_queries: number;
  citation_rate: number;
  sentiment_score: number;
  competitor_gap: number;
}

export interface DashboardData {
  business: Business;
  currentMetrics: VisibilityMetrics;
  previousMetrics?: VisibilityMetrics;
  recentResults: TrackingResult[];
  competitors: Competitor[];
  trend: TrendData[];
}

export interface TrendData {
  date: string;
  visibility_score: number;
  share_of_voice: number;
  mentions: number;
}

// ============================================
// API TYPES
// ============================================

export interface CreateBusinessInput {
  name: string;
  cuisine_type?: string;
  city: string;
  neighborhood?: string;
  address?: string;
  website_url?: string;
  competitors?: string[]; // Competitor names
}

export interface TrackingResultWithCompetitors extends TrackingResult {
  competitor_mentions: CompetitorMention[];
  query?: QueryTemplate;
}

// For the response parser
export interface ParsedResponse {
  is_mentioned: boolean;
  mention_position?: number;
  mention_text?: string;
  has_citation: boolean;
  citation_url?: string;
  sentiment?: Sentiment;
  sentiment_score?: number;
  competitor_mentions: {
    name: string;
    position?: number;
    mention_text?: string;
    sentiment?: Sentiment;
  }[];
}
