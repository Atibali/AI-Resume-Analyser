from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.config import get_settings
import os

# Import models before init_db to register them with SQLAlchemy
from app.models import Resume, Analysis

settings = get_settings()

# Create uploads directory if it doesn't exist
os.makedirs(settings.upload_dir, exist_ok=True)

app = FastAPI(title=settings.app_name)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()


@app.on_event("startup")
async def startup_event():
    print("Starting up AI Resume Analyzer...")


@app.get("/health")
async def health():
    return {"status": "ok"}


# Import and include routes after app is initialized
from app.api import routes
app.include_router(routes.router)
