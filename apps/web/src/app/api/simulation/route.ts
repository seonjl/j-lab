import { NextRequest, NextResponse } from 'next/server';
import { getSimulationData } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startYear = parseInt(searchParams.get('startYear') || '2024');
  const endYear = parseInt(searchParams.get('endYear') || '2072');

  try {
    const data = await getSimulationData(startYear, endYear);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
