from fastapi import FastAPI

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Textile Waste Intelligence Platform API",
        "status": "Running Successfully"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }