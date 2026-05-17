"""
DevFlow Agent Package

Sub-agents for workflow automation and developer productivity
"""

from .git_history_analyzer import (
    GitHistoryAnalyzerAgent,
    GitAnalysis,
    CommitInfo,
    FileChurn,
    DeveloperMetrics,
    WorkPattern
)
from .test_generator import (
    TestGeneratorAgent,
    GeneratedTests,
    TestCase,
    TestFramework,
    FunctionSignature
)
from .documentation_agent import (
    DocumentationAgent,
    Documentation
)
from .changelog_agent import (
    ChangelogAgent,
    ChangelogEntry,
    ChangelogVersion
)
from .analytics_agent import (
    AnalyticsAgent,
    TaskMetric,
    ProductivityReport
)

__all__ = [
    # Git History Analyzer
    'GitHistoryAnalyzerAgent',
    'GitAnalysis',
    'CommitInfo',
    'FileChurn',
    'DeveloperMetrics',
    'WorkPattern',
    # Test Generator
    'TestGeneratorAgent',
    'GeneratedTests',
    'TestCase',
    'TestFramework',
    'FunctionSignature',
    # Documentation
    'DocumentationAgent',
    'Documentation',
    # Changelog
    'ChangelogAgent',
    'ChangelogEntry',
    'ChangelogVersion',
    # Analytics
    'AnalyticsAgent',
    'TaskMetric',
    'ProductivityReport',
]

# Made with Bob
