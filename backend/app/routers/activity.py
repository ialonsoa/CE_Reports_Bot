from fastapi import APIRouter
from app.services import activity_monitor

router = APIRouter(prefix="/activity", tags=["activity"])


@router.post("/start")
async def start_monitoring(interval_seconds: int = 5):
    result = activity_monitor.start_monitoring(interval_seconds)
    return result


@router.post("/stop")
async def stop_monitoring():
    return activity_monitor.stop_monitoring()


@router.get("/status")
async def monitoring_status():
    return {
        "is_running": activity_monitor.is_monitoring(),
        "summary": activity_monitor.get_session_summary()
    }


@router.get("/summary")
async def get_summary():
    return activity_monitor.get_session_summary()
