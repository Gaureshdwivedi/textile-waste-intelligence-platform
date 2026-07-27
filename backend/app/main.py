from fastapi import FastAPI
from app.config import settings
from app.database import Base, engine
from app.routers.auth import router as auth_router

# Import models
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.include_router(auth_router)

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