import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import alerts, clients, dashboard, probes, sites
from app.config import settings
from app.probes.scheduler import load_all_probes, start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("trackguard")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("TrackGuard starting up...")
    start_scheduler()
    await load_all_probes()
    logger.info("TrackGuard ready")
    yield
    # Shutdown
    logger.info("TrackGuard shutting down...")
    stop_scheduler()


app = FastAPI(
    title="TrackGuard",
    description="Monitoring & alerting for client tracking infrastructure",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(clients.router, prefix="/api")
app.include_router(sites.router, prefix="/api")
app.include_router(probes.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "trackguard"}
