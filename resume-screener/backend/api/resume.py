import json, time
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import shutil

from core.database import get_db, JobDescriptionDB, CandidateDB
from core.config import settings
from utils.file_handler import extract_text, clean_text
from services.llm_extractor import extract_resume_data, extract_jd_data
from services.scorer import score_candidate

router = APIRouter(prefix="/api/resume", tags=["Resume"])

# Simple in-memory rate limiter
_rate_cache: dict = {}
RATE_LIMIT = 30  # requests per minute


def _check_rate(request: Request):
    ip = request.client.host
    now = time.time()
    window = _rate_cache.get(ip, [])
    window = [t for t in window if now - t < 60]
    if len(window) >= RATE_LIMIT:
        raise HTTPException(429, "Rate limit exceeded. Try again later.")
    window.append(now)
    _rate_cache[ip] = window


ALLOWED_EXTS = {".pdf", ".docx", ".txt"}
MAX_SIZE_BYTES = settings.max_file_size_mb * 1024 * 1024


def _validate_file(file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, f"File type '{ext}' not allowed. Use PDF, DOCX, or TXT.")
    # Prevent path traversal
    safe_name = Path(file.filename).name
    if ".." in safe_name or "/" in safe_name:
        raise HTTPException(400, "Invalid filename")
    return ext, safe_name


@router.post("/upload")
async def upload_resumes(
    request: Request,
    jd_id: int = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    _check_rate(request)

    if len(files) > 50:
        raise HTTPException(400, "Maximum 50 resumes per batch")

    jd = db.query(JobDescriptionDB).filter(JobDescriptionDB.id == jd_id).first()
    if not jd:
        raise HTTPException(404, "Job Description not found")

    jd_data = {
        "required_skills": json.loads(jd.required_skills or "[]"),
        "nice_to_have_skills": json.loads(jd.nice_to_have_skills or "[]"),
        "qualifications": json.loads(jd.qualifications or "[]"),
        "experience_required": jd.experience_required,
        "min_experience_years": jd.min_experience_years or 0,
    }
    jd_raw_text = jd.raw_text or ""

    results, errors = [], []

    for file in files:
        try:
            ext, safe_name = _validate_file(file)
            content = await file.read()
            if len(content) > MAX_SIZE_BYTES:
                errors.append({"file": file.filename, "error": "File too large"})
                continue

            save_path = f"{settings.upload_dir}/resumes/{safe_name}"
            with open(save_path, "wb") as f:
                f.write(content)

            raw_text = clean_text(extract_text(save_path))
            if len(raw_text) < 50:
                errors.append({"file": file.filename, "error": "Could not extract sufficient text"})
                continue

            candidate_data = extract_resume_data(raw_text)
            candidate_data["_raw_text"] = raw_text
            scores = score_candidate(candidate_data, jd_data, jd_raw_text)

            candidate = CandidateDB(
                jd_id=jd_id,
                name=candidate_data.get("name", "Unknown"),
                email=candidate_data.get("email"),
                phone=candidate_data.get("phone"),
                summary=candidate_data.get("summary"),
                raw_text=raw_text,
                skills=json.dumps(candidate_data.get("skills", [])),
                certifications=json.dumps(candidate_data.get("certifications", [])),
                education=json.dumps(candidate_data.get("education", [])),
                experience=json.dumps(candidate_data.get("experience", [])),
                projects=json.dumps(candidate_data.get("projects", [])),
                total_years_experience=candidate_data.get("total_years_experience", 0),
                skills_score=scores["skills_score"],
                experience_score=scores["experience_score"],
                education_score=scores["education_score"],
                projects_score=scores["projects_score"],
                communication_score=scores["communication_score"],
                total_score=scores["total_score"],
                confidence_score=scores["confidence_score"],
                justifications=json.dumps(scores.get("justifications", {})),
                shortlisted=1 if scores["total_score"] >= 0.65 else 0
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            results.append({
                "id": candidate.id, "name": candidate.name,
                "file": file.filename, "total_score": scores["total_score"],
                "shortlisted": bool(candidate.shortlisted)
            })
        except Exception as e:
            errors.append({"file": file.filename, "error": str(e)})

    return {"processed": len(results), "errors": len(errors), "results": results, "error_details": errors}