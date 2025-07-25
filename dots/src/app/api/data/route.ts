import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';

// Server-side cache with 24-hour TTL
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Check if we have valid cached data
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      // Use cached data for search
      if (query.trim()) {
        const fuse = new Fuse(cachedData.all_items, {
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
          ...cachedData,
          all_items: results.map(result => result.item)
        });
      }
      
      // Return cached data for initial load
      return NextResponse.json({
        ...cachedData,
        all_items: cachedData.all_items.slice(0, 50)
      });
    }

    // Cache expired or doesn't exist - fetch fresh data from backend API
    console.log('Cache miss - fetching fresh data from backend API');
    const response = await fetch('http://localhost:5001/api/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the fresh data
    cachedData = data;
    cacheTimestamp = now;
    console.log('Data cached with timestamp:', new Date(cacheTimestamp).toISOString());
    
    // Server-side filtering with Fuse.js for high-quality search
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
    
    // Return all data if no search query
    return NextResponse.json({
      ...data,
      all_items: data.all_items.slice(0, 50)
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API server' },
      { status: 500 }
    );
  }
}
