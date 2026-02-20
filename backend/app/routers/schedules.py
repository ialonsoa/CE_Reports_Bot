from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import scheduler as sched_service

router = APIRouter(prefix="/schedules", tags=["schedules"])


class ScheduleCreate(BaseModel):
    report_type: str        # "daily" | "weekly" | "social_media"
    tone: str               # "professional" | "casual" | "concise"
    days: list[int]         # 0=Mon … 6=Sun
    time: str               # "HH:MM"
    notes: str = ""


@router.get("")
async def list_schedules():
    return sched_service.get_schedules()


@router.post("", status_code=201)
async def create_schedule(body: ScheduleCreate):
    if not body.days:
        raise HTTPException(status_code=422, detail="At least one day is required.")
    return sched_service.create_schedule(
        report_type=body.report_type,
        tone=body.tone,
        days=body.days,
        time=body.time,
        notes=body.notes,
    )


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: str):
    if not sched_service.delete_schedule(schedule_id):
        raise HTTPException(status_code=404, detail="Schedule not found.")
    return {"deleted": schedule_id}


@router.patch("/{schedule_id}/toggle")
async def toggle_schedule(schedule_id: str):
    updated = sched_service.toggle_schedule(schedule_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Schedule not found.")
    return updated
