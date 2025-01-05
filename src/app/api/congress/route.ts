import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    console.log('Incoming request URL:', req.url);
    console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
    
    const endpoint = url.searchParams.get('endpoint');
    if (!endpoint) {
      return NextResponse.json({ error: 'No endpoint provided' }, { status: 400 });
    }

    // Get all query parameters except 'endpoint'
    const queryParams = Array.from(url.searchParams.entries())
      .filter(([key]) => key !== 'endpoint')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const apiUrl = `https://api.congress.gov/v3${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    console.log('Fetching from Congress API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_CONGRESS_API_KEY!,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Congress API error:', {
        url: apiUrl,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { error: `Congress API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Congress API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Congress API', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
