from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = "Technology"
    status: Optional[str] = "Active"
    progress: Optional[int] = 0
    is_favorite: Optional[bool] = False
    
    # New research workspace fields
    business_question: Optional[str] = None
    objectives: Optional[str] = None
    keywords: Optional[str] = None
    research_timeline: Optional[str] = None
    executive_brief: Optional[str] = None
    action_plan: Optional[str] = None
    presentation_slides: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    is_favorite: Optional[bool] = None
    
    # New research workspace fields
    business_question: Optional[str] = None
    objectives: Optional[str] = None
    keywords: Optional[str] = None
    research_timeline: Optional[str] = None
    executive_brief: Optional[str] = None
    action_plan: Optional[str] = None
    presentation_slides: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True


# --- Statistics Schemas ---
class DashboardStats(BaseModel):
    total_projects: int
    reports_generated: int
    sources_collected: int
    executive_briefs_created: int


# --- Source Schemas ---
class SourceBase(BaseModel):
    title: str
    author: Optional[str] = None
    organization: Optional[str] = None
    publication_date: Optional[str] = None
    source_type: Optional[str] = "Website URL"
    source_url: Optional[str] = None
    credibility_score: Optional[int] = 80
    status: Optional[str] = "Indexed"
    tags: Optional[str] = None
    content: Optional[str] = None
    is_favorite: Optional[bool] = False

    # Structured research columns
    analysis_summary: Optional[str] = None
    analysis_findings: Optional[str] = None # JSON string list
    analysis_stats: Optional[str] = None    # JSON string list
    analysis_insights: Optional[str] = None # JSON string list
    analysis_quotes: Optional[str] = None   # JSON string list of quotes with citations
    analysis_keywords: Optional[str] = None
    analysis_confidence: Optional[int] = 95
    verified_facts: Optional[str] = None    # JSON string list
    ai_interpretation: Optional[str] = None # JSON string list
    assumptions: Optional[str] = None       # JSON string list
    open_questions: Optional[str] = None    # JSON string list

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    organization: Optional[str] = None
    publication_date: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    credibility_score: Optional[int] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    content: Optional[str] = None
    is_favorite: Optional[bool] = None

    analysis_summary: Optional[str] = None
    analysis_findings: Optional[str] = None
    analysis_stats: Optional[str] = None
    analysis_insights: Optional[str] = None
    analysis_quotes: Optional[str] = None
    analysis_keywords: Optional[str] = None
    analysis_confidence: Optional[int] = None
    verified_facts: Optional[str] = None
    ai_interpretation: Optional[str] = None
    assumptions: Optional[str] = None
    open_questions: Optional[str] = None

class SourceOut(SourceBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Evidence Schemas ---
class EvidenceBase(BaseModel):
    claim: str
    supporting_evidence: Optional[str] = None
    source: Optional[str] = None
    publication_date: Optional[str] = None
    evidence_type: Optional[str] = "Metric" # Metric, Quote, Trend, Stat
    confidence_level: Optional[str] = "High" # High, Medium, Low
    business_impact: Optional[str] = None
    recommendation: Optional[str] = None
    risk: Optional[str] = None
    priority: Optional[str] = "High" # Critical, High, Medium, Low

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceUpdate(BaseModel):
    claim: Optional[str] = None
    supporting_evidence: Optional[str] = None
    source: Optional[str] = None
    publication_date: Optional[str] = None
    evidence_type: Optional[str] = None
    confidence_level: Optional[str] = None
    business_impact: Optional[str] = None
    recommendation: Optional[str] = None
    risk: Optional[str] = None
    priority: Optional[str] = None

class EvidenceOut(EvidenceBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
