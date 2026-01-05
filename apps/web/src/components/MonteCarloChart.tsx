'use client';

import { useState, useEffect } from 'react';
import type { SimulationParams } from '@npfs/types';

interface MonteCarloResult {
  median_depletion_year: number;
  ci_90_lower: number;
  ci_90_upper: number;
  ci_50_lower: number;
  ci_50_upper: number;
  distribution: number[];
  n_simulations: number;
}

interface MonteCarloChartProps {
  params: SimulationParams;
}

export function MonteCarloChart({ params }: MonteCarloChartProps) {
  const [data, setData] = useState<MonteCarloResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonteCarlo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/analysis/monte-carlo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            params: {
              contribution_rate: params.contributionRate,
              replacement_rate: params.replacementRate,
              pension_age: params.pensionAge,
              fund_return_rate: params.fundReturnRate,
              start_year: params.startYear,
              end_year: params.endYear,
            },
            n_simulations: 1000,
          }),
        });

        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Monte Carlo 분석을 불러오는데 실패했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonteCarlo();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">
          1,000회 시뮬레이션 실행 중...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-red-500">{error || '데이터 없음'}</p>
      </div>
    );
  }

  const range90 = data.ci_90_upper - data.ci_90_lower;
  const range50 = data.ci_50_upper - data.ci_50_lower;

  // 분포 시각화를 위한 최대값
  const maxCount = Math.max(...data.distribution);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          불확실성 분석 (Monte Carlo)
        </h3>
        <p className="text-sm text-gray-500">
          기금 수익률 변동성을 반영한 {data.n_simulations.toLocaleString()}회 시뮬레이션 결과
        </p>
      </div>

      {/* 핵심 수치 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-sm text-yellow-700">최악 5%</div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.ci_90_lower}년
          </div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="text-sm text-blue-700">중앙값</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.median_depletion_year}년
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700">최선 5%</div>
          <div className="text-2xl font-bold text-green-600">
            {data.ci_90_upper}년
          </div>
        </div>
      </div>

      {/* 신뢰구간 시각화 */}
      <div className="space-y-2">
        <div className="text-sm text-gray-600">신뢰구간</div>
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* 90% CI */}
          <div
            className="absolute h-full bg-blue-200"
            style={{
              left: `${((data.ci_90_lower - 2030) / 70) * 100}%`,
              width: `${(range90 / 70) * 100}%`,
            }}
          />
          {/* 50% CI */}
          <div
            className="absolute h-full bg-blue-400"
            style={{
              left: `${((data.ci_50_lower - 2030) / 70) * 100}%`,
              width: `${(range50 / 70) * 100}%`,
            }}
          />
          {/* 중앙값 마커 */}
          <div
            className="absolute h-full w-1 bg-blue-600"
            style={{
              left: `${((data.median_depletion_year - 2030) / 70) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>2030</span>
          <span>2050</span>
          <span>2070</span>
          <span>2090</span>
          <span>2100</span>
        </div>
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-200 rounded"></span>
            90% 신뢰구간
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-400 rounded"></span>
            50% 신뢰구간
          </span>
        </div>
      </div>

      {/* 분포 히스토그램 */}
      <div>
        <div className="text-sm text-gray-600 mb-2">고갈 연도 분포</div>
        <div className="flex items-end h-24 gap-1">
          {data.distribution.map((count, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-500"
              style={{ height: `${(count / maxCount) * 100}%` }}
              title={`${count}회`}
            />
          ))}
        </div>
      </div>

      {/* 해석 */}
      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-800 mb-2">
          분석 해석
        </h4>
        <p className="text-sm text-amber-700">
          현재 설정에서 기금 고갈 시점은 <strong>90% 확률로 {data.ci_90_lower}~{data.ci_90_upper}년</strong> 사이입니다.
          {data.ci_90_lower < 2050 && (
            <> 경제 위기 시 <strong>{data.ci_90_lower}년</strong>까지 앞당겨질 수 있어 조기 대응이 필요합니다.</>
          )}
        </p>
      </div>
    </div>
  );
}
