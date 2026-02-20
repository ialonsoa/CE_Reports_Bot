"""
Manages recurring report schedules using APScheduler.
Schedules are persisted to schedules.json and restored on startup.
Each job generates a report and emails it automatically.
"""
import json
import uuid
from datetime import datetime
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.services import ai_generator, activity_monitor
from app.services.email_service import send_report_email

SCHEDULES_FILE = Path(__file__).parent.parent / "schedules.json"

scheduler = AsyncIOScheduler()


def _load_schedules() -> list[dict]:
    if not SCHEDULES_FILE.exists():
        return []
    return json.loads(SCHEDULES_FILE.read_text(encoding="utf-8"))


def _save_schedules(schedules: list[dict]) -> None:
    SCHEDULES_FILE.write_text(json.dumps(schedules, indent=2), encoding="utf-8")


def _run_scheduled_report(
    schedule_id: str, report_type: str, tone: str, notes: str = ""
) -> None:
    """Synchronous job: generate report and email it."""
    try:
        activity_summary = activity_monitor.get_session_summary()
        content = ai_generator.generate_report(
            report_type=report_type,
            activity_summary=activity_summary,
            additional_notes=notes,
            tone=tone,
        )
        today = datetime.now().strftime("%B %d, %Y")
        subject = f"[CE Reports Bot] {report_type.replace('_', ' ').title()} — {today}"
        send_report_email(subject=subject, content=content)
        print(f"[Scheduler] Sent {report_type} report (schedule {schedule_id})")
    except Exception as exc:
        print(f"[Scheduler] ERROR for schedule {schedule_id}: {exc}")


def _register_job(schedule: dict) -> None:
    """Add an APScheduler cron job for this schedule (only if active)."""
    if not schedule.get("active", True):
        return
    days_str = ",".join(str(d) for d in schedule["days"])
    hour, minute = schedule["time"].split(":")
    scheduler.add_job(
        _run_scheduled_report,
        trigger=CronTrigger(
            day_of_week=days_str,
            hour=int(hour),
            minute=int(minute),
        ),
        id=schedule["id"],
        replace_existing=True,
        kwargs={
            "schedule_id": schedule["id"],
            "report_type": schedule["report_type"],
            "tone": schedule["tone"],
            "notes": schedule.get("notes", ""),
        },
    )


# ── Public API ────────────────────────────────────────────────────────────────

def init_scheduler() -> None:
    """Load persisted schedules and start the APScheduler instance."""
    for s in _load_schedules():
        _register_job(s)
    scheduler.start()


def get_schedules() -> list[dict]:
    return _load_schedules()


def create_schedule(
    report_type: str,
    tone: str,
    days: list[int],
    time: str,
    notes: str = "",
) -> dict:
    schedules = _load_schedules()
    schedule = {
        "id": str(uuid.uuid4()),
        "report_type": report_type,
        "tone": tone,
        "days": days,
        "time": time,
        "notes": notes,
        "active": True,
        "created_at": datetime.now().isoformat(),
    }
    schedules.append(schedule)
    _save_schedules(schedules)
    _register_job(schedule)
    return schedule


def delete_schedule(schedule_id: str) -> bool:
    schedules = _load_schedules()
    filtered = [s for s in schedules if s["id"] != schedule_id]
    if len(filtered) == len(schedules):
        return False
    _save_schedules(filtered)
    if scheduler.get_job(schedule_id):
        scheduler.remove_job(schedule_id)
    return True


def toggle_schedule(schedule_id: str) -> dict | None:
    schedules = _load_schedules()
    for s in schedules:
        if s["id"] == schedule_id:
            s["active"] = not s.get("active", True)
            _save_schedules(schedules)
            if s["active"]:
                _register_job(s)
            elif scheduler.get_job(schedule_id):
                scheduler.remove_job(schedule_id)
            return s
    return None
