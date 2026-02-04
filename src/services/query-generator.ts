/**
 * Query Generator Service
 *
 * Generates relevant search queries for restaurants based on their attributes.
 * These queries mimic what real users ask AI assistants about local restaurants.
 */

import { Business, QueryTemplate, QueryType } from '@/types/database';

// Query template patterns
const QUERY_TEMPLATES: Record<QueryType, string[]> = {
  best_in_city: [
    'best {cuisine} restaurant in {city}',
    'best {cuisine} food in {city}',
    'top {cuisine} restaurants in {city}',
    'where to get the best {cuisine} in {city}',
    'best places for {cuisine} in {city}',
  ],
  top_rated: [
    'top rated {cuisine} restaurant in {city}',
    'highest rated {cuisine} in {city}',
    'most popular {cuisine} restaurant in {city}',
    'best reviewed {cuisine} in {city}',
  ],
  where_to_eat: [
    'where to eat {cuisine} in {city}',
    'where to eat {cuisine} in {neighborhood}',
    'good {cuisine} places in {city}',
    '{cuisine} restaurant recommendations in {city}',
    'recommend a {cuisine} restaurant in {city}',
  ],
  reviews: [
    '{business_name} reviews',
    '{business_name} {city} reviews',
    'is {business_name} good',
    'what do people say about {business_name}',
  ],
  dietary: [
    '{cuisine} restaurant with vegetarian options in {city}',
    '{cuisine} restaurant with vegan options in {city}',
    'gluten free {cuisine} in {city}',
    '{cuisine} restaurant with healthy options in {city}',
  ],
  occasion: [
    '{cuisine} restaurant for date night in {city}',
    '{cuisine} restaurant for family dinner in {city}',
    '{cuisine} restaurant for business lunch in {city}',
    'romantic {cuisine} restaurant in {city}',
    '{cuisine} restaurant with private dining in {city}',
  ],
  dish_type: [
    'best pasta in {city}',
    'best pizza in {city}',
    'best seafood in {city}',
    'best steak in {city}',
    'best sushi in {city}',
    'best tacos in {city}',
    'best burgers in {city}',
  ],
  custom: [],
};

// Cuisine-specific dish queries
const CUISINE_DISHES: Record<string, string[]> = {
  Italian: ['pasta', 'pizza', 'risotto', 'tiramisu', 'lasagna', 'carbonara'],
  Mexican: ['tacos', 'burritos', 'enchiladas', 'guacamole', 'quesadillas'],
  Japanese: ['sushi', 'ramen', 'tempura', 'udon', 'yakitori'],
  Chinese: ['dim sum', 'dumplings', 'noodles', 'kung pao chicken', 'fried rice'],
  Indian: ['curry', 'biryani', 'naan', 'tikka masala', 'samosas'],
  Thai: ['pad thai', 'curry', 'tom yum', 'spring rolls', 'satay'],
  American: ['burgers', 'steaks', 'ribs', 'mac and cheese', 'wings'],
  French: ['croissants', 'escargot', 'coq au vin', 'crêpes', 'soufflé'],
  Mediterranean: ['hummus', 'falafel', 'shawarma', 'kebabs', 'tabbouleh'],
  Korean: ['korean bbq', 'bibimbap', 'kimchi', 'bulgogi', 'fried chicken'],
  Vietnamese: ['pho', 'banh mi', 'spring rolls', 'bun', 'com tam'],
  Greek: ['gyros', 'souvlaki', 'moussaka', 'tzatziki', 'baklava'],
};

interface GenerateQueriesOptions {
  maxQueries?: number;
  includeCompetitorQueries?: boolean;
  competitorNames?: string[];
}

/**
 * Generate a set of queries for a restaurant
 */
export function generateQueriesForBusiness(
  business: Business,
  options: GenerateQueriesOptions = {}
): Omit<QueryTemplate, 'id' | 'created_at'>[] {
  const {
    maxQueries = 50,
    includeCompetitorQueries = false,
    competitorNames = [],
  } = options;

  const queries: Omit<QueryTemplate, 'id' | 'created_at'>[] = [];
  const cuisine = business.cuisine_type || 'restaurant';
  const city = business.city;
  const neighborhood = business.neighborhood || city;
  const businessName = business.name;

  const variables = {
    cuisine: cuisine.toLowerCase(),
    city,
    neighborhood,
    business_name: businessName,
  };

  // Generate queries from templates
  const queryTypes: QueryType[] = [
    'best_in_city',
    'top_rated',
    'where_to_eat',
    'reviews',
    'dietary',
    'occasion',
  ];

  for (const queryType of queryTypes) {
    const templates = QUERY_TEMPLATES[queryType];
    for (const template of templates) {
      const generatedQuery = fillTemplate(template, variables);

      // Skip if we already have this query
      if (queries.some(q => q.generated_query === generatedQuery)) {
        continue;
      }

      queries.push({
        business_id: business.id,
        template,
        generated_query: generatedQuery,
        query_type: queryType,
        is_active: true,
        priority: getPriorityForQueryType(queryType),
      });

      if (queries.length >= maxQueries) {
        return queries;
      }
    }
  }

  // Add cuisine-specific dish queries
  const dishes = CUISINE_DISHES[cuisine] || CUISINE_DISHES['American'];
  for (const dish of dishes.slice(0, 3)) {
    const generatedQuery = `best ${dish} in ${city}`;
    if (!queries.some(q => q.generated_query === generatedQuery)) {
      queries.push({
        business_id: business.id,
        template: 'best {dish} in {city}',
        generated_query: generatedQuery,
        query_type: 'dish_type',
        is_active: true,
        priority: 2,
      });
    }

    if (queries.length >= maxQueries) {
      return queries;
    }
  }

  // Add comparison queries with competitors
  if (includeCompetitorQueries && competitorNames.length > 0) {
    for (const competitor of competitorNames.slice(0, 3)) {
      const comparisonQuery = `${businessName} vs ${competitor}`;
      queries.push({
        business_id: business.id,
        template: '{business_name} vs {competitor}',
        generated_query: comparisonQuery,
        query_type: 'custom',
        is_active: true,
        priority: 1,
      });

      if (queries.length >= maxQueries) {
        return queries;
      }
    }
  }

  return queries;
}

/**
 * Fill a template string with variables
 */
function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Get priority for query type (higher = more important)
 */
function getPriorityForQueryType(queryType: QueryType): number {
  const priorities: Record<QueryType, number> = {
    best_in_city: 5,
    top_rated: 4,
    where_to_eat: 4,
    reviews: 3,
    dietary: 2,
    occasion: 2,
    dish_type: 2,
    custom: 1,
  };
  return priorities[queryType] || 1;
}

/**
 * Generate a "fan-out" set of queries from a seed query
 * This mimics how real users ask follow-up questions
 */
export function generateFanOutQueries(
  seedQuery: string,
  business: Business
): string[] {
  const city = business.city;
  const neighborhood = business.neighborhood || city;
  const cuisine = business.cuisine_type || 'restaurant';

  // Base modifications
  const fanOut: string[] = [
    seedQuery,
    `${seedQuery} 2024`,
    `${seedQuery} near me`,
    `${seedQuery} open now`,
    `${seedQuery} with good reviews`,
  ];

  // Location variations
  if (neighborhood !== city) {
    fanOut.push(seedQuery.replace(city, neighborhood));
  }

  // Add specificity
  if (!seedQuery.includes('best')) {
    fanOut.push(`best ${seedQuery}`);
  }

  if (!seedQuery.includes('top')) {
    fanOut.push(`top ${seedQuery}`);
  }

  return [...new Set(fanOut)]; // Remove duplicates
}

/**
 * Get a sample set of queries for testing/demo purposes
 */
export function getSampleQueries(business: Business): string[] {
  const cuisine = (business.cuisine_type || 'restaurant').toLowerCase();
  const city = business.city;
  const neighborhood = business.neighborhood || city;

  return [
    `best ${cuisine} restaurant in ${city}`,
    `top rated ${cuisine} in ${city}`,
    `where to eat ${cuisine} in ${neighborhood}`,
    `${cuisine} restaurant recommendations ${city}`,
    `good ${cuisine} places near ${neighborhood}`,
    `${business.name} reviews`,
    `best ${cuisine} for date night ${city}`,
    `${cuisine} restaurant with vegetarian options ${city}`,
  ];
}
