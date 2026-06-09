# AI Resume Analyzer

An AI-powered web app that analyzes PDF resumes against a target job description. Upload a resume, add the role details, and get scored feedback across five categories with actionable tips for improvement.

## Features

- PDF resume upload with optional preview image generation
- Job-specific analysis powered by Groq (primary) with Gemini fallback
- Weighted scoring across ATS, skills, content, structure, and tone
- Keyword and structure checks blended with AI scores for more consistent results
- Dashboard to browse, filter, and revisit past analyses

## Tech Stack

**Backend**
- Python 3.11+
- FastAPI + Uvicorn
- SQLAlchemy with SQLite (PostgreSQL supported via env)
- Groq API (Llama models) for analysis
- Google Gemini as optional fallback
- pdfplumber + pdf2image for PDF processing

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Zustand

## Project Structure

```
AI-Resume-Analyser/
├── backend/
│   ├── run.py                       # Dev server entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                  # FastAPI app setup
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── api/
│       │   └── routes.py            # REST endpoints only
│       ├── services/
│       │   ├── resume_analyzer.py   # Groq/Gemini AI analysis
│       │   ├── pdf_service.py       # PDF text + preview extraction
│       │   ├── scoring.py           # Weighted score normalization
│       │   └── storage.py           # File upload/delete helpers
│       └── utils/
│           └── validators.py
└── frontend/
    ├── src/
    │   ├── pages/                   # Route-level page components
    │   │   ├── HomePage.tsx
    │   │   ├── UploadPage.tsx
    │   │   └── ResumePage.tsx
    │   ├── components/
    │   │   ├── analysis/            # Score display + feedback UI
    │   │   ├── common/              # Shared UI primitives
    │   │   ├── layout/              # App shell components
    │   │   └── resume/              # Resume list/card components
    │   ├── lib/                     # API client, store, utilities
    │   ├── types/
    │   ├── router.tsx
    │   └── App.tsx
    └── package.json
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Groq API key](https://console.groq.com) (required)
- Optional: [Google AI Studio key](https://aistudio.google.com) for Gemini fallback

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here   # optional fallback
DATABASE_URL=sqlite:///./test.db
UPLOAD_DIR=uploads
```

Start the API:

```bash
python run.py
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` requests to the backend on port 8000.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF + job details |
| `POST` | `/api/analyze/{resume_id}` | Run analysis (`?force=true` to re-run) |
| `GET` | `/api/resumes` | List all resumes |
| `GET` | `/api/resume/{resume_id}` | Get resume + analysis |
| `GET` | `/api/analysis/{resume_id}` | Get analysis only |
| `DELETE` | `/api/resume/{resume_id}` | Delete resume and files |

## How Scoring Works

Each resume is scored from **0–100** in five categories. The overall score is a **weighted average**:

| Category | Weight | What it measures |
|----------|--------|--------------------|
| Skills Match | 30% | Required/preferred skills vs. the job description |
| Content Quality | 25% | Relevance, impact, and quantified achievements |
| ATS Compatibility | 20% | Keyword coverage and ATS-friendly formatting |
| Structure & Formatting | 15% | Section clarity, layout, and scannability |
| Tone & Style | 10% | Professional, concise writing |

After the AI assigns category scores, the backend clamps values, blends keyword/structure heuristics, and computes the final weighted overall score server-side.

### Score Labels

| Score | Label |
|-------|-------|
| 85–100 | Excellent |
| 70–84 | Good |
| 55–69 | Fair |
| 0–54 | Needs Work |

## Development

### Frontend type check

```bash
cd frontend
npm run type-check
```

### Production build

```bash
cd frontend
npm run build
```

## Troubleshooting

**Connection refused**
- Ensure backend (`:8000`) and frontend (`:5173`) are both running

**PDF upload fails**
- Use a valid PDF under ~10 MB
- Confirm the `uploads/` directory is writable

**Analysis fails**
- Verify `GROQ_API_KEY` in `backend/.env`
- Add `GOOGLE_API_KEY` if Groq is rate-limited
- Check backend logs for provider-specific errors

**Empty analysis**
- Some image-heavy or scanned PDFs may not extract text well; try a text-based PDF