from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import reports, activity, generate

app = FastAPI(
    title="CE Reports Bot",
    description="Intelligent report assistant that learns from your past reports and daily activity.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)
app.include_router(activity.router)
app.include_router(generate.router)


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
