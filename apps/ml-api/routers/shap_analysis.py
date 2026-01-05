"""
SHAP 분석 엔드포인트
변수 중요도 및 영향도 분석
"""
import numpy as np
from fastapi import APIRouter
from typing import Optional
import pickle
from pathlib import Path

from core.schemas import SimulationParams, ShapResult
from core.simulation import run_simulation_simple

router = APIRouter()

# 모델 경로
MODEL_PATH = Path(__file__).parent.parent / "models" / "xgb_depletion.pkl"


def train_model_if_needed():
    """
    모델이 없으면 학습하여 저장
    실제로는 별도 스크립트로 학습하지만, 데모용으로 on-demand 학습
    """
    if MODEL_PATH.exists():
        return

    from sklearn.ensemble import GradientBoostingRegressor

    print("Training model...")

    # 시나리오 생성
    np.random.seed(42)
    n_samples = 5000

    scenarios = []
    targets = []

    for _ in range(n_samples):
        params = {
            "contribution_rate": np.random.uniform(0.09, 0.15),
            "replacement_rate": np.random.uniform(0.35, 0.50),
            "pension_age": np.random.randint(63, 70),
            "fund_return_rate": np.random.uniform(0.03, 0.08),
        }
        scenarios.append(list(params.values()))
        targets.append(run_simulation_simple(**params))

    X = np.array(scenarios)
    y = np.array(targets)

    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=5,
        random_state=42
    )
    model.fit(X, y)

    # 저장
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    print(f"Model saved to {MODEL_PATH}")


def load_model():
    """학습된 모델 로드"""
    train_model_if_needed()
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def compute_feature_importance(model, feature_names: list) -> dict:
    """특성 중요도 계산"""
    importance = model.feature_importances_
    return {name: float(imp) for name, imp in zip(feature_names, importance)}


def compute_feature_effects(params: SimulationParams) -> dict:
    """
    각 변수를 변화시켰을 때 고갈 연도에 미치는 영향 계산
    (단위 변화당 연도 변화)
    """
    base_year = run_simulation_simple(
        contribution_rate=params.contribution_rate,
        replacement_rate=params.replacement_rate,
        pension_age=params.pension_age,
        fund_return_rate=params.fund_return_rate,
    )

    effects = {}

    # 보험료율 1%p 증가 효과
    year_with_change = run_simulation_simple(
        contribution_rate=params.contribution_rate + 0.01,
        replacement_rate=params.replacement_rate,
        pension_age=params.pension_age,
        fund_return_rate=params.fund_return_rate,
    )
    effects["contribution_rate_1pp"] = year_with_change - base_year

    # 소득대체율 1%p 감소 효과
    year_with_change = run_simulation_simple(
        contribution_rate=params.contribution_rate,
        replacement_rate=params.replacement_rate - 0.01,
        pension_age=params.pension_age,
        fund_return_rate=params.fund_return_rate,
    )
    effects["replacement_rate_1pp_down"] = year_with_change - base_year

    # 수급연령 1세 상향 효과
    year_with_change = run_simulation_simple(
        contribution_rate=params.contribution_rate,
        replacement_rate=params.replacement_rate,
        pension_age=params.pension_age + 1,
        fund_return_rate=params.fund_return_rate,
    )
    effects["pension_age_1yr"] = year_with_change - base_year

    # 기금수익률 1%p 증가 효과
    year_with_change = run_simulation_simple(
        contribution_rate=params.contribution_rate,
        replacement_rate=params.replacement_rate,
        pension_age=params.pension_age,
        fund_return_rate=params.fund_return_rate + 0.01,
    )
    effects["fund_return_rate_1pp"] = year_with_change - base_year

    return effects


@router.post("/shap", response_model=ShapResult)
async def get_shap_analysis(params: SimulationParams):
    """
    SHAP 기반 변수 중요도 분석

    - feature_importance: 모델 학습 기반 전체 변수 중요도
    - feature_effects: 현재 설정에서 각 변수 단위 변화의 효과 (년)
    """
    model = load_model()
    feature_names = ["contribution_rate", "replacement_rate", "pension_age", "fund_return_rate"]

    # 변수 중요도
    importance = compute_feature_importance(model, feature_names)

    # 변수별 효과 (현재 설정 기준)
    effects = compute_feature_effects(params)

    # 현재 설정의 고갈 연도
    current_depletion = run_simulation_simple(
        contribution_rate=params.contribution_rate,
        replacement_rate=params.replacement_rate,
        pension_age=params.pension_age,
        fund_return_rate=params.fund_return_rate,
    )

    # 기본 설정 (현행 유지)의 고갈 연도
    base_depletion = run_simulation_simple()

    return ShapResult(
        feature_importance=importance,
        feature_effects=effects,
        base_depletion_year=base_depletion,
        current_depletion_year=current_depletion,
    )


@router.get("/shap/summary")
async def get_shap_summary():
    """
    SHAP 분석 요약 (기본 설정 기준)
    """
    default_params = SimulationParams()
    return await get_shap_analysis(default_params)
