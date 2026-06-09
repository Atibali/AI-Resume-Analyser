from pydantic import BaseModel
from typing import List
from datetime import datetime


class TipItem(BaseModel):
    type: str
    tip: str


class AnalysisResponse(BaseModel):
    id: str
    resume_id: str
    overall_score: int
    ats_score: int
    ats_tips: List[TipItem]
    tone_style_score: int
    tone_style_tips: List[TipItem]
    content_score: int
    content_tips: List[TipItem]
    structure_score: int
    structure_tips: List[TipItem]
    skills_score: int
    skills_tips: List[TipItem]
    created_at: datetime

    class Config:
        from_attributes = True
