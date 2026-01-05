"""
Monte Carlo 시뮬레이션 엔드포인트
불확실성 분석
"""
import numpy as np
from fastapi import APIRouter, Query
from typing import List

from core.schemas import SimulationParams, MonteCarloResult
from core.simulation import run_simulation, INITIAL_FUND_BALANCE, AVERAGE_CONTRIBUTION_YEARS, get_population_estimates

router = APIRouter()


def run_simulation_with_variable_returns(
    params: SimulationParams,
    return_series: List[float],
) -> int:
    """
    변동 수익률로 시뮬레이션 실행
    return_series: 연도별 수익률 리스트
    """
    fund_balance = INITIAL_FUND_BALANCE

    for i, year in enumerate(range(params.start_year, params.end_year + 1)):
        year_diff = year - 2024

        pop = get_population_estimates(year, params.pension_age)
        contributors = pop["contributors"]
        beneficiaries = pop["beneficiaries"]

        average_income = 4200 * (1.02 ** year_diff)

        # 보험료 수입
        contribution_income = (
            (contributors * 1000) *
            (average_income * 10000) *
            params.contribution_rate /
            1e12
        )

        # 급여 지출
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

        # 변동 수익률 적용
        current_return = return_series[i] if i < len(return_series) else params.fund_return_rate
        investment_income = fund_balance * current_return if fund_balance > 0 else 0

        net_balance = contribution_income + investment_income - benefit_expenditure
        fund_balance += net_balance

        if fund_balance <= 0:
            return year

    return params.end_year + 1  # 고갈 안됨


def generate_return_series(
    n_years: int,
    mean_return: float = 0.055,
    std_return: float = 0.08,
    regime_switching: bool = True,
) -> List[float]:
    """
    수익률 시계열 생성

    - regime_switching: True면 경제 상황(호황/불황) 전환 반영
    """
    if regime_switching:
        # Regime-switching model
        # 호황: 평균 7%, 표준편차 5%
        # 불황: 평균 2%, 표준편차 12%
        regimes = np.random.choice([0, 1], size=n_years, p=[0.7, 0.3])  # 70% 호황, 30% 불황

        returns = []
        for regime in regimes:
            if regime == 0:  # 호황
                r = np.random.normal(0.07, 0.05)
            else:  # 불황
                r = np.random.normal(0.02, 0.12)
            returns.append(max(-0.30, min(0.30, r)))  # -30% ~ +30% 제한

        return returns
    else:
        # 단순 정규분포
        returns = np.random.normal(mean_return, std_return, n_years)
        return [max(-0.30, min(0.30, r)) for r in returns]


@router.post("/monte-carlo", response_model=MonteCarloResult)
async def run_monte_carlo(
    params: SimulationParams,
    n_simulations: int = Query(1000, ge=100, le=10000, description="시뮬레이션 횟수"),
    use_regime_switching: bool = Query(True, description="경제 상황 전환 모델 사용"),
):
    """
    Monte Carlo 시뮬레이션

    기금 수익률의 변동성을 반영하여 고갈 시점의 분포를 계산합니다.

    - n_simulations: 시뮬레이션 횟수 (기본 1000, 최대 10000)
    - use_regime_switching: True면 호황/불황 전환 모델 사용
    """
    np.random.seed(None)  # 매번 다른 결과

    n_years = params.end_year - params.start_year + 1
    results = []

    for _ in range(n_simulations):
        return_series = generate_return_series(
            n_years,
            mean_return=params.fund_return_rate,
            regime_switching=use_regime_switching,
        )
        depletion_year = run_simulation_with_variable_returns(params, return_series)
        results.append(depletion_year)

    results = np.array(results)

    # 히스토그램 데이터 (10년 단위 bins)
    min_year = max(2030, int(np.min(results)))
    max_year = min(2100, int(np.max(results)))
    bins = list(range(min_year, max_year + 5, 5))

    hist, _ = np.histogram(results, bins=bins)
    distribution = hist.tolist()

    return MonteCarloResult(
        median_depletion_year=int(np.median(results)),
        ci_90_lower=int(np.percentile(results, 5)),
        ci_90_upper=int(np.percentile(results, 95)),
        ci_50_lower=int(np.percentile(results, 25)),
        ci_50_upper=int(np.percentile(results, 75)),
        distribution=distribution,
        n_simulations=n_simulations,
    )


@router.get("/monte-carlo/quick")
async def quick_monte_carlo():
    """
    빠른 Monte Carlo (기본 설정, 500회)
    """
    return await run_monte_carlo(
        params=SimulationParams(),
        n_simulations=500,
        use_regime_switching=True,
    )
