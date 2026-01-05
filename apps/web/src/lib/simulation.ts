import type { SimulationParams, SimulationResult, YearlyResult } from '@npfs/types';

const INITIAL_FUND_BALANCE = 1036; // 조원 (2024년 기준)
const AVERAGE_CONTRIBUTION_YEARS = 25;

/**
 * 인구 추정 함수
 * 통계청 장래인구추계(2022) 기반 간소화 모델
 */
function getPopulationEstimates(year: number, pensionAge: number) {
  const yearDiff = year - 2024;

  // 생산가능인구 (15-64세): 2024년 3,600만명 → 2070년 1,700만명
  // 초기엔 완만하게, 2030년대 이후 급격히 감소
  let workingAgePop: number;
  if (yearDiff <= 10) {
    // 2024-2034: 완만한 감소 (연 150천명)
    workingAgePop = 36000 - yearDiff * 150;
  } else if (yearDiff <= 30) {
    // 2034-2054: 급격한 감소 (연 400천명)
    workingAgePop = 34500 - (yearDiff - 10) * 400;
  } else {
    // 2054 이후: 감소세 둔화 (연 200천명)
    workingAgePop = 26500 - (yearDiff - 30) * 200;
  }
  workingAgePop = Math.max(workingAgePop, 17000);

  // 고령인구 (65세 이상): 2024년 950만명 → 2050년 1,900만명
  // 베이비붐 세대 은퇴로 2030-2040년대 급증
  let elderlyPop: number;
  if (yearDiff <= 10) {
    // 2024-2034: 빠른 증가 (연 350천명) - 1차 베이비붐 은퇴
    elderlyPop = 9500 + yearDiff * 350;
  } else if (yearDiff <= 25) {
    // 2034-2049: 급증 (연 400천명) - 2차 베이비붐 은퇴
    elderlyPop = 13000 + (yearDiff - 10) * 400;
  } else {
    // 2049 이후: 고령인구 안정화/소폭 증가
    elderlyPop = 19000 + (yearDiff - 25) * 50;
  }
  elderlyPop = Math.min(elderlyPop, 20000);

  // 국민연금 가입자: 생산가능인구의 약 55-58%
  // 경제활동참가율 고려, 점진적 하락
  const participationRate = Math.max(0.50, 0.58 - yearDiff * 0.001);
  const contributors = workingAgePop * participationRate;

  // 수급자: 수급개시연령 이상 인구 × 수급률
  // 수급률: 현재 ~70% → 2035년 85% → 2050년 90% (제도 성숙 가속)
  const pensionAgeEffect = (pensionAge - 65) * 0.04; // 연령 상향 시 수급자 감소
  let beneficiaryRate: number;
  if (yearDiff <= 0) {
    beneficiaryRate = 0.70;
  } else if (yearDiff <= 10) {
    beneficiaryRate = 0.70 + (yearDiff * 0.015); // 2034년 85%
  } else if (yearDiff <= 25) {
    beneficiaryRate = 0.85 + ((yearDiff - 10) * 0.003); // 2049년 ~90%
  } else {
    beneficiaryRate = 0.90;
  }
  beneficiaryRate = Math.max(0, beneficiaryRate - pensionAgeEffect);

  const beneficiaries = elderlyPop * beneficiaryRate;

  return { workingAgePop, elderlyPop, contributors, beneficiaries };
}

/**
 * 클라이언트 사이드 시뮬레이션
 * 국민연금 재정추계(2023) 기반 간소화 모델
 * 현행 유지 시 적자전환 2041년, 소진 2055년 목표
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const yearlyResults: YearlyResult[] = [];
  let fundBalance = INITIAL_FUND_BALANCE;
  let deficitYear: number | null = null;
  let depletionYear: number | null = null;

  for (let year = params.startYear; year <= params.endYear; year++) {
    const yearDiff = year - 2024;

    // 인구 추정
    const { contributors, beneficiaries } = getPopulationEstimates(year, params.pensionAge);

    // 경제 지표 추정
    const averageIncome = 4200 * Math.pow(1.02, yearDiff);

    // 보험료 수입 (조원)
    // 가입자 수 × 연평균소득 × 보험료율
    const contributionIncome =
      (contributors * 1000) *      // 천명 → 명
      (averageIncome * 10000) *    // 만원 → 원 (연소득)
      params.contributionRate /
      1e12;                        // 원 → 조원

    // 급여 지출 (조원)
    // 평균연금 = 평균소득 × 소득대체율 × (가입기간/40)
    const averagePension =
      averageIncome * 10000 *      // 연소득 (원)
      params.replacementRate *
      (AVERAGE_CONTRIBUTION_YEARS / 40);

    const benefitExpenditure =
      (beneficiaries * 1000) *     // 천명 → 명
      averagePension /             // 연간 연금액 (원)
      1e12;                        // 원 → 조원

    // 기금 운용 수익
    const investmentIncome = fundBalance > 0
      ? fundBalance * params.fundReturnRate
      : 0;

    // 수지 차액
    const netBalance = contributionIncome + investmentIncome - benefitExpenditure;

    // 기금 잔액 업데이트
    fundBalance += netBalance;

    // 적자/소진 체크
    if (netBalance < 0 && deficitYear === null) {
      deficitYear = year;
    }
    if (fundBalance <= 0 && depletionYear === null) {
      depletionYear = year;
      fundBalance = 0;
    }

    yearlyResults.push({
      year,
      contributors: Math.round(contributors),
      beneficiaries: Math.round(beneficiaries),
      contributionIncome: Math.round(contributionIncome * 10) / 10,
      benefitExpenditure: Math.round(benefitExpenditure * 10) / 10,
      investmentIncome: Math.round(investmentIncome * 10) / 10,
      fundBalance: Math.round(fundBalance * 10) / 10,
      netBalance: Math.round(netBalance * 10) / 10,
    });
  }

  return {
    params,
    yearlyResults,
    deficitYear,
    depletionYear,
  };
}
