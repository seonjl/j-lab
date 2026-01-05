"""
세대별 분석 엔드포인트
세대별 수익비 및 클러스터링
"""
import numpy as np
from fastapi import APIRouter
from typing import List, Dict
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from core.schemas import SimulationParams, GenerationData, GenerationAnalysisResult
from core.simulation import run_simulation

router = APIRouter()

# 클러스터 이름 정의
CLUSTER_NAMES = {
    0: "수혜 세대",      # 고수익비
    1: "전환 세대",      # 중간 수익비
    2: "부담 세대",      # 저수익비
    3: "위기 세대",      # 기금 소진 후
}


def calculate_generation_data(
    birth_year: int,
    params: SimulationParams,
    depletion_year: int | None,
) -> GenerationData:
    """
    특정 출생연도의 세대별 데이터 계산

    가정:
    - 22세부터 납부 시작
    - params.pension_age 세까지 납부
    - 기대수명 85세까지 수급
    """
    # 납부 기간
    contribution_start_year = birth_year + 22
    contribution_end_year = birth_year + params.pension_age
    contribution_years = max(0, min(contribution_end_year, 2093) - max(contribution_start_year, 2024))

    # 수급 기간
    benefit_start_year = birth_year + params.pension_age
    benefit_end_year = birth_year + 85  # 기대수명

    # 기금 소진 시 부과방식 전환 가정 (급여 50% 수준으로 가정)
    if depletion_year and benefit_start_year >= depletion_year:
        # 기금 소진 후 은퇴 → 부과방식, 급여 감소
        effective_replacement = params.replacement_rate * 0.5
        benefit_years = max(0, benefit_end_year - benefit_start_year)
    elif depletion_year and benefit_start_year < depletion_year < benefit_end_year:
        # 은퇴 중 기금 소진 → 일부 기간만 정상 급여
        normal_years = depletion_year - benefit_start_year
        reduced_years = benefit_end_year - depletion_year
        benefit_years = normal_years + reduced_years * 0.5  # 가중 평균
        effective_replacement = params.replacement_rate
    else:
        # 기금 정상
        effective_replacement = params.replacement_rate
        benefit_years = max(0, benefit_end_year - benefit_start_year)

    # 평균 소득 추정 (출생연도 기준 경력 중반 소득)
    career_mid_year = birth_year + 45
    year_diff = career_mid_year - 2024
    average_income = 4200 * (1.02 ** year_diff)  # 만원

    # 총 납부액 (만원)
    annual_contribution = average_income * params.contribution_rate * 12
    total_contribution = annual_contribution * contribution_years

    # 총 수령액 (만원)
    annual_benefit = average_income * effective_replacement * (min(contribution_years, 40) / 40) * 12
    total_benefit = annual_benefit * benefit_years

    # 수익비
    roi = total_benefit / total_contribution if total_contribution > 0 else 0

    return GenerationData(
        birth_year=birth_year,
        contribution_years=round(contribution_years, 1),
        benefit_years=round(benefit_years, 1),
        total_contribution=round(total_contribution, 0),
        total_benefit=round(total_benefit, 0),
        roi=round(roi, 2),
    )


def cluster_generations(generations: List[GenerationData], n_clusters: int = 4) -> List[GenerationData]:
    """
    세대를 클러스터링하여 유형 분류
    """
    if len(generations) < n_clusters:
        return generations

    # 클러스터링 특성
    features = np.array([
        [g.roi, g.contribution_years, g.benefit_years]
        for g in generations
    ])

    # 정규화
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # K-means 클러스터링
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(features_scaled)

    # 클러스터를 수익비 순으로 정렬하여 라벨 재할당
    cluster_avg_roi = {}
    for i in range(n_clusters):
        mask = clusters == i
        cluster_avg_roi[i] = np.mean([g.roi for g, m in zip(generations, mask) if m])

    sorted_clusters = sorted(cluster_avg_roi.keys(), key=lambda x: cluster_avg_roi[x], reverse=True)
    cluster_mapping = {old: new for new, old in enumerate(sorted_clusters)}

    # 결과 업데이트
    for i, g in enumerate(generations):
        new_cluster = cluster_mapping[clusters[i]]
        g.cluster = new_cluster
        g.cluster_name = CLUSTER_NAMES.get(new_cluster, f"그룹 {new_cluster}")

    return generations


def calculate_equity_index(generations: List[GenerationData]) -> float:
    """
    세대간 형평성 지수 계산
    Gini 계수의 역수 형태 (1이 가장 공평, 0이 가장 불공평)
    """
    rois = [g.roi for g in generations if g.roi > 0]
    if len(rois) < 2:
        return 1.0

    # 간단한 변동계수 기반 지수
    mean_roi = np.mean(rois)
    std_roi = np.std(rois)

    if mean_roi == 0:
        return 0

    cv = std_roi / mean_roi  # 변동계수
    equity = max(0, 1 - cv)  # 0~1 범위

    return round(equity, 3)


@router.post("/generations", response_model=GenerationAnalysisResult)
async def analyze_generations(params: SimulationParams):
    """
    세대별 분석

    - 출생연도별 수익비 계산
    - K-means 클러스터링으로 세대 유형 분류
    - 세대간 형평성 지수 계산
    """
    # 시뮬레이션으로 고갈 연도 확인
    sim_result = run_simulation(params)
    depletion_year = sim_result.depletion_year

    # 1950년생 ~ 2020년생 (10년 단위)
    birth_years = list(range(1950, 2030, 5))

    generations = [
        calculate_generation_data(birth_year, params, depletion_year)
        for birth_year in birth_years
    ]

    # 클러스터링
    generations = cluster_generations(generations)

    # 형평성 지수
    equity_index = calculate_equity_index(generations)

    return GenerationAnalysisResult(
        generations=generations,
        clusters=CLUSTER_NAMES,
        equity_index=equity_index,
    )


@router.get("/generations/summary")
async def get_generation_summary():
    """
    세대별 분석 요약 (기본 설정 기준)
    """
    return await analyze_generations(SimulationParams())


@router.get("/generations/compare")
async def compare_scenarios():
    """
    시나리오별 세대 영향 비교
    """
    scenarios = {
        "current": SimulationParams(),  # 현행 유지
        "contribution_up": SimulationParams(contribution_rate=0.13),  # 보험료 인상
        "benefit_down": SimulationParams(replacement_rate=0.35),  # 급여 조정
        "balanced": SimulationParams(contribution_rate=0.12, replacement_rate=0.43),  # 균형안
    }

    results = {}
    for name, params in scenarios.items():
        analysis = await analyze_generations(params)
        results[name] = {
            "equity_index": analysis.equity_index,
            "avg_roi": round(np.mean([g.roi for g in analysis.generations]), 2),
            "min_roi": round(min(g.roi for g in analysis.generations), 2),
            "max_roi": round(max(g.roi for g in analysis.generations), 2),
        }

    return results
