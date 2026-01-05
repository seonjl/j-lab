import type {
  SimulationParams,
  SimulationResult,
  YearlyResult,
  PopulationData,
  EconomicProjection,
} from '@npfs/types';
import { INITIAL_FUND_BALANCE, AVERAGE_CONTRIBUTION_YEARS } from './constants';

/**
 * 국민연금 재정 시뮬레이터
 *
 * NABO 장기재정전망 방법론을 참고한 간소화 모델
 * - 가입자/수급자 추계: 인구 데이터 기반
 * - 수입/지출 계산: 보험료율, 소득대체율 적용
 * - 기금 운용: 단순 수익률 적용
 */
export class PensionSimulator {
  private params: SimulationParams;
  private populationData: PopulationData[];
  private economicData: EconomicProjection[];

  constructor(
    params: SimulationParams,
    populationData: PopulationData[],
    economicData: EconomicProjection[]
  ) {
    this.params = params;
    this.populationData = populationData;
    this.economicData = economicData;
  }

  /**
   * 시뮬레이션 실행
   */
  run(): SimulationResult {
    const yearlyResults: YearlyResult[] = [];
    let fundBalance = INITIAL_FUND_BALANCE;
    let deficitYear: number | null = null;
    let depletionYear: number | null = null;

    for (let year = this.params.startYear; year <= this.params.endYear; year++) {
      const population = this.getPopulationForYear(year);
      const economic = this.getEconomicForYear(year);

      // 가입자 수 추정 (생산가능인구의 약 60%)
      const contributors = population.workingAgePopulation * 0.6;

      // 수급자 수 추정 (연금 수급 연령 이상 인구의 약 50%)
      const eligiblePopulation = this.getEligiblePopulation(population, this.params.pensionAge);
      const beneficiaries = eligiblePopulation * 0.5;

      // 보험료 수입 = 가입자 × 평균소득 × 보험료율 × 12개월
      const contributionIncome =
        (contributors * 1000) * // 천명 → 명
        (economic.averageIncome * 10000 / 12) * // 연소득 → 월소득 (원)
        this.params.contributionRate *
        12 / 1e12; // 원 → 조원

      // 급여 지출 = 수급자 × 평균연금 (소득대체율 × 평균소득 × 가입기간/40)
      const averagePension =
        economic.averageIncome * 10000 * // 연소득 (원)
        this.params.replacementRate *
        (AVERAGE_CONTRIBUTION_YEARS / 40);

      const benefitExpenditure =
        (beneficiaries * 1000) * // 천명 → 명
        averagePension *
        12 / 1e12; // 원 → 조원 (연간)

      // 기금 운용 수익
      const investmentIncome = fundBalance > 0
        ? fundBalance * this.params.fundReturnRate
        : 0;

      // 수지 차액
      const netBalance = contributionIncome + investmentIncome - benefitExpenditure;

      // 기금 잔액 업데이트
      fundBalance += netBalance;

      // 적자/소진 연도 체크
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
      params: this.params,
      yearlyResults,
      deficitYear,
      depletionYear,
    };
  }

  /**
   * 특정 연도의 인구 데이터 반환
   */
  private getPopulationForYear(year: number): PopulationData {
    const data = this.populationData.find(p => p.year === year);
    if (data) return data;

    // 데이터가 없으면 가장 가까운 연도 데이터 사용
    const sorted = [...this.populationData].sort(
      (a, b) => Math.abs(a.year - year) - Math.abs(b.year - year)
    );
    return sorted[0] || this.getDefaultPopulation(year);
  }

  /**
   * 특정 연도의 경제 전망 데이터 반환
   */
  private getEconomicForYear(year: number): EconomicProjection {
    const data = this.economicData.find(e => e.year === year);
    if (data) return data;

    // 데이터가 없으면 가장 가까운 연도 데이터 사용
    const sorted = [...this.economicData].sort(
      (a, b) => Math.abs(a.year - year) - Math.abs(b.year - year)
    );
    return sorted[0] || this.getDefaultEconomic(year);
  }

  /**
   * 연금 수급 연령 이상 인구 계산 (천명)
   */
  private getEligiblePopulation(population: PopulationData, pensionAge: number): number {
    // 간소화: 65세 이상 인구 사용
    return population.elderlyPopulation;
  }

  /**
   * 기본 인구 데이터 (데이터 없을 때 fallback)
   */
  private getDefaultPopulation(year: number): PopulationData {
    // 통계청 2023 장래인구추계 기반 추정값
    const baseWorkingAge = 35000; // 2024년 기준 약 3,500만
    const baseElderly = 9500; // 2024년 기준 약 950만
    const yearDiff = year - 2024;

    return {
      year,
      ageDistribution: [],
      totalPopulation: 51000 - yearDiff * 150, // 연 15만 감소 추정
      workingAgePopulation: Math.max(baseWorkingAge - yearDiff * 300, 20000),
      elderlyPopulation: Math.min(baseElderly + yearDiff * 200, 20000),
    };
  }

  /**
   * 기본 경제 전망 데이터 (데이터 없을 때 fallback)
   */
  private getDefaultEconomic(year: number): EconomicProjection {
    const yearDiff = year - 2024;
    const baseIncome = 4200; // 2024년 평균소득 약 4,200만원

    return {
      year,
      gdpGrowthRate: Math.max(2.5 - yearDiff * 0.02, 1.0),
      wageGrowthRate: Math.max(3.0 - yearDiff * 0.02, 1.5),
      inflationRate: 2.0,
      averageIncome: baseIncome * Math.pow(1.02, yearDiff), // 연 2% 상승 가정
    };
  }
}
