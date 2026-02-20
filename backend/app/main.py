import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import reports, activity, generate, schedules
from app.services import scheduler as sched_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    sched_service.init_scheduler()
    yield
    sched_service.scheduler.shutdown(wait=False)


app = FastAPI(
    title="CE Reports Bot",
    description="Intelligent report assistant that learns from your past reports and daily activity.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow local dev + GitHub Pages + any extra origins from env
_extra = [o for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ialonsoa.github.io",
    *_extra,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)
app.include_router(activity.router)
app.include_router(generate.router)
app.include_router(schedules.router)


@app.get("/")
async def root():
    return {
        "name": "CE Reports Bot",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
