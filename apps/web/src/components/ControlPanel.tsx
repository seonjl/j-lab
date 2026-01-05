'use client';

import type { SimulationParams } from '@npfs/types';

interface ControlPanelProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
}

export function ControlPanel({ params, onChange }: ControlPanelProps) {
  const updateParam = <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">파라미터 조정</h2>

      {/* 보험료율 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          보험료율: {(params.contributionRate * 100).toFixed(1)}%
        </label>
        <input
          type="range"
          min="0.09"
          max="0.15"
          step="0.005"
          value={params.contributionRate}
          onChange={(e) => updateParam('contributionRate', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>9%</span>
          <span>15%</span>
        </div>
      </div>

      {/* 소득대체율 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          소득대체율: {(params.replacementRate * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.40"
          max="0.50"
          step="0.01"
          value={params.replacementRate}
          onChange={(e) => updateParam('replacementRate', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>40%</span>
          <span>50%</span>
        </div>
      </div>

      {/* 수급 연령 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          수급 개시 연령: {params.pensionAge}세
        </label>
        <input
          type="range"
          min="60"
          max="70"
          step="1"
          value={params.pensionAge}
          onChange={(e) => updateParam('pensionAge', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>60세</span>
          <span>70세</span>
        </div>
      </div>

      {/* 기금 수익률 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기금 수익률: {(params.fundReturnRate * 100).toFixed(1)}%
        </label>
        <input
          type="range"
          min="0.03"
          max="0.08"
          step="0.005"
          value={params.fundReturnRate}
          onChange={(e) => updateParam('fundReturnRate', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>3%</span>
          <span>8%</span>
        </div>
      </div>

      {/* 현행 제도 복원 버튼 */}
      <button
        onClick={() => onChange({
          contributionRate: 0.09,
          replacementRate: 0.40,
          pensionAge: 65,
          fundReturnRate: 0.055,
          startYear: 2024,
          endYear: 2093,
        })}
        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
      >
        현행 제도로 초기화
      </button>
    </div>
  );
}
