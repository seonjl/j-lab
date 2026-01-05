/**
 * 국민연금 재정 시뮬레이션 타입 정의
 */

// 시뮬레이션 입력 파라미터
export interface SimulationParams {
  // 보험료율 (9% ~ 15%)
  contributionRate: number;
  // 소득대체율 (40% ~ 50%)
  replacementRate: number;
  // 수급 개시 연령
  pensionAge: number;
  // 기금 수익률 (연간, %)
  fundReturnRate: number;
  // 시뮬레이션 시작 연도
  startYear: number;
  // 시뮬레이션 종료 연도
  endYear: number;
}

// 연도별 시뮬레이션 결과
export interface YearlyResult {
  year: number;
  // 가입자 수 (천명)
  contributors: number;
  // 수급자 수 (천명)
  beneficiaries: number;
  // 보험료 수입 (조원)
  contributionIncome: number;
  // 급여 지출 (조원)
  benefitExpenditure: number;
  // 기금 운용 수익 (조원)
  investmentIncome: number;
  // 기금 잔액 (조원)
  fundBalance: number;
  // 수지 차액 (조원)
  netBalance: number;
}

// 시뮬레이션 전체 결과
export interface SimulationResult {
  params: SimulationParams;
  yearlyResults: YearlyResult[];
  // 적자 전환 연도 (없으면 null)
  deficitYear: number | null;
  // 기금 소진 연도 (없으면 null)
  depletionYear: number | null;
}

// 인구 추계 데이터
export interface PopulationData {
  year: number;
  // 연령별 인구 (0세 ~ 100세+)
  ageDistribution: number[];
  // 총인구
  totalPopulation: number;
  // 생산가능인구 (15-64세)
  workingAgePopulation: number;
  // 고령인구 (65세+)
  elderlyPopulation: number;
}

// 경제 전망 데이터
export interface EconomicProjection {
  year: number;
  // GDP 성장률 (%)
  gdpGrowthRate: number;
  // 임금 상승률 (%)
  wageGrowthRate: number;
  // 물가 상승률 (%)
  inflationRate: number;
  // 평균 소득 (만원/년)
  averageIncome: number;
}
