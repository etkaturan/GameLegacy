from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.models import identity as identity_model  # noqa: F401 — register model with Base
from app.api.v1 import steam, identity, inventory

app = FastAPI(
    title="GameLegacy API",
    description="Backend API for the GameLegacy platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(steam.router, prefix="/api/v1")
app.include_router(identity.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok", "service": "GameLegacy API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}