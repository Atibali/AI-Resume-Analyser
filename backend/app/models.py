from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_path = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis = relationship("Analysis", uselist=False, back_populates="resume", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False, unique=True)
    overall_score = Column(Integer, nullable=False)
    ats_score = Column(Integer, nullable=False)
    ats_tips = Column(JSON, nullable=False, default=[])
    tone_style_score = Column(Integer, nullable=False)
    tone_style_tips = Column(JSON, nullable=False, default=[])
    content_score = Column(Integer, nullable=False)
    content_tips = Column(JSON, nullable=False, default=[])
    structure_score = Column(Integer, nullable=False)
    structure_tips = Column(JSON, nullable=False, default=[])
    skills_score = Column(Integer, nullable=False)
    skills_tips = Column(JSON, nullable=False, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analysis")
