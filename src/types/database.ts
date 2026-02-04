// Database types for GEO Platform

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  cuisine_type: string;
  city: string;
  neighborhood?: string;
  address?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  business_id: string;
  name: string;
  website_url?: string;
  created_at: string;
}

export interface Query {
  id: string;
  business_id: string;
  template: string;
  generated_query: string;
  query_type: 'best_in_city' | 'top_rated' | 'where_to_eat' | 'reviews' | 'dietary' | 'occasion' | 'dish_type';
  is_active: boolean;
  created_at: string;
}

export interface TrackingResult {
  id: string;
  query_id: string;
  business_id: string;
  llm_platform: 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'copilot' | 'grok';
  raw_response: string;
  is_mentioned: boolean;
  mention_position?: number; // 1 = first, 2 = second, etc.
  mention_text?: string;
  citation_url?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  competitor_mentions: CompetitorMention[];
  created_at: string;
}

export interface CompetitorMention {
  competitor_id: string;
  competitor_name: string;
  position?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface VisibilityMetrics {
  business_id: string;
  date: string;
  visibility_score: number; // 0-100
  share_of_voice: number; // 0-100 percentage
  average_position: number;
  mention_count: number;
  total_queries: number;
  citation_rate: number; // 0-100 percentage
  sentiment_score: number; // -100 to 100
  competitor_gap: number; // difference from top competitor
}

export interface Report {
  id: string;
  business_id: string;
  report_type: 'weekly' | 'monthly' | 'baseline' | 'comparison';
  start_date: string;
  end_date: string;
  metrics: VisibilityMetrics;
  previous_metrics?: VisibilityMetrics;
  pdf_url?: string;
  created_at: string;
}

// View models for the dashboard
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
