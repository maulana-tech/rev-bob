"""
IBM Bob Session data models
Tracks IBM Bob sessions for hackathon reporting
"""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class BobSession(Base):
    """
    IBM Bob Session model for tracking AI interactions
    """
    __tablename__ = "bob_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    
    # Session metadata
    feature = Column(String, index=True)  # code_review, devflow, legacy_code
    user_id = Column(String, nullable=True, index=True)
    
    # Session data
    calls = Column(JSON, default=list)  # List of all API calls
    total_calls = Column(Integer, default=0)
    successful_calls = Column(Integer, default=0)
    failed_calls = Column(Integer, default=0)
    
    # Token usage
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    # Performance metrics
    average_response_time_ms = Column(Integer, default=0)
    total_processing_time_ms = Column(Integer, default=0)
    
    # Session status
    status = Column(String, default="active")  # active, closed, expired
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<BobSession(id={self.id}, session_id={self.session_id}, calls={self.total_calls})>"
    
    def add_call(self, call_data: dict):
        """Add a new API call to the session"""
        if self.calls is None:
            self.calls = []
        self.calls.append(call_data)
        self.total_calls += 1
        
        if call_data.get("status") == "success":
            self.successful_calls += 1
        else:
            self.failed_calls += 1
        
        # Update token counts
        self.total_input_tokens += call_data.get("input_tokens", 0)
        self.total_output_tokens += call_data.get("output_tokens", 0)
        self.total_tokens = self.total_input_tokens + self.total_output_tokens
        
        # Update processing time
        response_time = call_data.get("response_time_ms", 0)
        self.total_processing_time_ms += response_time
        if self.total_calls > 0:
            self.average_response_time_ms = self.total_processing_time_ms // self.total_calls
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "feature": self.feature,
            "user_id": self.user_id,
            "calls": self.calls,
            "total_calls": self.total_calls,
            "successful_calls": self.successful_calls,
            "failed_calls": self.failed_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "average_response_time_ms": self.average_response_time_ms,
            "total_processing_time_ms": self.total_processing_time_ms,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None
        }
    
    def export_for_hackathon(self):
        """Export session data for hackathon submission"""
        return {
            "session_id": self.session_id,
            "feature": self.feature,
            "summary": {
                "total_calls": self.total_calls,
                "successful_calls": self.successful_calls,
                "failed_calls": self.failed_calls,
                "success_rate": f"{(self.successful_calls / self.total_calls * 100):.1f}%" if self.total_calls > 0 else "0%",
                "total_tokens": self.total_tokens,
                "input_tokens": self.total_input_tokens,
                "output_tokens": self.total_output_tokens,
                "average_response_time_ms": self.average_response_time_ms,
                "total_processing_time_ms": self.total_processing_time_ms
            },
            "calls": self.calls,
            "timestamps": {
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "closed_at": self.closed_at.isoformat() if self.closed_at else None,
                "duration": str(self.closed_at - self.created_at) if self.closed_at and self.created_at else None
            }
        }

# Made with Bob
