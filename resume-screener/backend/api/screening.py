import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from core.database import get_db, CandidateDB, JobDescriptionDB

router = APIRouter(prefix="/api/screening", tags=["Screening"])


class HROverride(BaseModel):
    status: Optional[str] = None        # "shortlisted" | "hold" | "rejected"
    score_adjustment: float = 0         # -20 to +20
    comment: Optional[str] = None


def _build_candidate(c: CandidateDB, rank: int) -> dict:
    raw_skills = json.loads(c.skills or "[]")
    raw_edu = json.loads(c.education or "[]")
    raw_exp = json.loads(c.experience or "[]")
    raw_proj = json.loads(c.projects or "[]")
    justifications = json.loads(c.justifications or "{}") if hasattr(c, 'justifications') else {}

    # Adjusted score (HR override applied)
    adj = getattr(c, 'score_adjustment', 0) or 0
    adjusted_total = min(100, max(0, round(c.total_score * 100 + adj, 1)))
    confidence = round(min(0.95, 0.5 + c.total_score * 0.5) * 100) / 100

    return {
        "rank": rank,
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "skills": raw_skills,
        "education": raw_edu,
        "experience": raw_exp,
        "projects": raw_proj,
        "summary": getattr(c, 'summary', None),
        "certifications": json.loads(getattr(c, 'certifications', None) or "[]"),
        "scores": {
            "skills_score": round(c.skills_score * 100, 1),
            "experience_score": round(c.experience_score * 100, 1),
            "education_score": round(c.education_score * 100, 1),
            "projects_score": round(c.projects_score * 100, 1),
            "communication_score": round(c.communication_score * 100, 1),
            "total_score": adjusted_total,
        },
        "justifications": justifications,
        "confidence_score": confidence,
        "shortlisted": bool(c.shortlisted),
        "hr_status": getattr(c, 'hr_status', None),
        "hr_comment": getattr(c, 'hr_comment', None),
        "score_adjustment": adj,
    }


@router.get("/results/{jd_id}")
def get_results(jd_id: int, shortlisted_only: bool = Query(False), db: Session = Depends(get_db)):
    jd = db.query(JobDescriptionDB).filter(JobDescriptionDB.id == jd_id).first()
    if not jd:
        raise HTTPException(404, "JD not found")

    q = db.query(CandidateDB).filter(CandidateDB.jd_id == jd_id)
    if shortlisted_only:
        q = q.filter(CandidateDB.shortlisted == 1)
    candidates = q.order_by(CandidateDB.total_score.desc()).all()

    ranked = [_build_candidate(c, i+1) for i, c in enumerate(candidates)]
    shortlisted_count = sum(1 for r in ranked if r["shortlisted"])

    return {
        "jd_id": jd_id,
        "jd_title": jd.title,
        "total_candidates": len(ranked),
        "shortlisted_count": shortlisted_count,
        "avg_score": round(sum(r["scores"]["total_score"] for r in ranked) / len(ranked), 1) if ranked else 0,
        "candidates": ranked,
    }


@router.post("/override/{candidate_id}")
def hr_override(candidate_id: int, body: HROverride, db: Session = Depends(get_db)):
    c = db.query(CandidateDB).filter(CandidateDB.id == candidate_id).first()
    if not c:
        raise HTTPException(404, "Candidate not found")

    if body.status == "shortlisted":
        c.shortlisted = 1
    elif body.status == "rejected":
        c.shortlisted = 0

    # Store override fields if columns exist
    if hasattr(c, 'hr_status') and body.status:
        c.hr_status = body.status
    if hasattr(c, 'hr_comment') and body.comment:
        c.hr_comment = body.comment
    if hasattr(c, 'score_adjustment'):
        c.score_adjustment = body.score_adjustment

    db.commit()
    return {"message": "Override saved", "candidate_id": candidate_id}


@router.get("/export/{jd_id}")
def export_shortlisted(jd_id: int, db: Session = Depends(get_db)):
    return get_results(jd_id, shortlisted_only=True, db=db)


@router.delete("/candidate/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    c = db.query(CandidateDB).filter(CandidateDB.id == candidate_id).first()
    if not c:
        raise HTTPException(404, "Not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}