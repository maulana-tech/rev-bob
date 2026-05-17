"""
Health check endpoints
"""

from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("NODE_ENV", "development")
    }

@router.get("/health/ready")
async def readiness_check():
    """Readiness check endpoint"""
    # TODO: Add checks for database, IBM Bob API, etc.
    return {
        "status": "ready",
        "checks": {
            "database": "ok",
            "ibm_bob": "ok",
            "github_api": "ok"
        }
    }

@router.get("/health/live")
async def liveness_check():
    """Liveness check endpoint"""
    return {"status": "alive"}

# Made with Bob
