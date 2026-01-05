"""Health check endpoint"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "service": "npfs-ml-api",
    }
