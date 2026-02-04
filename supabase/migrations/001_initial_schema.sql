-- GEO Platform Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================
-- Note: Supabase handles auth.users automatically
-- We just need a profiles table for additional user data

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'multi', 'agency')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESSES (Restaurants)
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  cuisine_type TEXT,
  city TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  website_url TEXT,
  phone TEXT,

  -- Listing URLs for optimization tracking
  foursquare_url TEXT,
  yelp_url TEXT,
  google_business_url TEXT,
  tripadvisor_url TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  tracking_enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

-- Index for faster lookups
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_city ON businesses(city);

-- ============================================
-- COMPETITORS
-- ============================================
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT,
  cuisine_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, name)
);

CREATE INDEX idx_competitors_business_id ON competitors(business_id);

-- ============================================
-- QUERY TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS query_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  template TEXT NOT NULL,  -- e.g., "best {cuisine} restaurant in {city}"
  generated_query TEXT NOT NULL,  -- e.g., "best Italian restaurant in San Francisco"
  query_type TEXT NOT NULL CHECK (query_type IN (
    'best_in_city',
    'top_rated',
    'where_to_eat',
    'reviews',
    'dietary',
    'occasion',
    'dish_type',
    'custom'
  )),

  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,  -- Higher = more important

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, generated_query)
);

CREATE INDEX idx_query_templates_business_id ON query_templates(business_id);
CREATE INDEX idx_query_templates_active ON query_templates(is_active) WHERE is_active = true;

-- ============================================
-- TRACKING RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL REFERENCES query_templates(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  llm_platform TEXT NOT NULL CHECK (llm_platform IN (
    'chatgpt',
    'chatgpt_search',
    'perplexity',
    'gemini',
    'claude',
    'copilot',
    'grok',
    'ai_overviews'
  )),

  -- Response data
  raw_response TEXT,
  response_hash TEXT,  -- To detect changes

  -- Mention analysis
  is_mentioned BOOLEAN DEFAULT false,
  mention_position INTEGER,  -- 1 = first, 2 = second, etc.
  mention_text TEXT,  -- The exact text mentioning the business

  -- Citation
  has_citation BOOLEAN DEFAULT false,
  citation_url TEXT,

  -- Sentiment
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2),  -- -1.0 to 1.0

  -- Metadata
  query_timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_results_business_id ON tracking_results(business_id);
CREATE INDEX idx_tracking_results_query_id ON tracking_results(query_id);
CREATE INDEX idx_tracking_results_platform ON tracking_results(llm_platform);
CREATE INDEX idx_tracking_results_created_at ON tracking_results(created_at DESC);
CREATE INDEX idx_tracking_results_mentioned ON tracking_results(is_mentioned) WHERE is_mentioned = true;

-- ============================================
-- COMPETITOR MENTIONS (from tracking results)
-- ============================================
CREATE TABLE IF NOT EXISTS competitor_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_result_id UUID NOT NULL REFERENCES tracking_results(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES competitors(id) ON DELETE SET NULL,

  competitor_name TEXT NOT NULL,  -- Store name even if competitor record deleted
  mention_position INTEGER,
  mention_text TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_mentions_result_id ON competitor_mentions(tracking_result_id);
CREATE INDEX idx_competitor_mentions_competitor_id ON competitor_mentions(competitor_id);

-- ============================================
-- DAILY METRICS (Aggregated)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Core metrics
  visibility_score INTEGER CHECK (visibility_score >= 0 AND visibility_score <= 100),
  share_of_voice DECIMAL(5,2),  -- Percentage
  average_position DECIMAL(4,2),

  -- Counts
  mention_count INTEGER DEFAULT 0,
  total_queries INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,

  -- Derived metrics
  mention_rate DECIMAL(5,2),  -- Percentage
  citation_rate DECIMAL(5,2),  -- Percentage
  sentiment_score INTEGER,  -- 0-100

  -- Competitor comparison
  competitor_gap INTEGER,  -- Points behind/ahead of top competitor

  -- Platform breakdown (JSONB for flexibility)
  platform_breakdown JSONB,
  -- Example: {"chatgpt": {"mentions": 10, "position": 2.5}, "perplexity": {"mentions": 5, "position": 1.8}}

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, date)
);

CREATE INDEX idx_daily_metrics_business_id ON daily_metrics(business_id);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'baseline', 'comparison')),
  title TEXT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Metrics snapshot
  metrics JSONB NOT NULL,
  previous_metrics JSONB,

  -- Report content
  summary TEXT,
  recommendations JSONB,

  -- PDF storage
  pdf_storage_path TEXT,
  pdf_url TEXT,

  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_business_id ON reports(business_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- TRACKING JOBS (for scheduling)
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  job_type TEXT NOT NULL CHECK (job_type IN ('full_scan', 'incremental', 'single_query')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  queries_total INTEGER DEFAULT 0,
  queries_completed INTEGER DEFAULT 0,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_jobs_business_id ON tracking_jobs(business_id);
CREATE INDEX idx_tracking_jobs_status ON tracking_jobs(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Businesses: Users can only access their own businesses
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Competitors: Access through business ownership
CREATE POLICY "Users can view competitors of own businesses" ON competitors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = competitors.business_id AND businesses.user_id = auth.uid())
  );

CREATE POLICY "Users can manage competitors of own businesses" ON competitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = competitors.business_id AND businesses.user_id = auth.uid())
  );

-- Query templates: Access through business ownership
CREATE POLICY "Users can view queries of own businesses" ON query_templates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = query_templates.business_id AND businesses.user_id = auth.uid())
  );

CREATE POLICY "Users can manage queries of own businesses" ON query_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = query_templates.business_id AND businesses.user_id = auth.uid())
  );

-- Tracking results: Access through business ownership
CREATE POLICY "Users can view tracking results of own businesses" ON tracking_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tracking_results.business_id AND businesses.user_id = auth.uid())
  );

CREATE POLICY "Users can manage tracking results of own businesses" ON tracking_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tracking_results.business_id AND businesses.user_id = auth.uid())
  );

-- Competitor mentions: Access through tracking results -> business
CREATE POLICY "Users can view competitor mentions" ON competitor_mentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tracking_results tr
      JOIN businesses b ON b.id = tr.business_id
      WHERE tr.id = competitor_mentions.tracking_result_id AND b.user_id = auth.uid()
    )
  );

-- Daily metrics: Access through business ownership
CREATE POLICY "Users can view metrics of own businesses" ON daily_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = daily_metrics.business_id AND businesses.user_id = auth.uid())
  );

-- Reports: Access through business ownership
CREATE POLICY "Users can view reports of own businesses" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = reports.business_id AND businesses.user_id = auth.uid())
  );

-- Tracking jobs: Access through business ownership
CREATE POLICY "Users can view jobs of own businesses" ON tracking_jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = tracking_jobs.business_id AND businesses.user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================

-- Uncomment to insert sample data for testing:
/*
-- Note: You'll need to replace 'YOUR_USER_ID' with an actual auth.users id

INSERT INTO businesses (user_id, name, slug, cuisine_type, city, neighborhood, website_url)
VALUES
  ('YOUR_USER_ID', 'Mario''s Italian Kitchen', 'marios-italian-kitchen', 'Italian', 'San Francisco', 'North Beach', 'https://mariositalian.com');

-- Get the business ID and add competitors
-- INSERT INTO competitors (business_id, name) VALUES ('BUSINESS_ID', 'Tony''s Pizza Napoletana');
*/
