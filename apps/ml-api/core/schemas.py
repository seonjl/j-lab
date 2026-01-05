"""Pydantic schemas for API"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class SimulationParams(BaseModel):
    """시뮬레이션 입력 파라미터"""
    contribution_rate: float = Field(0.09, ge=0.05, le=0.20, description="보험료율 (0.09 = 9%)")
    replacement_rate: float = Field(0.40, ge=0.20, le=0.60, description="소득대체율 (0.40 = 40%)")
    pension_age: int = Field(65, ge=60, le=70, description="수급 개시 연령")
    fund_return_rate: float = Field(0.055, ge=0.01, le=0.10, description="기금 수익률 (0.055 = 5.5%)")
    start_year: int = Field(2024, description="시작 연도")
    end_year: int = Field(2093, description="종료 연도")


class YearlyResult(BaseModel):
    """연도별 시뮬레이션 결과"""
    year: int
    contributors: int
    beneficiaries: int
    contribution_income: float
    benefit_expenditure: float
    investment_income: float
    fund_balance: float
    net_balance: float


class SimulationResult(BaseModel):
    """시뮬레이션 전체 결과"""
    params: SimulationParams
    yearly_results: List[YearlyResult]
    deficit_year: Optional[int] = None
    depletion_year: Optional[int] = None
    max_fund_year: Optional[int] = None
    max_fund_balance: Optional[float] = None


class ShapResult(BaseModel):
    """SHAP 분석 결과"""
    feature_importance: Dict[str, float]
    feature_effects: Dict[str, float]  # 각 변수가 고갈연도에 미치는 영향 (년)
    base_depletion_year: int
    current_depletion_year: int


class MonteCarloResult(BaseModel):
    """Monte Carlo 시뮬레이션 결과"""
    median_depletion_year: int
    ci_90_lower: int
    ci_90_upper: int
    ci_50_lower: int
    ci_50_upper: int
    distribution: List[int]  # 히스토그램용 데이터
    n_simulations: int


class GenerationData(BaseModel):
    """세대별 분석 데이터"""
    birth_year: int
    contribution_years: float
    benefit_years: float
    total_contribution: float  # 총 납부액 (만원)
    total_benefit: float  # 총 수령액 (만원)
    roi: float  # 수익비 (수령액/납부액)
    cluster: Optional[int] = None
    cluster_name: Optional[str] = None


class GenerationAnalysisResult(BaseModel):
    """세대별 분석 전체 결과"""
    generations: List[GenerationData]
    clusters: Dict[int, str]  # cluster_id -> cluster_name
    equity_index: float  # 세대간 형평성 지수 (0~1, 1이 가장 공평)
