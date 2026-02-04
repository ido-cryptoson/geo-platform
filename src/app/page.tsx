import Link from 'next/link';
import { ArrowRight, BarChart3, Search, TrendingUp, Store } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">GEO Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/onboarding"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Search className="w-4 h-4" />
          AI Search Visibility for Restaurants
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Get Your Restaurant Recommended<br />
          by <span className="text-blue-600">ChatGPT</span> & AI Search
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Track when AI recommends your restaurant, see where you rank vs competitors,
          and get actionable insights to improve your visibility.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg text-lg font-medium border border-gray-200 hover:border-gray-300 transition-colors"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track AI Mentions
            </h3>
            <p className="text-gray-600">
              See exactly when ChatGPT, Perplexity, and other AI tools mention your restaurant.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Visibility Score
            </h3>
            <p className="text-gray-600">
              Get a single score (0-100) showing your overall AI search visibility with weekly trends.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Beat Competitors
            </h3>
            <p className="text-gray-600">
              Compare your visibility against local competitors and close the gap.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1 in 5</div>
              <div className="text-blue-100">Consumers use AI to find restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.4x</div>
              <div className="text-blue-100">Higher conversion from AI traffic</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">70%</div>
              <div className="text-blue-100">Of ChatGPT local results from Foursquare</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Simple, Affordable Pricing
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
          Built for restaurant owners, not enterprise marketing teams.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Starter</h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              $29<span className="text-lg font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1 location
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> ChatGPT tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Monthly reports
              </li>
            </ul>
            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Get Started
            </button>
          </div>

          <div className="bg-blue-600 p-8 rounded-xl shadow-lg transform md:-translate-y-2">
            <div className="text-blue-100 text-sm font-medium mb-2">Most Popular</div>
            <h3 className="font-semibold text-white mb-2">Growth</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $79<span className="text-lg font-normal text-blue-200">/mo</span>
            </div>
            <ul className="space-y-3 text-blue-100 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> 1 location
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> All AI platforms
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Weekly reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Competitor tracking
              </li>
            </ul>
            <button className="w-full py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              Get Started
            </button>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Multi</h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              $149<span className="text-lg font-normal text-gray-500">/mo</span>
            </div>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 3 locations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> All features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Priority support
              </li>
            </ul>
            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 GEO Platform. Built for restaurants who want to be found by AI.
        </div>
      </footer>
    </div>
  );
}
