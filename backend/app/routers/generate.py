from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.models.schemas import ReportGenerationRequest, GeneratedReport
from app.services import ai_generator, activity_monitor

router = APIRouter(prefix="/generate", tags=["generate"])


@router.post("/report", response_model=GeneratedReport)
async def generate_report(request: ReportGenerationRequest):
    activity_summary = activity_monitor.get_session_summary()

    try:
        content = ai_generator.generate_report(
            report_type=request.report_type,
            activity_summary=activity_summary,
            additional_notes=request.additional_notes or "",
            tone=request.tone
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    templates_used = [
        f.stem
        for f in (ai_generator.UPLOAD_DIR / "parsed").glob("*.txt")
    ]

    return GeneratedReport(
        report_type=request.report_type,
        content=content,
        generated_at=datetime.now(),
        based_on_templates=templates_used,
        based_on_activity=None
    )
