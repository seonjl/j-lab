'use client';

import type { SimulationResult } from '@npfs/types';

interface ResultSummaryProps {
  result: SimulationResult;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  const { deficitYear, depletionYear, yearlyResults } = result;

  // 최대 기금 규모
  const maxFund = Math.max(...yearlyResults.map(r => r.fundBalance));
  const maxFundYear = yearlyResults.find(r => r.fundBalance === maxFund)?.year;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">시뮬레이션 결과</h2>

      <div className="grid grid-cols-3 gap-4">
        {/* 적자 전환 시점 */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">적자 전환</p>
          <p className="text-2xl font-bold text-yellow-600">
            {deficitYear ? `${deficitYear}년` : '-'}
          </p>
        </div>

        {/* 기금 소진 시점 */}
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">기금 소진</p>
          <p className="text-2xl font-bold text-red-600">
            {depletionYear ? `${depletionYear}년` : '-'}
          </p>
        </div>

        {/* 최대 기금 규모 */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">최대 기금 ({maxFundYear})</p>
          <p className="text-2xl font-bold text-blue-600">
            {maxFund.toLocaleString()}조
          </p>
        </div>
      </div>

      {depletionYear && (
        <div className="mt-4 p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800">
            현재 설정에서 기금이 <strong>{depletionYear}년</strong>에 소진됩니다.
            {result.params.contributionRate < 0.12 && (
              <span> 보험료율 인상을 고려해보세요.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
