import { NextRequest, NextResponse } from 'next/server';
import { getPopulationByYear, getPopulationRange } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  const startYear = searchParams.get('startYear');
  const endYear = searchParams.get('endYear');
  const category = searchParams.get('category') || 'total';

  try {
    if (year) {
      // 단일 연도 조회
      const data = await getPopulationByYear(parseInt(year));
      return NextResponse.json({ data });
    }

    if (startYear && endYear) {
      // 연도 범위 조회
      const data = await getPopulationRange(
        parseInt(startYear),
        parseInt(endYear),
        category
      );
      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: 'year 또는 startYear/endYear 파라미터가 필요합니다' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Population API error:', error);
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
