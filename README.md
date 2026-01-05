# Policy Lab

> Public Policy & Data Science Portfolio

정책 분석과 데이터 사이언스를 결합한 개인 연구 포트폴리오 사이트입니다. 머신러닝과 시뮬레이션 기법을 활용하여 evidence-based policy research를 수행합니다.

## Overview

이 프로젝트는 공공정책 분석을 위한 도구와 연구 결과를 공유하는 웹 플랫폼입니다. 현재 주요 프로젝트로 **국민연금 재정 시뮬레이터**가 포함되어 있습니다.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| ML API | Python, FastAPI, scikit-learn, NumPy, Pandas |
| Database | AWS DynamoDB |
| Infrastructure | Docker, Turborepo (Monorepo) |

## Project Structure

```
npfs/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx              # 홈페이지
│   │   │   │   ├── about/                # About Me
│   │   │   │   ├── projects/             # 프로젝트 목록
│   │   │   │   │   └── pension-simulator/ # 국민연금 시뮬레이터
│   │   │   │   └── research/             # Research
│   │   │   ├── components/     # React 컴포넌트
│   │   │   └── lib/            # 유틸리티 함수
│   │   └── ...
│   └── ml-api/                 # Python ML API (FastAPI)
│       ├── main.py
│       ├── core/               # 핵심 로직
│       │   ├── schemas.py      # Pydantic 모델
│       │   └── simulation.py   # 시뮬레이션 엔진
│       └── routers/            # API 엔드포인트
│           ├── shap_analysis.py
│           ├── monte_carlo.py
│           └── generation.py
├── packages/
│   └── types/                  # 공유 TypeScript 타입
├── infra/
│   └── docker/                 # Docker 설정
└── docs/                       # 문서
```

## Featured Project: 국민연금 재정 시뮬레이터

보험료율, 소득대체율 등 정책 변수를 조정하여 기금 고갈 시점을 예측하고, ML 기반 분석으로 세대간 형평성과 불확실성을 시각화합니다.

### Features

| 기능 | 설명 | 기술 |
|------|------|------|
| **시뮬레이션** | 정책 변수 조정에 따른 기금 잔액 변화 예측 | TypeScript |
| **세대별 분석** | K-means 클러스터링을 통한 세대간 형평성 분석 | Python, scikit-learn |
| **불확실성** | Monte Carlo 시뮬레이션으로 기금수익률 변동성 반영 | Python, NumPy |
| **ML 인사이트** | Gradient Boosting 모델 기반 변수 중요도 분석 | Python, scikit-learn |

### ML Analysis Details

#### 1. SHAP-style Variable Importance
- GradientBoostingRegressor로 정책 변수 → 고갈 연도 관계 학습
- 각 변수의 영향력을 정량화하여 정책 우선순위 도출

#### 2. Monte Carlo Simulation
- Regime-Switching 모델로 경제 상황별 수익률 변동성 반영
- 1,000회 시뮬레이션으로 90% 신뢰구간 추정

#### 3. Generational Equity Analysis
- K-means 클러스터링으로 세대를 4개 그룹으로 분류
- 수혜 세대, 전환 세대, 부담 세대, 위기 세대

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Installation

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/npfs.git
cd npfs

# 2. 의존성 설치
npm install

# 3. Python 환경 설정 (ml-api)
cd apps/ml-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### Development

```bash
# Docker로 DynamoDB 실행
npm run docker:db:start

# ML API 실행 (별도 터미널)
cd apps/ml-api
uvicorn main:app --reload --port 8080

# Next.js 개발 서버 실행
cd apps/web
npm run dev
```

사이트 접속: http://localhost:3000

### Docker Compose (전체 스택)

```bash
cd infra/docker
docker compose up -d
```

## API Endpoints

### ML API (Port 8080)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | 헬스 체크 |
| `/analysis/shap` | POST | 변수 중요도 분석 |
| `/analysis/monte-carlo` | POST | Monte Carlo 시뮬레이션 |
| `/analysis/generations` | POST | 세대별 분석 |

### Request Example

```bash
curl -X POST http://localhost:8080/analysis/shap \
  -H "Content-Type: application/json" \
  -d '{
    "contribution_rate": 0.09,
    "replacement_rate": 0.40,
    "pension_age": 65,
    "fund_return_rate": 0.055
  }'
```

## Data Sources

- 통계청 장래인구추계 (2022)
- 국민연금 제5차 재정계산 (2023)
- 한국은행 경제통계

## License

MIT License

## Author

Public Policy & Data Science Researcher

---

*이 프로젝트는 교육 및 연구 목적으로 제작되었습니다. 실제 국민연금 재정추계와 다를 수 있습니다.*
