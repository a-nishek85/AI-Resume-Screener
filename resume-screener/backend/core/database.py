from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from .config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class JobDescriptionDB(Base):
    __tablename__ = "job_descriptions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    raw_text = Column(Text)
    required_skills = Column(Text)
    nice_to_have_skills = Column(Text, default="[]")
    experience_required = Column(String)
    min_experience_years = Column(Integer, default=0)
    qualifications = Column(Text, default="[]")
    certifications = Column(Text, default="[]")
    responsibilities = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)


class CandidateDB(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    jd_id = Column(Integer, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    summary = Column(Text)
    raw_text = Column(Text)
    skills = Column(Text, default="[]")
    certifications = Column(Text, default="[]")
    education = Column(Text, default="[]")
    experience = Column(Text, default="[]")
    projects = Column(Text, default="[]")
    total_years_experience = Column(Integer, default=0)
    # Scores (0.0–1.0 scale)
    skills_score = Column(Float, default=0)
    experience_score = Column(Float, default=0)
    education_score = Column(Float, default=0)
    projects_score = Column(Float, default=0)
    communication_score = Column(Float, default=0)
    total_score = Column(Float, default=0)
    # AI outputs
    justifications = Column(Text, default="{}")
    confidence_score = Column(Float, default=0)
    # HR
    shortlisted = Column(Integer, default=0)
    hr_status = Column(String, nullable=True)
    hr_comment = Column(Text, nullable=True)
    score_adjustment = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()