from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, projects

# Create database tables
Base.metadata.create_all(bind=engine)

# Dynamic column migrations for existing SQLite databases
from sqlalchemy import text
with engine.connect() as conn:
    for col, col_type in [
        ("business_question", "TEXT"),
        ("objectives", "TEXT"),
        ("keywords", "VARCHAR"),
        ("research_timeline", "VARCHAR"),
        ("executive_brief", "TEXT"),
        ("action_plan", "TEXT"),
        ("presentation_slides", "TEXT")
    ]:
        try:
            conn.execute(text(f"ALTER TABLE projects ADD COLUMN {col} {col_type}"))
            conn.commit()
        except Exception:
            pass # Column already exists or table doesn't support it

    for col, col_type in [
        ("analysis_summary", "TEXT"),
        ("analysis_findings", "TEXT"),
        ("analysis_stats", "TEXT"),
        ("analysis_insights", "TEXT"),
        ("analysis_quotes", "TEXT"),
        ("analysis_keywords", "VARCHAR"),
        ("analysis_confidence", "INTEGER"),
        ("verified_facts", "TEXT"),
        ("ai_interpretation", "TEXT"),
        ("assumptions", "TEXT"),
        ("open_questions", "TEXT")
    ]:
        try:
            conn.execute(text(f"ALTER TABLE sources ADD COLUMN {col} {col_type}"))
            conn.commit()
        except Exception:
            pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://inquira-ai-assisted-research.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
