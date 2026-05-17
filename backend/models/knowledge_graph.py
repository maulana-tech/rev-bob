"""
Knowledge Graph data models
Stores repository knowledge graphs for legacy code analysis
"""

from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class KnowledgeGraph(Base):
    """
    Knowledge Graph model for storing repository analysis
    """
    __tablename__ = "knowledge_graphs"
    
    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String, unique=True, index=True)
    repo_name = Column(String, index=True)
    
    # Graph data
    nodes = Column(JSON)  # List of nodes (files, classes, functions)
    edges = Column(JSON)  # List of edges (dependencies, relationships)
    
    # Repository metadata
    metadata = Column(JSON)  # Language, file count, LOC, etc.
    
    # Analysis results
    architecture = Column(JSON, nullable=True)  # Architecture analysis from IBM Bob
    danger_zones = Column(JSON, nullable=True)  # Risky code areas
    patterns = Column(JSON, nullable=True)  # Detected design patterns
    
    # Statistics
    total_files = Column(Integer, default=0)
    total_functions = Column(Integer, default=0)
    total_classes = Column(Integer, default=0)
    total_lines = Column(Integer, default=0)
    
    # IBM Bob metrics
    bob_session_id = Column(String, nullable=True)
    tokens_used = Column(Integer, default=0)
    
    # Status
    status = Column(String, default="pending")  # pending, indexing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    indexed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<KnowledgeGraph(id={self.id}, repo={self.repo_name}, status={self.status})>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "repo_url": self.repo_url,
            "repo_name": self.repo_name,
            "nodes": self.nodes,
            "edges": self.edges,
            "metadata": self.metadata,
            "architecture": self.architecture,
            "danger_zones": self.danger_zones,
            "patterns": self.patterns,
            "total_files": self.total_files,
            "total_functions": self.total_functions,
            "total_classes": self.total_classes,
            "total_lines": self.total_lines,
            "bob_session_id": self.bob_session_id,
            "tokens_used": self.tokens_used,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "indexed_at": self.indexed_at.isoformat() if self.indexed_at else None
        }

# Made with Bob
