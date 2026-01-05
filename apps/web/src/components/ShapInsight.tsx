'use client';

import { useState, useEffect } from 'react';
import type { SimulationParams } from '@npfs/types';

interface ShapResult {
  feature_importance: Record<string, number>;
  feature_effects: Record<string, number>;
  base_depletion_year: number;
  current_depletion_year: number;
}

interface ShapInsightProps {
  params: SimulationParams;
}

const FEATURE_LABELS: Record<string, string> = {
  contribution_rate: '보험료율',
  replacement_rate: '소득대체율',
  pension_age: '수급연령',
  fund_return_rate: '기금수익률',
};

const EFFECT_LABELS: Record<string, string> = {
  contribution_rate_1pp: '보험료율 +1%p',
  replacement_rate_1pp_down: '소득대체율 -1%p',
  pension_age_1yr: '수급연령 +1세',
  fund_return_rate_1pp: '기금수익률 +1%p',
};

export function ShapInsight({ params }: ShapInsightProps) {
  const [data, setData] = useState<ShapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShap = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/analysis/shap', {
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
        setError('분석 데이터를 불러오는데 실패했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShap();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
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

  // 중요도 순 정렬
  const sortedImportance = Object.entries(data.feature_importance).sort(
    ([, a], [, b]) => b - a
  );

  const maxImportance = Math.max(...Object.values(data.feature_importance));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          변수 중요도 분석
        </h3>
        <p className="text-sm text-gray-500">
          ML 모델이 학습한 각 정책 변수의 기금 고갈 시점에 대한 영향력
        </p>
      </div>

      {/* 변수 중요도 바 차트 */}
      <div className="space-y-3">
        {sortedImportance.map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{FEATURE_LABELS[key] || key}</span>
              <span className="text-gray-500">{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(value / maxImportance) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 정책 효과 분석 */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-800 mb-3">
          정책 변화의 효과
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          각 정책 변수를 단위만큼 변경했을 때 기금 고갈 연도 변화
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.feature_effects).map(([key, years]) => (
            <div
              key={key}
              className={`p-3 rounded-lg ${
                years > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="text-xs text-gray-600">{EFFECT_LABELS[key] || key}</div>
              <div className={`text-lg font-bold ${years > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {years > 0 ? '+' : ''}{years}년
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 정책 제언 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          정책 제언
        </h4>
        <p className="text-sm text-blue-700">
          {data.feature_effects.contribution_rate_1pp > data.feature_effects.replacement_rate_1pp_down
            ? '보험료율 인상이 급여 삭감보다 기금 지속가능성에 더 효과적입니다.'
            : '급여 조정이 보험료율 인상보다 효과적이나, 노후소득 보장 측면을 고려해야 합니다.'}
          {' '}기금수익률은 정책적으로 통제하기 어려우므로,{' '}
          <strong>보험료율 조정</strong>에 집중하는 것이 바람직합니다.
        </p>
      </div>
    </div>
  );
}
