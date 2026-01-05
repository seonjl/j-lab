import type { SimulationParams } from '@npfs/types';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  params: SimulationParams;
  color: string;
}

/**
 * 국민연금 개혁 시나리오
 * - 현행 유지
 * - 보험료 인상안 (정부안 기반)
 * - 급여 조정안
 * - 모수개혁안 (균형안)
 */
export const scenarios: Scenario[] = [
  {
    id: 'current',
    name: '현행 유지',
    description: '현재 제도 그대로 유지',
    color: '#6b7280', // gray
    params: {
      contributionRate: 0.09,    // 9%
      replacementRate: 0.40,     // 40%
      pensionAge: 65,
      fundReturnRate: 0.055,     // 5.5%
      startYear: 2024,
      endYear: 2093,
    },
  },
  {
    id: 'contribution-up',
    name: '보험료 인상안',
    description: '보험료율 13%로 인상, 소득대체율 유지',
    color: '#2563eb', // blue
    params: {
      contributionRate: 0.13,    // 13%
      replacementRate: 0.40,     // 40%
      pensionAge: 65,
      fundReturnRate: 0.055,
      startYear: 2024,
      endYear: 2093,
    },
  },
  {
    id: 'benefit-down',
    name: '급여 조정안',
    description: '소득대체율 35%로 조정, 보험료율 유지',
    color: '#dc2626', // red
    params: {
      contributionRate: 0.09,    // 9%
      replacementRate: 0.35,     // 35%
      pensionAge: 65,
      fundReturnRate: 0.055,
      startYear: 2024,
      endYear: 2093,
    },
  },
  {
    id: 'balanced',
    name: '균형 개혁안',
    description: '보험료율 12%, 소득대체율 43% (더 내고 더 받기)',
    color: '#16a34a', // green
    params: {
      contributionRate: 0.12,    // 12%
      replacementRate: 0.43,     // 43%
      pensionAge: 65,
      fundReturnRate: 0.055,
      startYear: 2024,
      endYear: 2093,
    },
  },
  {
    id: 'pension-age-up',
    name: '수급연령 상향안',
    description: '수급 개시 연령 68세로 상향',
    color: '#9333ea', // purple
    params: {
      contributionRate: 0.09,    // 9%
      replacementRate: 0.40,     // 40%
      pensionAge: 68,            // 68세
      fundReturnRate: 0.055,
      startYear: 2024,
      endYear: 2093,
    },
  },
];

export const defaultScenario = scenarios[0];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}
