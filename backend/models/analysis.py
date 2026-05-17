"""
Analysis data models
Stores results from code analysis, PR reviews, etc.
"""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class Analysis(Base):
    """
    Analysis model for storing analysis results
    """
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String, index=True)  # pr_review, workflow, explore
    feature = Column(String, index=True)  # code_review, devflow, legacy_code
    
    # Input data
    input_data = Column(JSON)  # Original request data
    
    # Analysis results
    result = Column(JSON)  # Structured analysis results
    raw_response = Column(Text, nullable=True)  # Raw IBM Bob response
    
    # Metadata
    status = Column(String, default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # IBM Bob metrics
    bob_session_id = Column(String, nullable=True)
    tokens_used = Column(Integer, default=0)
    processing_time_ms = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Analysis(id={self.id}, type={self.analysis_type}, status={self.status})>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "analysis_type": self.analysis_type,
            "feature": self.feature,
            "input_data": self.input_data,
            "result": self.result,
            "status": self.status,
            "error_message": self.error_message,
            "bob_session_id": self.bob_session_id,
            "tokens_used": self.tokens_used,
            "processing_time_ms": self.processing_time_ms,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

# Made with Bob
