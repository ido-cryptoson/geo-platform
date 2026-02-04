# GEO Platform - AI Search Visibility for Restaurants

Track and improve your restaurant's visibility in ChatGPT, Perplexity, and other AI search engines.

## What is GEO?

**Generative Engine Optimization (GEO)** is the process of optimizing your business to be recommended by AI-powered search engines like ChatGPT, Perplexity, Gemini, and others.

Unlike traditional SEO where you compete for rankings, GEO is about being **cited and recommended** in AI-generated responses.

## Features

- **AI Visibility Tracking**: Monitor when and how AI recommends your restaurant
- **Visibility Score**: Get a single 0-100 score representing your AI search presence
- **Competitor Analysis**: Compare your visibility against local competitors
- **Trend Charts**: Track improvement over time with weekly metrics
- **Evidence Reports**: Proof of value for every customer

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- OpenAI API key (for ChatGPT integration - optional for mock mode)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/geo-platform.git
cd geo-platform
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment example and configure:
```bash
cp .env.local.example .env.local
```

4. Set up Supabase (see instructions below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: geo-platform
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values to your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key

### 3. Run Database Migrations

The SQL migrations will be in `/supabase/migrations/` (coming soon)

```bash
# Using Supabase CLI (optional)
npx supabase db push
```

Or run the SQL directly in the Supabase SQL Editor.

## Project Structure

```
geo-platform/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard page
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Libraries and utilities
│   │   ├── supabase/     # Supabase client configuration
│   │   └── mock-data.ts  # Mock data for development
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── .env.local.example    # Environment variables template
```

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Project setup with Next.js, Tailwind, Supabase
- [x] Database schema design
- [x] Dashboard UI with mock data
- [ ] Customer onboarding flow
- [ ] ChatGPT API integration
- [ ] Response parser

### Phase 2: Multi-Platform
- [ ] Perplexity tracking
- [ ] Google AI Overviews tracking
- [ ] Sentiment analysis
- [ ] Enhanced dashboard

### Phase 3: Optimization Tools
- [ ] Listing health checker
- [ ] Schema markup generator
- [ ] FAQ content generator

## License

MIT

## Support

For questions or issues, please open a GitHub issue.
