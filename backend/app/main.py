from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.services.auth_service import seed_demo_user_if_needed
from app.routers import (
    auth_router,
    users_router,
    sleep_router,
    alarms_router,
    analytics_router,
    ai_coach_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist without overwriting
    init_db()
    # Only seed default demo user when operating on local SQLite
    if settings.DATABASE_URL.startswith("sqlite"):
        db = SessionLocal()
        try:
            seed_demo_user_if_needed(db)
        finally:
            db.close()
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# 🌙 Sleep Cycle™ REST API

Commercial-quality backend service powering **Sleep Cycle™** intelligent sleep wellness and circadian recovery.

### Features
* **JWT Authentication**: Secure user registration, authentication, and session tokens.
* **User Profile & Targets**: Biological targets, chronotype mapping, and sensory preferences.
* **Acoustic Sleep Tracking**: Start, monitor, and finalize sleep sessions with cycle breakdown (Deep, REM, Light, Awake).
* **Sleep History & Bank**: Query historical sleep sessions, logs, and biometrics.
* **Smart Alarms**: Configure gentle light-phase wake windows (±10m, ±20m, ±30m) and melodic chimes.
* **Sleep Analytics**: 7d, 30d, 90d aggregates, circadian regularity index, and weekly clinical reports.
* **Somna AI Sleep Coach**: Configurable AI reasoning engine delivering neurobiologically grounded sleep hygiene and bedtime schedules.
* **Database**: PostgreSQL on Supabase with zero-config local SQLite fallback.
    """,
    openapi_tags=[
        {"name": "Authentication", "description": "User registration, login, and token issuance"},
        {"name": "Users & Profile", "description": "Profile info, targets, and sensory preferences"},
        {"name": "Sleep Tracking & History", "description": "Active session recording and historical sleep data"},
        {"name": "Smart Alarms", "description": "Light-phase wake alarms and melody configuration"},
        {"name": "Sleep Analytics & Reports", "description": "Biometric trends, habit correlations, and weekly reports"},
        {"name": "AI Sleep Coach", "description": "Circadian intelligence consultation and bedtime calculation"},
    ],
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|0\.0\.0\.0)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(sleep_router, prefix=settings.API_V1_STR)
app.include_router(alarms_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(ai_coach_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "sleepcycle-backend"}
