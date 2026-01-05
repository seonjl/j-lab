import { NextRequest, NextResponse } from 'next/server';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { params, n_simulations = 1000 } = body;

    const response = await fetch(
      `${ML_API_URL}/analysis/monte-carlo?n_simulations=${n_simulations}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Monte Carlo error:', error);
    return NextResponse.json(
      { error: 'Failed to run Monte Carlo simulation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${ML_API_URL}/analysis/monte-carlo/quick`);

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Monte Carlo quick error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Monte Carlo quick analysis' },
      { status: 500 }
    );
  }
}
