# ML API

> 국민연금 재정 분석을 위한 Python ML API

FastAPI 기반의 머신러닝 분석 API입니다. 정책 시뮬레이션, 세대별 분석, 불확실성 분석 기능을 제공합니다.

## Tech Stack

- **Framework**: FastAPI
- **ML**: scikit-learn, XGBoost
- **Data**: NumPy, Pandas
- **Server**: Uvicorn

## API Endpoints

### Health Check
```
GET /health
```

### SHAP-style Variable Importance
```
POST /analysis/shap
```
GradientBoostingRegressor를 사용하여 정책 변수의 기금 고갈 연도에 대한 영향력을 분석합니다.

**Request Body:**
```json
{
  "contribution_rate": 0.09,
  "replacement_rate": 0.40,
  "pension_age": 65,
  "fund_return_rate": 0.055
}
```

**Response:**
```json
{
  "feature_importance": {
    "contribution_rate": 0.45,
    "replacement_rate": 0.30,
    "pension_age": 0.15,
    "fund_return_rate": 0.10
  },
  "feature_effects": {
    "contribution_rate_1pp": 3.2,
    "replacement_rate_1pp_down": 2.1,
    "pension_age_1yr": 1.5,
    "fund_return_rate_1pp": 2.8
  }
}
```

### Monte Carlo Simulation
```
POST /analysis/monte-carlo
```
Regime-Switching 모델을 사용하여 기금수익률 변동성을 반영한 시뮬레이션을 수행합니다.

**Request Body:**
```json
{
  "params": {
    "contribution_rate": 0.09,
    "replacement_rate": 0.40,
    "pension_age": 65,
    "fund_return_rate": 0.055
  },
  "n_simulations": 1000
}
```

**Response:**
```json
{
  "median_depletion_year": 2056,
  "ci_90_lower": 2048,
  "ci_90_upper": 2065,
  "ci_50_lower": 2052,
  "ci_50_upper": 2060,
  "distribution": [0, 0, 5, 12, ...],
  "n_simulations": 1000
}
```

### Generational Analysis
```
POST /analysis/generations
```
K-means 클러스터링을 사용하여 출생연도별 세대를 분류하고 수익비를 분석합니다.

**Response:**
```json
{
  "generations": [
    {
      "birth_year": 1960,
      "contribution_years": 30,
      "benefit_years": 25,
      "total_contribution": 50000000,
      "total_benefit": 120000000,
      "roi": 2.4,
      "cluster": 0,
      "cluster_name": "수혜 세대"
    }
  ],
  "clusters": {
    "0": "수혜 세대",
    "1": "전환 세대",
    "2": "부담 세대",
    "3": "위기 세대"
  },
  "equity_index": 0.65
}
```

## Development

### Setup

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### Run

```bash
# 개발 서버 실행
uvicorn main:app --reload --port 8080

# 또는
python -m uvicorn main:app --reload --port 8080
```

### Docker

```bash
# 이미지 빌드
docker build -t npfs-ml-api .

# 컨테이너 실행
docker run -p 8080:8080 npfs-ml-api
```

## Project Structure

```
ml-api/
├── main.py              # FastAPI 앱 진입점
├── requirements.txt     # Python 의존성
├── Dockerfile
├── core/
│   ├── schemas.py       # Pydantic 모델 정의
│   └── simulation.py    # 시뮬레이션 엔진
└── routers/
    ├── health.py        # 헬스 체크
    ├── shap_analysis.py # 변수 중요도 분석
    ├── monte_carlo.py   # Monte Carlo 시뮬레이션
    └── generation.py    # 세대별 분석
```

## ML Methods

### 1. Variable Importance (SHAP-style)

```python
# GradientBoostingRegressor로 정책 변수 → 고갈 연도 관계 학습
model = GradientBoostingRegressor(n_estimators=100)
model.fit(X_train, y_train)
importance = model.feature_importances_
```

### 2. Monte Carlo with Regime-Switching

```python
# 경제 상황별 수익률 분포
regimes = {
    'normal': {'mean': 0.055, 'std': 0.03, 'prob': 0.7},
    'boom': {'mean': 0.08, 'std': 0.04, 'prob': 0.15},
    'crisis': {'mean': 0.02, 'std': 0.05, 'prob': 0.15}
}
```

### 3. K-means Generation Clustering

```python
# 세대를 4개 그룹으로 분류
kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(features)
```

## License

MIT
