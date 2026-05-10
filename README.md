#  AI Resume Screening — HR Shortlisting Agent

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**AI-powered recruitment assistant — screen, score, and shortlist candidates faster and fairer.**

[Features](#-features) • [Quick Start](#-quick-start) • [How It Works](#-how-it-works) • [API](#-api-endpoints) • [Security](#-security)

</div>

---

## What It Does

Upload a Job Description + batch of resumes → get a ranked shortlist with AI-generated scores, justifications, and a downloadable report. HR keeps full override control.

**Solves:** Volume overload, reviewer fatigue, unconscious bias, and missing audit trails in manual screening.

---

## Features

| Category | Capability |
|---|---|
| **Input** | JD upload (PDF / plain text), batch resume upload (PDF + DOCX) |
| **AI Scoring** | GPT-4o evaluates each candidate across 5 weighted dimensions |
| **Ranking** | Candidates sorted by weighted total score (0–10 scale) |
| **Reports** | Export shortlist as PDF or JSON |
| **Human Control** | Override any AI score with a logged reason + timestamp |
| **Audit Trail** | Every decision stored in SQLite with full provenance |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Backend | FastAPI (Python 3.10+), async REST API |
| AI / LLM | GPT-4o via OpenAI API (structured JSON mode) |
| Embeddings | SentenceTransformers `all-MiniLM-L6-v2` |
| Resume Parsing | PyMuPDF (PDF) + python-docx (DOCX) |
| Database | SQLite via SQLAlchemy |
| Export | ReportLab (PDF) + Python `json` |
| Config | python-dotenv (`.env` file) |

---

##  Quick Start

### Prerequisites
Python  3.10+
Node.js 18+
npm     9+
Git
OpenAI API key (GPT-4o access required)
```

### 1 — Clone

```bash
git clone https://github.com/your-username/ai-resume-screening.git
cd ai-resume-screening
```

### 2 — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3 — Environment Variables

```bash
cp .env.example .env
# Open .env and fill in your values:
```

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
EMBEDDING_MODEL=all-MiniLM-L6-v2
DATABASE_URL=sqlite:///./screening.db
MAX_UPLOAD_SIZE_MB=10
REPORT_OUTPUT_DIR=./reports
UPLOAD_TEMP_DIR=./uploads
```

> Never commit `.env`. It is already in `.gitignore`.

### 4 — Frontend

```bash
cd frontend
npm install
```

### 5 — Run

**Terminal 1 — Backend:**
```bash
cd backend && source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
→ API: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```
→ App: `http://localhost:5173`

---

## How It Works

```
HR uploads JD + resumes
        ↓
GPT-4o parses JD → extracts skills, experience, education, domain
        ↓
Each resume parsed → structured candidate profile
        ↓
SentenceTransformers → cosine similarity (JD ↔ resume)
        ↓
GPT-4o scores each candidate across 5 dimensions (JSON mode)
        ↓
Weighted total computed → candidates ranked
        ↓
HR reviews → overrides if needed → downloads PDF/JSON report
```

### Scoring Dimensions

| Dimension | Weight | What's Evaluated |
|---|---|---|
| Skills Match | 30% | Required vs candidate skills coverage |
| Experience Relevance | 25% | Domain match and years of experience |
| Projects / Portfolio | 20% | Demonstrated work and production-grade output |
| Education & Certs | 15% | Degree, certifications, relevant qualifications |
| Communication Quality | 10% | Resume clarity, structure, grammar |

Each dimension receives a score of 0–10 with a one-line justification. Output labels: **HIRE / REVIEW / NO-HIRE** (advisory only — final call stays with HR).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/jd/upload` | Upload and parse a Job Description |
| `GET` | `/api/jd/{jd_id}` | Retrieve parsed JD requirements |
| `POST` | `/api/resumes/upload` | Upload one or more resume files |
| `GET` | `/api/resumes/{session_id}` | List parsed resumes in a session |
| `POST` | `/api/scoring/run` | Trigger AI scoring |
| `GET` | `/api/scoring/results/{session_id}` | Retrieve ranked results |
| `POST` | `/api/override/{candidate_id}` | Submit score override with reason |
| `GET` | `/api/report/{session_id}/pdf` | Download PDF shortlist report |
| `GET` | `/api/report/{session_id}/json` | Download JSON shortlist report |

**Sample response:**
```json
{
  "candidate_id": "c_001",
  "name": "Priya Sharma",
  "total_score": 8.2,
  "recommendation": "HIRE",
  "dimensions": {
    "skills_match":            { "score": 9, "justification": "Matches 9/10 required skills including Python, FastAPI, NLP." },
    "experience_relevance":    { "score": 8, "justification": "4 years ML engineering, exact domain match." },
    "education_certifications":{ "score": 7, "justification": "B.Tech CS + AWS Certified ML Specialty." },
    "projects_portfolio":      { "score": 9, "justification": "Three production NLP projects with GitHub links." },
    "communication_quality":   { "score": 8, "justification": "Well-structured resume, clear summaries, no grammar issues." }
  }
}
```

---

## Security

| Risk | Mitigation |
|---|---|
| Prompt injection | Resume text sanitised before LLM insertion; input truncated to safe limit |
| PII exposure | Processing is local; names replaced with session IDs in logs |
| API key leakage | Keys loaded from `.env` only; `.gitignore` enforced; pre-commit hook warns on key patterns |
| Hallucination / score drift | GPT-4o JSON mode enforced; Pydantic schema validates all outputs; scores outside 0–10 rejected |
| Unauthorised access | Session token validation; rate limiting middleware; CORS restricted to known frontend origin |
| Malicious file uploads | MIME type validation (not just extension); file size capped by `MAX_UPLOAD_SIZE_MB`; files deleted after processing |

---

## Folder Structure

```
ai-resume-screening/
├── backend/
│   ├── main.py                  # App entrypoint
│   ├── config.py                # Env variable loading
│   ├── database.py              # SQLite setup
│   ├── models.py                # Pydantic + ORM models
│   ├── routers/
│   │   ├── jd.py                # JD upload/parse
│   │   ├── resumes.py           # Resume ingestion
│   │   ├── scoring.py           # Scoring + ranking
│   │   ├── report.py            # Report export
│   │   └── override.py          # Human override
│   ├── services/
│   │   ├── jd_parser.py         # LLM JD extraction
│   │   ├── resume_parser.py     # PDF/DOCX text extraction
│   │   ├── embedding_service.py # Semantic similarity
│   │   ├── scoring_agent.py     # GPT-4o rubric scoring
│   │   └── report_generator.py  # PDF/JSON builder
│   ├── prompts/
│   │   ├── jd_extraction_prompt.txt
│   │   └── scoring_prompt.txt
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Home, Results
│   │   └── api/client.js        # Axios wrapper
│   ├── vite.config.js
│   └── package.json
├── sample_data/                 # Sample JD + 5 resumes
├── sample_output/               # Example shortlist PDF
└── README.md
```

---

##  Roadmap

- LinkedIn profile URL ingestion
- Multi-role session management
- Bias audit layer (flags demographic signal correlation)
- Celery + Redis batch queue for 50+ resumes
- ATS webhook connector (Greenhouse, Lever, Workday)
- Role-based access control (Admin / Recruiter / Viewer)
- Auto-generated interview questions per candidate

---

<div align="center">

Built as part of the AI Internship Programme — Task 1: HR Resume & LinkedIn Shortlisting Agent

*Issues and PRs welcome.*

</div>
