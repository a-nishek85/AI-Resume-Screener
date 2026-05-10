from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class JobDescriptionCreate(BaseModel):
    title: str


class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    required_skills: List[str]
    experience_required: str
    qualifications: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateScore(BaseModel):
    skills_score: float
    experience_score: float
    education_score: float
    projects_score: float
    communication_score: float
    total_score: float


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    skills: List[str]
    education: List[str]
    experience: List[str]
    projects: List[str]
    scores: CandidateScore
    shortlisted: bool
    rank: Optional[int] = None

    class Config:
        from_attributes = True


class ScreeningResult(BaseModel):
    jd_id: int
    total_candidates: int
    shortlisted_count: int
    candidates: List[CandidateResponse]