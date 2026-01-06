"""
NPFS ML API
국민연금 재정 시뮬레이터 - ML 분석 서버
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import health, shap_analysis, monte_carlo, generation, voter_reach

app = FastAPI(
    title="NPFS ML API",
    description="국민연금 재정 시뮬레이터 ML 분석 API",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health.router, tags=["Health"])
app.include_router(shap_analysis.router, prefix="/analysis", tags=["SHAP Analysis"])
app.include_router(monte_carlo.router, prefix="/analysis", tags=["Monte Carlo"])
app.include_router(generation.router, prefix="/analysis", tags=["Generation Analysis"])
app.include_router(voter_reach.router, prefix="/api/voter-reach", tags=["Voter Reach"])


@app.get("/")
async def root():
    return {
        "service": "NPFS ML API",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health",
            "shap": "/analysis/shap",
            "monte_carlo": "/analysis/monte-carlo",
            "generations": "/analysis/generations",
            "voter_reach": {
                "stations": "/api/voter-reach/stations",
                "ridership": "/api/voter-reach/ridership",
                "election": "/api/voter-reach/election",
                "optimize": "/api/voter-reach/optimize",
                "heatmap": "/api/voter-reach/heatmap",
            },
        }
    }
