'use client';

import { useState, useEffect } from 'react';
import type { SimulationParams } from '@npfs/types';

interface GenerationData {
  birth_year: number;
  contribution_years: number;
  benefit_years: number;
  total_contribution: number;
  total_benefit: number;
  roi: number;
  cluster: number | null;
  cluster_name: string | null;
}

interface GenerationResult {
  generations: GenerationData[];
  clusters: Record<number, string>;
  equity_index: number;
}

interface GenerationAnalysisProps {
  params: SimulationParams;
}

const CLUSTER_COLORS: Record<string, string> = {
  '수혜 세대': 'bg-green-100 text-green-800 border-green-300',
  '전환 세대': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  '부담 세대': 'bg-orange-100 text-orange-800 border-orange-300',
  '위기 세대': 'bg-red-100 text-red-800 border-red-300',
};

const CLUSTER_ICONS: Record<string, string> = {
  '수혜 세대': '🟢',
  '전환 세대': '🟡',
  '부담 세대': '🟠',
  '위기 세대': '🔴',
};

export function GenerationAnalysis({ params }: GenerationAnalysisProps) {
  const [data, setData] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenerations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/analysis/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contribution_rate: params.contributionRate,
            replacement_rate: params.replacementRate,
            pension_age: params.pensionAge,
            fund_return_rate: params.fundReturnRate,
            start_year: params.startYear,
            end_year: params.endYear,
          }),
        });

        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('세대별 분석을 불러오는데 실패했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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

  // 유효한 세대만 필터 (ROI > 0)
  const validGenerations = data.generations.filter((g) => g.roi > 0);
  const maxRoi = Math.max(...validGenerations.map((g) => g.roi));

  // 클러스터별 그룹핑
  const clusterGroups = validGenerations.reduce((acc, g) => {
    const cluster = g.cluster_name || '기타';
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(g);
    return acc;
  }, {} as Record<string, GenerationData[]>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          세대별 수익비 분석
        </h3>
        <p className="text-sm text-gray-500">
          출생연도별 납부액 대비 수령액 비율 (수익비)
        </p>
      </div>

      {/* 형평성 지수 */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-600">세대간 형평성 지수</div>
          <div className="text-3xl font-bold text-gray-800">
            {(data.equity_index * 100).toFixed(1)}%
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                data.equity_index > 0.7
                  ? 'bg-green-500'
                  : data.equity_index > 0.5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${data.equity_index * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>불공평</span>
            <span>공평</span>
          </div>
        </div>
      </div>

      {/* 클러스터 범례 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(data.clusters).map(([id, name]) => (
          <span
            key={id}
            className={`px-3 py-1 rounded-full text-sm border ${CLUSTER_COLORS[name] || 'bg-gray-100'}`}
          >
            {CLUSTER_ICONS[name] || '⚪'} {name}
          </span>
        ))}
      </div>

      {/* 세대별 수익비 바 차트 */}
      <div className="space-y-2">
        {validGenerations.map((g) => (
          <div key={g.birth_year} className="flex items-center gap-2">
            <div className="w-20 text-sm text-gray-600">{g.birth_year}년생</div>
            <div className="flex-1">
              <div className="relative w-full bg-gray-100 rounded h-6">
                <div
                  className={`h-6 rounded transition-all duration-500 ${
                    g.roi >= 1.5
                      ? 'bg-green-400'
                      : g.roi >= 1.0
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${(g.roi / maxRoi) * 100}%` }}
                />
                {/* 손익분기점 (1.0) 마커 */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-gray-800"
                  style={{ left: `${(1.0 / maxRoi) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right">
              <span
                className={`font-medium ${
                  g.roi >= 1.0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {g.roi.toFixed(2)}배
              </span>
            </div>
            <div className="w-20">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  CLUSTER_COLORS[g.cluster_name || ''] || 'bg-gray-100'
                }`}
              >
                {g.cluster_name || '-'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 손익분기점 설명 */}
      <div className="text-xs text-gray-500 text-center">
        검은 선 = 손익분기점 (수익비 1.0배: 낸 만큼 받음)
      </div>

      {/* 정책 함의 */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-800 mb-2">
          정책적 함의
        </h4>
        <p className="text-sm text-purple-700">
          {data.equity_index < 0.7 ? (
            <>
              세대간 형평성 지수가 <strong>{(data.equity_index * 100).toFixed(0)}%</strong>로 낮습니다.
              젊은 세대의 부담이 과중하므로, <strong>급여 조정</strong>이나{' '}
              <strong>보험료율 인상</strong>을 통한 세대간 부담 재조정이 필요합니다.
            </>
          ) : (
            <>
              세대간 형평성이 비교적 양호합니다.
              현재 설정이 세대간 균형을 잘 유지하고 있습니다.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
