import type { SimulationParams } from '@npfs/types';

/**
 * 기본 시뮬레이션 파라미터
 * 2024년 현행 제도 기준
 */
export const defaultParams: SimulationParams = {
  contributionRate: 0.09, // 9%
  replacementRate: 0.40, // 40%
  pensionAge: 65,
  fundReturnRate: 0.055, // 5.5%
  startYear: 2024,
  endYear: 2093,
};

/**
 * 2023년 기준 기금 잔액 (조원)
 * 출처: 국민연금공단
 */
export const INITIAL_FUND_BALANCE = 1036;

/**
 * 평균 가입기간 (년)
 */
export const AVERAGE_CONTRIBUTION_YEARS = 25;
