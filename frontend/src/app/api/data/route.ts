import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';

/**
 * Server-side in-memory cache for API data
 * This cache stores the fetched data from the backend API to avoid repeated calls
 * and improve search performance significantly.
 */

// Cache storage for the API response data
let cachedData: any = null;

// Timestamp when the cache was last updated (used for TTL calculation)
let cacheTimestamp: number = 0;

// Cache duration: 24 hours in milliseconds
// After this time, the cache expires and fresh data will be fetched
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * GET handler for the /api/data endpoint
 * Implements server-side caching with 24-hour TTL and high-quality fuzzy search
 * 
 * @param request - The incoming HTTP request
 * @returns NextResponse with filtered data or error
 */
export async function GET(request: Request) {
  try {
    // Extract search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Check if we have valid cached data (not expired)
    const now = Date.now();
    const isCacheValid = cachedData && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (isCacheValid) {
      // Cache hit - use cached data for search operations
      console.log('Cache hit - using cached data for search');
      
      if (query.trim()) {
        // Perform fuzzy search on cached data using Fuse.js
        const fuse = new Fuse(cachedData.all_items, {
          keys: ['label', 'value'],        // Search in both label and value fields
          threshold: 0.3,                  // Lower threshold = more strict matching (0.0 = exact, 1.0 = very loose)
          includeScore: false,             // Don't include scores for better performance
          ignoreLocation: true,            // Search anywhere in the string, not just beginning
          useExtendedSearch: false,        // Disable extended search for speed
          minMatchCharLength: 1,           // Match single characters
        });

        // Execute search with result limit for performance
        const results = fuse.search(query, {
          limit: 50 // Limit results to prevent overwhelming the client
        });
        
        // Return search results with original metadata
        return NextResponse.json({
          ...cachedData,
          all_items: results.map(result => result.item)
        });
      }
      
      // No search query - return initial data from cache
      return NextResponse.json({
        ...cachedData,
        all_items: cachedData.all_items.slice(0, 50) // Limit initial results
      });
    }

    // Cache miss or expired - fetch fresh data from backend API
    console.log('Cache miss - fetching fresh data from backend API');
    const response = await fetch('http://localhost:4995/api/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the fresh data from backend
    const data = await response.json();
    
    // Update cache with fresh data and timestamp
    cachedData = data;
    cacheTimestamp = now;
    console.log('Data cached with timestamp:', new Date(cacheTimestamp).toISOString());
    
    // Perform search on fresh data if query exists
    if (query.trim()) {
      const fuse = new Fuse(data.all_items, {
        keys: ['label', 'value'],
        threshold: 0.3,
        includeScore: false,
        ignoreLocation: true,
        useExtendedSearch: false,
        minMatchCharLength: 1,
      });

      const results = fuse.search(query, {
        limit: 50
      });
      
      return NextResponse.json({
        ...data,
        all_items: results.map(result => result.item)
      });
    }
    
    // No search query - return fresh data with limit
    return NextResponse.json({
      ...data,
      all_items: data.all_items.slice(0, 50)
    });
  } catch (error) {
    // Log error for debugging and return error response
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API server' },
      { status: 500 }
    );
  }
}
