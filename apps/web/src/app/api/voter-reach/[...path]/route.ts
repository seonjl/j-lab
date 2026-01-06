import { NextRequest, NextResponse } from 'next/server';

const ML_API_BASE = process.env.ML_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${ML_API_BASE}/api/voter-reach/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ML API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'ML API request failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Voter reach API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from ML API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const body = await request.json();
    const url = `${ML_API_BASE}/api/voter-reach/${pathString}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ML API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'ML API request failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Voter reach API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from ML API' },
      { status: 500 }
    );
  }
}
