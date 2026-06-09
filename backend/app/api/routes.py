from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Resume, Analysis
from app.schemas import AnalysisResponse
from app.services.pdf_service import PDFService
from app.services.storage import StorageService
from app.services.resume_analyzer import ResumeAnalyzer
from app.config import get_settings
from app.utils.validators import (
    validate_pdf_file,
    validate_company_name,
    validate_job_title,
    validate_job_description,
)
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["api"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    company_name: str = Form(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload a resume and job details."""
    resume_id = str(uuid.uuid4())
    settings = get_settings()
    file_path = None

    try:
        if not file.filename or not validate_pdf_file(file.filename):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        if not validate_company_name(company_name):
            raise HTTPException(status_code=400, detail="Company name is required")

        if not validate_job_title(job_title):
            raise HTTPException(status_code=400, detail="Job title is required")

        if not validate_job_description(job_description):
            raise HTTPException(
                status_code=400,
                detail="Job description must be at least 20 characters",
            )

        file_path = StorageService.save_upload_file(file, resume_id)

        image_path = None
        try:
            image_path = PDFService.convert_to_image(file_path, settings.upload_dir, resume_id)
        except Exception as img_err:
            logger.warning("Image conversion failed for %s: %s", resume_id, img_err)

        resume = Resume(
            id=resume_id,
            file_path=file_path,
            image_path=image_path,
            company_name=company_name.strip(),
            job_title=job_title.strip(),
            job_description=job_description.strip(),
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "id": resume.id,
            "message": "Resume uploaded successfully",
            "company_name": resume.company_name,
            "job_title": resume.job_title,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload failed for resume %s", resume_id)
        db.rollback()
        if file_path:
            try:
                StorageService.delete_file(file_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/analyze/{resume_id}")
async def analyze_resume(
    resume_id: str,
    force: bool = False,
    db: Session = Depends(get_db)
):
    """Analyze a resume against its job description using AI."""
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        existing_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
        if existing_analysis and not force:
            return AnalysisResponse.from_orm(existing_analysis)

        if existing_analysis and force:
            db.delete(existing_analysis)
            db.commit()

        resume_text = PDFService.extract_text(resume.file_path)
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from the uploaded PDF",
            )

        analyzer = ResumeAnalyzer()
        analysis_data = analyzer.analyze_resume(
            resume_text,
            resume.job_title,
            resume.job_description
        )

        analysis = Analysis(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            overall_score=analysis_data["overall_score"],
            ats_score=analysis_data["ats_score"],
            ats_tips=analysis_data["ats_tips"],
            tone_style_score=analysis_data["tone_style_score"],
            tone_style_tips=analysis_data["tone_style_tips"],
            content_score=analysis_data["content_score"],
            content_tips=analysis_data["content_tips"],
            structure_score=analysis_data["structure_score"],
            structure_tips=analysis_data["structure_tips"],
            skills_score=analysis_data["skills_score"],
            skills_tips=analysis_data["skills_tips"],
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return AnalysisResponse.from_orm(analysis)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Analysis failed for resume %s", resume_id)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/resumes")
async def get_all_resumes(db: Session = Depends(get_db)):
    """Get all resumes with their analysis summaries."""
    resumes = db.query(Resume).all()
    result = []

    for resume in resumes:
        analysis = db.query(Analysis).filter(Analysis.resume_id == resume.id).first()
        result.append({
            "id": resume.id,
            "company_name": resume.company_name,
            "job_title": resume.job_title,
            "created_at": resume.created_at,
            "overall_score": analysis.overall_score if analysis else None,
            "image_path": resume.image_path,
        })

    return result


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: str, db: Session = Depends(get_db)):
    """Get resume details with analysis."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()

    return {
        "id": resume.id,
        "file_path": resume.file_path,
        "image_path": resume.image_path,
        "company_name": resume.company_name,
        "job_title": resume.job_title,
        "job_description": resume.job_description,
        "created_at": resume.created_at,
        "analysis": AnalysisResponse.from_orm(analysis).dict() if analysis else None,
    }


@router.delete("/resume/{resume_id}")
async def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    """Delete a resume and its analysis."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        StorageService.delete_file(resume.file_path)
        if resume.image_path:
            StorageService.delete_file(resume.image_path)

        db.delete(resume)
        db.commit()

        return {"message": "Resume deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.get("/analysis/{resume_id}")
async def get_analysis(resume_id: str, db: Session = Depends(get_db)):
    """Get analysis for a specific resume."""
    analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisResponse.from_orm(analysis)
