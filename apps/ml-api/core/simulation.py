"""
시뮬레이션 핵심 로직
JS 버전과 동일한 로직을 Python으로 구현
"""
import numpy as np
from typing import Tuple, Dict, List, Optional
from .schemas import SimulationParams, SimulationResult, YearlyResult


INITIAL_FUND_BALANCE = 1036  # 조원 (2024년 기준)
AVERAGE_CONTRIBUTION_YEARS = 25


def get_population_estimates(year: int, pension_age: int = 65) -> Dict[str, float]:
    """
    인구 추정 함수
    통계청 장래인구추계(2022) 기반 간소화 모델
    """
    year_diff = year - 2024

    # 생산가능인구 (15-64세): 2024년 3,600만명 → 2070년 1,700만명
    if year_diff <= 10:
        working_age_pop = 36000 - year_diff * 150
    elif year_diff <= 30:
        working_age_pop = 34500 - (year_diff - 10) * 400
    else:
        working_age_pop = 26500 - (year_diff - 30) * 200
    working_age_pop = max(working_age_pop, 17000)

    # 고령인구 (65세 이상)
    if year_diff <= 10:
        elderly_pop = 9500 + year_diff * 350
    elif year_diff <= 25:
        elderly_pop = 13000 + (year_diff - 10) * 400
    else:
        elderly_pop = 19000 + (year_diff - 25) * 50
    elderly_pop = min(elderly_pop, 20000)

    # 국민연금 가입자
    participation_rate = max(0.50, 0.58 - year_diff * 0.001)
    contributors = working_age_pop * participation_rate

    # 수급자
    pension_age_effect = (pension_age - 65) * 0.04
    if year_diff <= 0:
        beneficiary_rate = 0.70
    elif year_diff <= 10:
        beneficiary_rate = 0.70 + (year_diff * 0.015)
    elif year_diff <= 25:
        beneficiary_rate = 0.85 + ((year_diff - 10) * 0.003)
    else:
        beneficiary_rate = 0.90
    beneficiary_rate = max(0, beneficiary_rate - pension_age_effect)

    beneficiaries = elderly_pop * beneficiary_rate

    return {
        "working_age_pop": working_age_pop,
        "elderly_pop": elderly_pop,
        "contributors": contributors,
        "beneficiaries": beneficiaries,
    }


def run_simulation(params: SimulationParams) -> SimulationResult:
    """
    연금 재정 시뮬레이션 실행
    """
    yearly_results: List[YearlyResult] = []
    fund_balance = INITIAL_FUND_BALANCE
    deficit_year: Optional[int] = None
    depletion_year: Optional[int] = None
    max_fund_balance = fund_balance
    max_fund_year = params.start_year

    for year in range(params.start_year, params.end_year + 1):
        year_diff = year - 2024

        # 인구 추정
        pop = get_population_estimates(year, params.pension_age)
        contributors = pop["contributors"]
        beneficiaries = pop["beneficiaries"]

        # 경제 지표 추정
        average_income = 4200 * (1.02 ** year_diff)  # 만원

        # 보험료 수입 (조원)
        contribution_income = (
            (contributors * 1000) *  # 천명 → 명
            (average_income * 10000) *  # 만원 → 원
            params.contribution_rate /
            1e12  # 원 → 조원
        )

        # 급여 지출 (조원)
        average_pension = (
            average_income * 10000 *
            params.replacement_rate *
            (AVERAGE_CONTRIBUTION_YEARS / 40)
        )
        benefit_expenditure = (
            (beneficiaries * 1000) *
            average_pension /
            1e12
        )

        # 기금 운용 수익
        investment_income = fund_balance * params.fund_return_rate if fund_balance > 0 else 0

        # 수지 차액
        net_balance = contribution_income + investment_income - benefit_expenditure

        # 기금 잔액 업데이트
        fund_balance += net_balance

        # 최대 기금 추적
        if fund_balance > max_fund_balance:
            max_fund_balance = fund_balance
            max_fund_year = year

        # 적자/소진 체크
        if net_balance < 0 and deficit_year is None:
            deficit_year = year
        if fund_balance <= 0 and depletion_year is None:
            depletion_year = year
            fund_balance = 0

        yearly_results.append(YearlyResult(
            year=year,
            contributors=round(contributors),
            beneficiaries=round(beneficiaries),
            contribution_income=round(contribution_income * 10) / 10,
            benefit_expenditure=round(benefit_expenditure * 10) / 10,
            investment_income=round(investment_income * 10) / 10,
            fund_balance=round(fund_balance * 10) / 10,
            net_balance=round(net_balance * 10) / 10,
        ))

    return SimulationResult(
        params=params,
        yearly_results=yearly_results,
        deficit_year=deficit_year,
        depletion_year=depletion_year,
        max_fund_year=max_fund_year,
        max_fund_balance=round(max_fund_balance * 10) / 10,
    )


def run_simulation_simple(
    contribution_rate: float = 0.09,
    replacement_rate: float = 0.40,
    pension_age: int = 65,
    fund_return_rate: float = 0.055,
) -> int:
    """
    간소화된 시뮬레이션 - 고갈 연도만 반환
    ML 학습용
    """
    params = SimulationParams(
        contribution_rate=contribution_rate,
        replacement_rate=replacement_rate,
        pension_age=pension_age,
        fund_return_rate=fund_return_rate,
    )
    result = run_simulation(params)
    # 고갈되지 않으면 시뮬레이션 종료연도 + 1 반환
    return result.depletion_year if result.depletion_year else params.end_year + 1
