'use client';

import { scenarios, type Scenario } from '@/lib/scenarios';

interface ScenarioSelectorProps {
  selectedId: string | null;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({ selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">시나리오 선택</h2>
      <p className="text-sm text-gray-500 mb-4">
        미리 정의된 개혁안을 선택하거나, 슬라이더로 직접 조정하세요
      </p>

      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedId === scenario.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: scenario.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{scenario.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {scenario.description}
                </div>
              </div>
              {selectedId === scenario.id && (
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* 파라미터 요약 */}
            <div className="mt-2 flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                보험료 {(scenario.params.contributionRate * 100).toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                소득대체율 {(scenario.params.replacementRate * 100).toFixed(0)}%
              </span>
              {scenario.params.pensionAge !== 65 && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">
                  {scenario.params.pensionAge}세
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
