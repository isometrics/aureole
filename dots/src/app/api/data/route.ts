import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

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
    
    // Server-side filtering with Fuse.js for high-quality search
    if (query.trim()) {
      const fuse = new Fuse(data.all_items, {
        keys: ['label', 'value'],
        threshold: 0.3, // Lower threshold = more strict matching
        includeScore: false, // Don't include scores for better performance
        ignoreLocation: true, // Search anywhere in the string
        useExtendedSearch: false, // Disable extended search for speed
        minMatchCharLength: 1, // Match single characters
      });

      const results = fuse.search(query, {
        limit: 50 // Limit results for performance
      });
      
      return NextResponse.json({
        ...data,
        all_items: results.map(result => result.item)
      });
    }
    
    // Return all data if no search query
    return NextResponse.json({
      ...data,
      all_items: data.all_items.slice(0, 50) // Limit initial results
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API server' },
      { status: 500 }
    );
  }
} 