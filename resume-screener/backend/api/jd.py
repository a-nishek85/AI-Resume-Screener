import json
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
from pathlib import Path

from core.database import get_db, JobDescriptionDB
from core.config import settings
from utils.file_handler import extract_text, clean_text
from services.llm_extractor import extract_jd_data

router = APIRouter(prefix="/api/jd", tags=["Job Description"])

ALLOWED_EXTS = {".pdf", ".docx", ".txt"}


@router.post("/upload")
async def upload_jd(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Use PDF, DOCX, or TXT.")

    # 2. Sanitize filename
    safe_name = Path(file.filename).name
    if ".." in safe_name or "/" in safe_name:
        raise HTTPException(400, "Invalid filename")

    # 3. Ensure upload directory exists
    jd_dir = Path(settings.upload_dir) / "jd"
    jd_dir.mkdir(parents=True, exist_ok=True)
    save_path = str(jd_dir / safe_name)

    # 4. Save file
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(400, "Uploaded file is empty")
        with open(save_path, "wb") as f:
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to save file: {str(e)}")

    # 5. Extract text
    try:
        raw_text = extract_text(save_path)
        raw_text = clean_text(raw_text)
        if len(raw_text.strip()) < 20:
            raise ValueError("Extracted text too short — file may be image-only PDF")
    except Exception as e:
        raise HTTPException(422, f"Could not extract text: {str(e)}")

    # 6. AI extraction (has graceful fallback — never raises)
    try:
        jd_data = extract_jd_data(raw_text)
    except Exception as e:
        raise HTTPException(500, f"AI extraction failed unexpectedly: {str(e)}")

    # 7. Save to DB
    try:
        jd_record = JobDescriptionDB(
            title=title.strip() or jd_data.get("title", "Untitled"),
            raw_text=raw_text,
            required_skills=json.dumps(jd_data.get("required_skills", [])),
            nice_to_have_skills=json.dumps(jd_data.get("nice_to_have_skills", [])),
            experience_required=jd_data.get("experience_required", "Not specified"),
            min_experience_years=jd_data.get("min_experience_years", 0),
            qualifications=json.dumps(jd_data.get("qualifications", [])),
            certifications=json.dumps(jd_data.get("certifications", [])),
            responsibilities=json.dumps(jd_data.get("responsibilities", [])),
        )
        db.add(jd_record)
        db.commit()
        db.refresh(jd_record)
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")

    return {
        "id": jd_record.id,
        "title": jd_record.title,
        "required_skills": jd_data.get("required_skills", []),
        "nice_to_have_skills": jd_data.get("nice_to_have_skills", []),
        "experience_required": jd_data.get("experience_required", "Not specified"),
        "min_experience_years": jd_data.get("min_experience_years", 0),
        "qualifications": jd_data.get("qualifications", []),
        "certifications": jd_data.get("certifications", []),
        "responsibilities": jd_data.get("responsibilities", []),
    }


@router.get("/list")
def list_jds(db: Session = Depends(get_db)):
    jds = db.query(JobDescriptionDB).order_by(JobDescriptionDB.created_at.desc()).all()
    return [{"id": j.id, "title": j.title, "created_at": str(j.created_at)} for j in jds]


@router.get("/{jd_id}")
def get_jd(jd_id: int, db: Session = Depends(get_db)):
    jd = db.query(JobDescriptionDB).filter(JobDescriptionDB.id == jd_id).first()
    if not jd:
        raise HTTPException(404, "JD not found")
    return {
        "id": jd.id, "title": jd.title,
        "required_skills": json.loads(jd.required_skills or "[]"),
        "experience_required": jd.experience_required,
        "qualifications": json.loads(jd.qualifications or "[]"),
        "created_at": str(jd.created_at),
    }