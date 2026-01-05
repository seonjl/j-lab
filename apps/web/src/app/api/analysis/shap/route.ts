import { NextRequest, NextResponse } from 'next/server';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${ML_API_URL}/analysis/shap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SHAP analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SHAP analysis' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${ML_API_URL}/analysis/shap/summary`);

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SHAP summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SHAP summary' },
      { status: 500 }
    );
  }
}
