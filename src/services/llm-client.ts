/**
 * LLM Client Service
 *
 * Handles communication with various LLM APIs.
 * Currently uses mock responses; real API integration coming soon.
 */

import { LLMPlatform } from '@/types/database';

export interface LLMQueryResult {
  platform: LLMPlatform;
  query: string;
  response: string;
  responseTimeMs: number;
  timestamp: string;
  error?: string;
}

interface LLMClientConfig {
  useMockResponses?: boolean;
  openaiApiKey?: string;
  perplexityApiKey?: string;
}

/**
 * LLM Client for querying AI platforms
 */
export class LLMClient {
  private config: LLMClientConfig;

  constructor(config: LLMClientConfig = {}) {
    this.config = {
      useMockResponses: config.useMockResponses ?? true, // Default to mocks
      ...config,
    };
  }

  /**
   * Query a specific LLM platform
   */
  async query(
    platform: LLMPlatform,
    query: string
  ): Promise<LLMQueryResult> {
    const startTime = Date.now();

    try {
      let response: string;

      if (this.config.useMockResponses) {
        response = await this.getMockResponse(platform, query);
      } else {
        response = await this.queryRealLLM(platform, query);
      }

      return {
        platform,
        query,
        response,
        responseTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        platform,
        query,
        response: '',
        responseTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Query multiple platforms in parallel
   */
  async queryMultiple(
    platforms: LLMPlatform[],
    query: string
  ): Promise<LLMQueryResult[]> {
    const results = await Promise.all(
      platforms.map(platform => this.query(platform, query))
    );
    return results;
  }

  /**
   * Get a mock response for testing
   */
  private async getMockResponse(
    platform: LLMPlatform,
    query: string
  ): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const normalizedQuery = query.toLowerCase();

    // Restaurant-related queries
    if (normalizedQuery.includes('italian') || normalizedQuery.includes('pasta')) {
      return this.getItalianRestaurantResponse(platform, query);
    }

    if (normalizedQuery.includes('mexican') || normalizedQuery.includes('tacos')) {
      return this.getMexicanRestaurantResponse(platform, query);
    }

    if (normalizedQuery.includes('japanese') || normalizedQuery.includes('sushi')) {
      return this.getJapaneseRestaurantResponse(platform, query);
    }

    // Generic restaurant response
    return this.getGenericRestaurantResponse(platform, query);
  }

  /**
   * Query real LLM APIs (to be implemented)
   */
  private async queryRealLLM(
    platform: LLMPlatform,
    query: string
  ): Promise<string> {
    switch (platform) {
      case 'chatgpt':
      case 'chatgpt_search':
        return this.queryChatGPT(query);
      case 'perplexity':
        return this.queryPerplexity(query);
      default:
        throw new Error(`Platform ${platform} not yet implemented`);
    }
  }

  /**
   * Query ChatGPT API
   */
  private async queryChatGPT(query: string): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides restaurant recommendations based on the user\'s location and preferences. Be specific and include real restaurant names when possible.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Query Perplexity API
   */
  private async queryPerplexity(query: string): Promise<string> {
    if (!this.config.perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Mock response generators

  private getItalianRestaurantResponse(platform: LLMPlatform, query: string): string {
    const city = this.extractCity(query) || 'the area';

    if (platform === 'perplexity') {
      return `Based on recent reviews and local recommendations, here are the top Italian restaurants in ${city}:

**Mario's Italian Kitchen** is a standout choice, known for their authentic handmade pasta and cozy atmosphere. Their carbonara and bolognese are particularly praised.

**Tony's Pizza Napoletana** offers award-winning Neapolitan-style pizza with multiple styles to choose from.

**Caffe Sport** has been a neighborhood favorite since 1969, serving generous portions of Sicilian-style dishes.

For a more upscale experience, **Flour + Water** offers a modern take on Italian cuisine with an incredible pasta tasting menu.

Sources: Yelp, TripAdvisor, local food blogs`;
    }

    return `Here are some of the best Italian restaurants in ${city}:

1. **Tony's Pizza Napoletana** - Award-winning pizzeria with 12 different styles of pizza
2. **Mario's Italian Kitchen** - Authentic family-run restaurant known for homemade pasta and traditional recipes
3. **Flour + Water** - Modern Italian with an incredible pasta tasting menu
4. **Caffe Sport** - Classic Sicilian-style dishes in a charming atmosphere
5. **Delfina** - Refined Italian classics in a welcoming setting

Each restaurant offers a unique dining experience, from traditional to modern interpretations of Italian cuisine.`;
  }

  private getMexicanRestaurantResponse(platform: LLMPlatform, query: string): string {
    const city = this.extractCity(query) || 'the area';

    return `For the best Mexican food in ${city}, consider these top options:

1. **La Taqueria** - Famous for their perfectly grilled carne asada tacos
2. **El Farolito** - Late-night favorite known for their massive burritos
3. **Nopalito** - Upscale Mexican using organic, local ingredients
4. **Tacolicious** - Modern taqueria with creative flavor combinations
5. **Taqueria Cancún** - Authentic street-style tacos and tortas

These spots range from casual street food to refined dining, all offering authentic Mexican flavors.`;
  }

  private getJapaneseRestaurantResponse(platform: LLMPlatform, query: string): string {
    const city = this.extractCity(query) || 'the area';

    return `Here are the best Japanese restaurants in ${city}:

1. **Sushi Ran** - Premium omakase experience with the freshest fish
2. **Ramen Shop** - Rich, flavorful broths and handmade noodles
3. **Ippuku** - Authentic izakaya with yakitori and sake
4. **Domo** - Traditional kaiseki dining
5. **Marufuku Ramen** - Hakata-style tonkotsu ramen

Whether you're craving sushi, ramen, or izakaya fare, these restaurants deliver authentic Japanese cuisine.`;
  }

  private getGenericRestaurantResponse(platform: LLMPlatform, query: string): string {
    const city = this.extractCity(query) || 'the area';

    return `Here are some highly recommended restaurants in ${city}:

1. **The Local Kitchen** - Farm-to-table American cuisine
2. **Bistro Central** - French-inspired comfort food
3. **Spice Route** - Flavorful Indian and Southeast Asian dishes
4. **Harbor Grill** - Fresh seafood with waterfront views
5. **The Steakhouse** - Prime cuts and classic sides

These restaurants offer diverse cuisines and consistently receive excellent reviews from locals and visitors alike.`;
  }

  private extractCity(query: string): string | null {
    // Common city patterns
    const patterns = [
      /in\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s+near|\s+area|$)/i,
      /near\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|$)/i,
      /([A-Z][a-zA-Z\s]+?)\s+(?:restaurant|food|dining)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }
}

// Export a default client instance
export const llmClient = new LLMClient();
