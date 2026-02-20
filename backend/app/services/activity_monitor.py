"""
Monitors active applications on macOS to build a picture of daily work habits.
Tracks which apps are in the foreground and for how long.
On non-macOS systems (e.g. the Render Linux host) monitoring is a no-op.
"""
import platform
import time
import subprocess
import json
from datetime import datetime
from collections import defaultdict
from threading import Thread, Event
from pathlib import Path


SESSION_LOG_PATH = Path(__file__).parent.parent / "uploads" / "activity_session.json"

_stop_event = Event()
_session_data: list[dict] = []
_is_running = False


def get_active_app_macos() -> tuple[str, str]:
    """Returns (app_name, window_title) for the currently focused app on macOS."""
    if platform.system() != "Darwin":
        return "Unavailable", ""
    script = """
    tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
    end tell
    return appName
    """
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=2
        )
        app_name = result.stdout.strip()
        return app_name, ""
    except Exception:
        return "Unknown", ""


def _monitor_loop(interval_seconds: int = 5):
    global _session_data
    app_timers: dict[str, int] = defaultdict(int)
    last_app = ""

    while not _stop_event.is_set():
        app_name, window_title = get_active_app_macos()

        if app_name and app_name != "Unknown":
            app_timers[app_name] += interval_seconds
            if app_name != last_app:
                _session_data.append({
                    "app_name": app_name,
                    "window_title": window_title,
                    "timestamp": datetime.now().isoformat(),
                    "duration_seconds": interval_seconds
                })
                last_app = app_name

        _save_session(app_timers)
        time.sleep(interval_seconds)


def _save_session(app_timers: dict):
    data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "top_apps": sorted(
            [{"app": k, "seconds": v} for k, v in app_timers.items()],
            key=lambda x: x["seconds"],
            reverse=True
        ),
        "total_tracked_seconds": sum(app_timers.values()),
        "entries": _session_data[-100:]  # keep last 100 entries in memory
    }
    SESSION_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SESSION_LOG_PATH, "w") as f:
        json.dump(data, f, indent=2)


def start_monitoring(interval_seconds: int = 5):
    global _is_running, _stop_event
    if _is_running:
        return {"status": "already_running"}
    _stop_event.clear()
    _is_running = True
    thread = Thread(target=_monitor_loop, args=(interval_seconds,), daemon=True)
    thread.start()
    return {"status": "started", "interval_seconds": interval_seconds}


def stop_monitoring():
    global _is_running
    _stop_event.set()
    _is_running = False
    return {"status": "stopped"}


def get_session_summary() -> dict:
    if SESSION_LOG_PATH.exists():
        with open(SESSION_LOG_PATH, "r") as f:
            return json.load(f)
    return {"date": datetime.now().strftime("%Y-%m-%d"), "top_apps": [], "total_tracked_seconds": 0, "entries": []}


def is_monitoring() -> bool:
    return _is_running
