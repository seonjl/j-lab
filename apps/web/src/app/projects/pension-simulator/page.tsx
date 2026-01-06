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
import { useLanguage } from '@/lib/i18n';

const TABS_KO = [
  { id: 'simulation', label: '시뮬레이션' },
  { id: 'generation', label: '세대별 분석' },
  { id: 'uncertainty', label: '불확실성' },
  { id: 'insight', label: 'ML 분석' },
];

const TABS_EN = [
  { id: 'simulation', label: 'Simulation' },
  { id: 'generation', label: 'Generational' },
  { id: 'uncertainty', label: 'Uncertainty' },
  { id: 'insight', label: 'ML Analysis' },
];

export default function PensionSimulatorPage() {
  const { t, locale } = useLanguage();
  const [params, setParams] = useState<SimulationParams>(defaultScenario.params);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(defaultScenario.id);
  const [activeTab, setActiveTab] = useState('simulation');

  const result = useMemo(() => runSimulation(params), [params]);
  const tabs = locale === 'ko' ? TABS_KO : TABS_EN;

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
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-700">{t.nav.home}</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-gray-700">{t.nav.projects}</Link>
            <span>/</span>
            <span className="text-gray-900">{t.pension.breadcrumb}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.pension.title}
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            {t.pension.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Python', 'FastAPI', 'Next.js', 'scikit-learn', 'Monte Carlo', 'K-means'].map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1 space-y-4">
            <ScenarioSelector
              selectedId={selectedScenarioId}
              onSelect={handleScenarioSelect}
            />
            <ControlPanel params={params} onChange={handleParamsChange} />
          </aside>

          <section className="lg:col-span-2 space-y-4">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="min-h-[500px]">
              {activeTab === 'simulation' && (
                <div className="space-y-4">
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

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            {locale === 'ko'
              ? '본 시뮬레이터는 교육 및 연구 목적으로 제작되었습니다. 실제 국민연금 재정추계와 다를 수 있습니다.'
              : 'This simulator is for educational and research purposes. Results may differ from actual NPS projections.'}
          </p>
          <p className="mt-1">
            {locale === 'ko'
              ? '데이터 출처: 통계청 장래인구추계(2022), 국민연금 제5차 재정계산(2023)'
              : 'Data source: Statistics Korea Population Projection (2022), 5th NPS Actuarial Valuation (2023)'}
          </p>
        </div>
      </main>
    </div>
  );
}
