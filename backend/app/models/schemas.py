from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UploadedReport(BaseModel):
    filename: str
    file_type: str
    content_preview: str
    uploaded_at: datetime


class ActivityEntry(BaseModel):
    app_name: str
    window_title: Optional[str] = None
    duration_seconds: int
    timestamp: datetime


class ActivitySummary(BaseModel):
    date: str
    top_apps: list[dict]
    total_tracked_seconds: int
    session_entries: list[ActivityEntry]


class ReportGenerationRequest(BaseModel):
    report_type: str  # "daily", "weekly", "social_media"
    date_range: Optional[str] = None
    additional_notes: Optional[str] = None
    tone: str = "professional"  # "professional", "casual", "concise"


class GeneratedReport(BaseModel):
    report_type: str
    content: str
    generated_at: datetime
    based_on_templates: list[str]
    based_on_activity: Optional[ActivitySummary] = None
    email_sent: bool = False
