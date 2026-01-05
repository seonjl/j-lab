'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { SimulationParams } from '@npfs/types';
import { SimulationChart } from '@/components/SimulationChart';
import { ControlPanel } from '@/components/ControlPanel';
import { ResultSummary } from '@/components/ResultSummary';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { TabNavigation } from '@/components/TabNavigation';
import { ShapInsight } from '@/components/ShapInsight';
import { MonteCarloChart } from '@/components/MonteCarloChart';
import { GenerationAnalysis } from '@/components/GenerationAnalysis';
import { runSimulation } from '@/lib/simulation';
import { defaultScenario, type Scenario } from '@/lib/scenarios';

const TABS = [
  { id: 'simulation', label: '시뮬레이션', icon: '📊' },
  { id: 'generation', label: '세대별 분석', icon: '👥' },
  { id: 'uncertainty', label: '불확실성', icon: '🎲' },
  { id: 'insight', label: 'ML 인사이트', icon: '🤖' },
];

export default function PensionSimulatorPage() {
  const [params, setParams] = useState<SimulationParams>(defaultScenario.params);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(defaultScenario.id);
  const [activeTab, setActiveTab] = useState('simulation');

  const result = useMemo(() => runSimulation(params), [params]);

  const handleScenarioSelect = useCallback((scenario: Scenario) => {
    setParams(scenario.params);
    setSelectedScenarioId(scenario.id);
  }, []);

  const handleParamsChange = useCallback((newParams: SimulationParams) => {
    setParams(newParams);
    setSelectedScenarioId(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-gray-700">Projects</Link>
            <span>/</span>
            <span className="text-gray-900">Pension Simulator</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            국민연금 재정 시뮬레이터
          </h1>
          <p className="mt-2 text-gray-600">
            보험료율, 소득대체율 등을 조정하여 기금 고갈 시점을 시뮬레이션합니다
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Python', 'FastAPI', 'Next.js', 'ML', 'Monte Carlo', 'K-means'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1 space-y-6">
            <ScenarioSelector
              selectedId={selectedScenarioId}
              onSelect={handleScenarioSelect}
            />
            <ControlPanel params={params} onChange={handleParamsChange} />
          </aside>

          <section className="lg:col-span-2 space-y-4">
            <TabNavigation
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="min-h-[500px]">
              {activeTab === 'simulation' && (
                <div className="space-y-6">
                  <ResultSummary result={result} />
                  <SimulationChart data={result.yearlyResults} />
                </div>
              )}

              {activeTab === 'generation' && (
                <GenerationAnalysis params={params} />
              )}

              {activeTab === 'uncertainty' && (
                <MonteCarloChart params={params} />
              )}

              {activeTab === 'insight' && (
                <ShapInsight params={params} />
              )}
            </div>
          </section>
        </div>

        {/* Project Info Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Project</h3>
            <div className="prose prose-sm text-gray-600">
              <p>
                본 시뮬레이터는 국민연금 재정 분석을 위한 도구입니다.
                Python 기반 ML API (FastAPI)와 Next.js 프론트엔드로 구성되어 있습니다.
              </p>
              <h4 className="text-md font-medium text-gray-800 mt-4 mb-2">주요 기능</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>시뮬레이션</strong>: 정책 변수 조정에 따른 기금 잔액 변화 예측</li>
                <li><strong>세대별 분석</strong>: K-means 클러스터링을 통한 세대간 형평성 분석</li>
                <li><strong>불확실성</strong>: Monte Carlo 시뮬레이션으로 기금수익률 변동성 반영</li>
                <li><strong>ML 인사이트</strong>: Gradient Boosting 모델 기반 변수 중요도 분석</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            본 시뮬레이터는 교육 및 연구 목적으로 제작되었습니다.
            실제 국민연금 재정추계와 다를 수 있습니다.
          </p>
          <p className="mt-1">
            데이터 출처: 통계청 장래인구추계(2022), 국민연금 제5차 재정계산(2023)
          </p>
        </footer>
      </main>
    </div>
  );
}
