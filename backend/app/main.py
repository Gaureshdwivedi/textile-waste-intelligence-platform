from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Textile Waste Intelligence Platform API"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }