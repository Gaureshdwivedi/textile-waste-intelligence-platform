from fastapi import FastAPI
from app.config import settings
from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.models.textile import Textile
from app.models.user import User
from app.routers.textile import router as textile_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(textile_router)