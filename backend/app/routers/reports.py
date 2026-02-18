from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime
import shutil

from app.services.report_parser import parse_file
from app.models.schemas import UploadedReport

router = APIRouter(prefix="/reports", tags=["reports"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
PARSED_DIR = UPLOAD_DIR / "parsed"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PARSED_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".md"}


@router.post("/upload", response_model=UploadedReport)
async def upload_report(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{suffix}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    save_path = UPLOAD_DIR / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        content, file_type = parse_file(str(save_path))
    except Exception as e:
        save_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Could not parse file: {str(e)}")

    parsed_path = PARSED_DIR / f"{Path(file.filename).stem}.txt"
    parsed_path.write_text(content, encoding="utf-8")

    return UploadedReport(
        filename=file.filename,
        file_type=file_type,
        content_preview=content[:500] + ("..." if len(content) > 500 else ""),
        uploaded_at=datetime.now()
    )


@router.get("/templates")
async def list_templates():
    templates = []
    for f in PARSED_DIR.glob("*.txt"):
        preview = f.read_text(encoding="utf-8")[:300]
        templates.append({
            "name": f.stem,
            "preview": preview,
            "size_chars": f.stat().st_size
        })
    return {"templates": templates, "count": len(templates)}


@router.delete("/templates/{name}")
async def delete_template(name: str):
    parsed_path = PARSED_DIR / f"{name}.txt"
    if not parsed_path.exists():
        raise HTTPException(status_code=404, detail="Template not found")
    parsed_path.unlink()
    return {"status": "deleted", "name": name}
