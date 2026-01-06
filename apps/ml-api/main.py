"""
NPFS ML API
국민연금 재정 시뮬레이터 - ML 분석 서버
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Always available routers
from routers import health
from routers import voter_reach

app = FastAPI(
    title="NPFS ML API",
    description="국민연금 재정 시뮬레이터 ML 분석 API",
    version="0.1.0",
)

# CORS 설정
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록 - Always available
app.include_router(health.router, tags=["Health"])
app.include_router(voter_reach.router, prefix="/api/voter-reach", tags=["Voter Reach"])

# Optional routers (require numpy, sklearn, etc.)
try:
    from routers import shap_analysis, monte_carlo, generation
    app.include_router(shap_analysis.router, prefix="/analysis", tags=["SHAP Analysis"])
    app.include_router(monte_carlo.router, prefix="/analysis", tags=["Monte Carlo"])
    app.include_router(generation.router, prefix="/analysis", tags=["Generation Analysis"])
    ML_ENDPOINTS_AVAILABLE = True
except ImportError:
    ML_ENDPOINTS_AVAILABLE = False


@app.get("/")
async def root():
    endpoints = {
        "health": "/health",
        "voter_reach": {
            "stations": "/api/voter-reach/stations",
            "ridership": "/api/voter-reach/ridership",
            "election": "/api/voter-reach/election",
            "optimize": "/api/voter-reach/optimize",
            "heatmap": "/api/voter-reach/heatmap",
        },
    }

    if ML_ENDPOINTS_AVAILABLE:
        endpoints.update({
            "shap": "/analysis/shap",
            "monte_carlo": "/analysis/monte-carlo",
            "generations": "/analysis/generations",
        })

    return {
        "service": "NPFS ML API",
        "version": "0.1.0",
        "ml_endpoints_available": ML_ENDPOINTS_AVAILABLE,
        "endpoints": endpoints
    }
