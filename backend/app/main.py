from fastapi import FastAPI
from app.config import settings
from app.database import Base, engine

# Import models
from app.models.user import User

Base.metadata.create_all(bind=engine)

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