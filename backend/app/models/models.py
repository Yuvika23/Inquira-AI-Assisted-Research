from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable in case of pure Google OAuth users
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=False, default="Technology")
    status = Column(String, nullable=False, default="Active")  # e.g., "Active", "Archived", "Completed"
    progress = Column(Integer, nullable=False, default=0)       # 0 to 100
    is_favorite = Column(Boolean, nullable=False, default=False)
    
    # New research workspace fields
    business_question = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    keywords = Column(String, nullable=True)
    research_timeline = Column(String, nullable=True)
    executive_brief = Column(Text, nullable=True) # JSON string storing structured briefs
    action_plan = Column(Text, nullable=True) # JSON string storing week milestones list
    presentation_slides = Column(Text, nullable=True) # JSON string storing list of 9 slides

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="projects")
    
    sources = relationship("Source", back_populates="project", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="project", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    publication_date = Column(String, nullable=True)
    source_type = Column(String, nullable=False, default="Website URL") # PDF Upload, Manual Notes, etc.
    source_url = Column(String, nullable=True)
    credibility_score = Column(Integer, nullable=False, default=80)
    status = Column(String, nullable=False, default="Indexed") # Indexed, Processing, Failed
    tags = Column(String, nullable=True)  # Comma-separated
    content = Column(Text, nullable=True)
    is_favorite = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Structured research columns
    analysis_summary = Column(Text, nullable=True)
    analysis_findings = Column(Text, nullable=True)  # JSON string
    analysis_stats = Column(Text, nullable=True)     # JSON string
    analysis_insights = Column(Text, nullable=True)  # JSON string
    analysis_quotes = Column(Text, nullable=True)    # JSON string
    analysis_keywords = Column(String, nullable=True)
    analysis_confidence = Column(Integer, nullable=True, default=95)
    verified_facts = Column(Text, nullable=True)     # JSON string
    ai_interpretation = Column(Text, nullable=True)  # JSON string
    assumptions = Column(Text, nullable=True)        # JSON string
    open_questions = Column(Text, nullable=True)     # JSON string
    
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    project = relationship("Project", back_populates="sources")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    claim = Column(String, nullable=False, index=True)
    supporting_evidence = Column(Text, nullable=True)
    source = Column(String, nullable=True)
    publication_date = Column(String, nullable=True)
    evidence_type = Column(String, nullable=False, default="Metric") # Metric, Quote, Trend, Stat
    confidence_level = Column(String, nullable=False, default="High") # High, Medium, Low
    business_impact = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    risk = Column(Text, nullable=True)
    priority = Column(String, nullable=False, default="High") # Critical, High, Medium, Low
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    project = relationship("Project", back_populates="evidence")
