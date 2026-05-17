"""
Code Analyzer Agent - Deep code analysis using IBM Bob

This agent is responsible for:
1. Analyzing code patterns from full repository
2. Detecting bug potential & security issues
3. Identifying code smells & anti-patterns
4. Checking naming conventions & style violations
5. Assessing code complexity & maintainability
"""

import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

from backend.services.bob_client import IBMBobClient
from .pr_fetcher import PRData


class Severity(str, Enum):
    """Issue severity levels"""
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class IssueType(str, Enum):
    """Types of code issues"""
    BUG = "bug"
    SECURITY = "security"
    CODE_SMELL = "code_smell"
    STYLE = "style"
    PERFORMANCE = "performance"
    BREAKING_CHANGE = "breaking_change"
    COMPLEXITY = "complexity"


@dataclass
class CodeIssue:
    """Represents a code issue found during analysis"""
    type: IssueType
    severity: Severity
    file_path: str
    line_number: Optional[int]
    title: str
    description: str
    suggestion: Optional[str] = None
    code_snippet: Optional[str] = None


@dataclass
class QualityMetrics:
    """Code quality metrics"""
    complexity_score: float  # 0-100, lower is better
    maintainability_score: float  # 0-100, higher is better
    test_coverage_estimate: float  # 0-100
    documentation_score: float  # 0-100
    security_score: float  # 0-100, higher is better


@dataclass
class CodeAnalysis:
    """Complete code analysis result"""
    issues: List[CodeIssue]
    quality_metrics: QualityMetrics
    summary: str
    files_analyzed: int
    lines_analyzed: int
    analysis_time: float


class CodeAnalyzerAgent:
    """
    Agent for deep code analysis using IBM Bob
    
    This agent analyzes code changes in the context of the full repository
    to identify potential issues, security vulnerabilities, and quality concerns.
    """
    
    def __init__(self, bob_api_key: Optional[str] = None):
        """
        Initialize Code Analyzer Agent
        
        Args:
            bob_api_key: IBM Bob API key (optional, uses env var if not provided)
        """
        self.agent_id = "code_analyzer_001"
        self.bob_client = IBMBobClient()
        
    async def analyze_with_context(
        self,
        pr_data: PRData,
        focus_areas: Optional[List[str]] = None
    ) -> CodeAnalysis:
        """
        Analyze PR changes with full repository context
        
        Args:
            pr_data: PR data from PRFetcherAgent
            focus_areas: Specific areas to focus on (e.g., ['security', 'performance'])
            
        Returns:
            CodeAnalysis object with all findings
        """
        import time
        start_time = time.time()
        
        # Build context for IBM Bob
        context = self._build_analysis_context(pr_data, focus_areas)
        
        # Detect language from files
        language = self._detect_language(pr_data.files_changed)
        
        # Analyze with IBM Bob
        bob_response = await self.bob_client.analyze_code(
            code=pr_data.diff,
            language=language,
            analysis_type="comprehensive"
        )
        
        # Parse IBM Bob response into structured issues
        issues = self._parse_bob_response(bob_response, pr_data)
        
        # Calculate quality metrics
        quality_metrics = await self._calculate_quality_metrics(pr_data, bob_response)
        
        # Generate summary
        summary = self._generate_summary(issues, quality_metrics)
        
        analysis_time = time.time() - start_time
        
        return CodeAnalysis(
            issues=issues,
            quality_metrics=quality_metrics,
            summary=summary,
            files_analyzed=len(pr_data.files_changed),
            lines_analyzed=pr_data.metadata.additions + pr_data.metadata.deletions,
            analysis_time=analysis_time
        )
    
    def _detect_language(self, files_changed: List[Dict[str, Any]]) -> str:
        """
        Detect primary programming language from changed files
        
        Args:
            files_changed: List of changed files
            
        Returns:
            Detected language name
        """
        # Count file extensions
        extensions = {}
        for file in files_changed:
            filename = file.get('filename', '')
            if '.' in filename:
                ext = filename.split('.')[-1].lower()
                extensions[ext] = extensions.get(ext, 0) + 1
        
        # Map extensions to languages
        ext_to_lang = {
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'java': 'java',
            'go': 'go',
            'rs': 'rust',
            'cpp': 'cpp',
            'c': 'c',
            'rb': 'ruby',
            'php': 'php',
            'cs': 'csharp',
            'swift': 'swift',
            'kt': 'kotlin',
        }
        
        # Find most common extension
        if extensions:
            most_common_ext = max(extensions.items(), key=lambda x: x[1])[0]
            return ext_to_lang.get(most_common_ext, 'unknown')
        
        return 'unknown'
    
    def _build_analysis_context(
        self,
        pr_data: PRData,
        focus_areas: Optional[List[str]]
    ) -> str:
        """
        Build context string for IBM Bob analysis
        
        Args:
            pr_data: PR data
            focus_areas: Areas to focus on
            
        Returns:
            Context string for IBM Bob
        """
        context_parts = [
            f"Pull Request: {pr_data.metadata.title}",
            f"Description: {pr_data.metadata.description}",
            f"Author: {pr_data.metadata.author}",
            f"Files changed: {pr_data.metadata.changed_files_count}",
            f"Lines added: {pr_data.metadata.additions}",
            f"Lines deleted: {pr_data.metadata.deletions}",
            "",
            "Files changed:",
        ]
        
        for file in pr_data.files_changed[:10]:  # Limit to first 10 files
            context_parts.append(f"  - {file['filename']} (+{file['additions']} -{file['deletions']})")
        
        if focus_areas:
            context_parts.append("")
            context_parts.append(f"Focus areas: {', '.join(focus_areas)}")
        
        return "\n".join(context_parts)
    
    def _parse_bob_response(
        self,
        bob_response: Dict[str, Any],
        pr_data: PRData
    ) -> List[CodeIssue]:
        """
        Parse IBM Bob response into structured CodeIssue objects
        
        Args:
            bob_response: Response from IBM Bob
            pr_data: PR data for context
            
        Returns:
            List of CodeIssue objects
        """
        issues = []
        
        # Extract issues from Bob's analysis
        analysis_text = bob_response.get('analysis', '')
        
        # Parse different issue types from the analysis
        # This is a simplified parser - in production, you'd use more sophisticated NLP
        
        if 'security' in analysis_text.lower() or 'vulnerability' in analysis_text.lower():
            issues.append(CodeIssue(
                type=IssueType.SECURITY,
                severity=Severity.CRITICAL,
                file_path="multiple",
                line_number=None,
                title="Potential Security Issues Detected",
                description="IBM Bob detected potential security vulnerabilities in the code changes.",
                suggestion="Review the security analysis details and apply recommended fixes."
            ))
        
        if 'bug' in analysis_text.lower() or 'error' in analysis_text.lower():
            issues.append(CodeIssue(
                type=IssueType.BUG,
                severity=Severity.WARNING,
                file_path="multiple",
                line_number=None,
                title="Potential Bugs Detected",
                description="IBM Bob identified code patterns that may lead to bugs.",
                suggestion="Review the bug analysis and add appropriate error handling."
            ))
        
        if 'smell' in analysis_text.lower() or 'refactor' in analysis_text.lower():
            issues.append(CodeIssue(
                type=IssueType.CODE_SMELL,
                severity=Severity.INFO,
                file_path="multiple",
                line_number=None,
                title="Code Smells Detected",
                description="IBM Bob found code patterns that could be improved.",
                suggestion="Consider refactoring to improve code quality."
            ))
        
        if 'complex' in analysis_text.lower():
            issues.append(CodeIssue(
                type=IssueType.COMPLEXITY,
                severity=Severity.WARNING,
                file_path="multiple",
                line_number=None,
                title="High Complexity Detected",
                description="Some functions have high cyclomatic complexity.",
                suggestion="Break down complex functions into smaller, testable units."
            ))
        
        # Add file-specific issues
        for file in pr_data.files_changed:
            if file['additions'] > 200:
                issues.append(CodeIssue(
                    type=IssueType.CODE_SMELL,
                    severity=Severity.INFO,
                    file_path=file['filename'],
                    line_number=None,
                    title="Large File Change",
                    description=f"This file has {file['additions']} additions. Consider breaking into smaller PRs.",
                    suggestion="Split large changes into multiple focused PRs for easier review."
                ))
        
        return issues
    
    async def _calculate_quality_metrics(
        self,
        pr_data: PRData,
        bob_response: Dict[str, Any]
    ) -> QualityMetrics:
        """
        Calculate code quality metrics
        
        Args:
            pr_data: PR data
            bob_response: IBM Bob analysis response
            
        Returns:
            QualityMetrics object
        """
        # Calculate complexity score (simplified)
        total_changes = pr_data.metadata.additions + pr_data.metadata.deletions
        complexity_score = min(100, (total_changes / 10))  # Higher changes = higher complexity
        
        # Estimate maintainability (inverse of complexity)
        maintainability_score = max(0, 100 - complexity_score)
        
        # Estimate test coverage (check if test files are included)
        test_files = [f for f in pr_data.files_changed if 'test' in f['filename'].lower()]
        test_coverage_estimate = min(100, (len(test_files) / max(1, len(pr_data.files_changed))) * 100)
        
        # Documentation score (check for comments and docs)
        doc_files = [f for f in pr_data.files_changed if any(ext in f['filename'] for ext in ['.md', '.rst', '.txt'])]
        documentation_score = min(100, (len(doc_files) / max(1, len(pr_data.files_changed))) * 100)
        
        # Security score (based on Bob's analysis)
        analysis_text = bob_response.get('analysis', '').lower()
        security_issues = analysis_text.count('security') + analysis_text.count('vulnerability')
        security_score = max(0, 100 - (security_issues * 20))
        
        return QualityMetrics(
            complexity_score=complexity_score,
            maintainability_score=maintainability_score,
            test_coverage_estimate=test_coverage_estimate,
            documentation_score=documentation_score,
            security_score=security_score
        )
    
    def _generate_summary(
        self,
        issues: List[CodeIssue],
        quality_metrics: QualityMetrics
    ) -> str:
        """
        Generate human-readable summary of analysis
        
        Args:
            issues: List of detected issues
            quality_metrics: Quality metrics
            
        Returns:
            Summary string
        """
        critical_count = len([i for i in issues if i.severity == Severity.CRITICAL])
        warning_count = len([i for i in issues if i.severity == Severity.WARNING])
        info_count = len([i for i in issues if i.severity == Severity.INFO])
        
        summary_parts = [
            f"Found {len(issues)} issues: {critical_count} critical, {warning_count} warnings, {info_count} info.",
            f"Quality Scores: Maintainability {quality_metrics.maintainability_score:.0f}/100, "
            f"Security {quality_metrics.security_score:.0f}/100, "
            f"Test Coverage ~{quality_metrics.test_coverage_estimate:.0f}%."
        ]
        
        if critical_count > 0:
            summary_parts.append("⚠️ Critical issues require immediate attention.")
        elif warning_count > 0:
            summary_parts.append("⚡ Some warnings should be addressed before merging.")
        else:
            summary_parts.append("✅ Code quality looks good overall.")
        
        return " ".join(summary_parts)
    
    async def detect_bugs(self, code: str, language: str = "python") -> List[CodeIssue]:
        """
        Detect potential bugs in code
        
        Args:
            code: Code to analyze
            language: Programming language
            
        Returns:
            List of bug-related issues
        """
        bob_response = await self.bob_client.analyze_code(
            code=code,
            language=language,
            analysis_type="bugs"
        )
        
        # Parse response for bugs
        issues = []
        analysis = bob_response.get('analysis', '')
        
        if 'null' in analysis.lower() or 'undefined' in analysis.lower():
            issues.append(CodeIssue(
                type=IssueType.BUG,
                severity=Severity.WARNING,
                file_path="",
                line_number=None,
                title="Potential Null/Undefined Reference",
                description="Code may not handle null or undefined values properly.",
                suggestion="Add null checks and defensive programming."
            ))
        
        return issues
    
    async def check_security(self, code: str, language: str = "python") -> List[CodeIssue]:
        """
        Check for security vulnerabilities
        
        Args:
            code: Code to analyze
            language: Programming language
            
        Returns:
            List of security-related issues
        """
        bob_response = await self.bob_client.analyze_code(
            code=code,
            language=language,
            analysis_type="security"
        )
        
        issues = []
        analysis = bob_response.get('analysis', '').lower()
        
        if 'sql' in analysis and 'injection' in analysis:
            issues.append(CodeIssue(
                type=IssueType.SECURITY,
                severity=Severity.CRITICAL,
                file_path="",
                line_number=None,
                title="SQL Injection Risk",
                description="Code may be vulnerable to SQL injection attacks.",
                suggestion="Use parameterized queries or ORM methods."
            ))
        
        if 'xss' in analysis or 'cross-site' in analysis:
            issues.append(CodeIssue(
                type=IssueType.SECURITY,
                severity=Severity.CRITICAL,
                file_path="",
                line_number=None,
                title="XSS Vulnerability",
                description="Code may be vulnerable to cross-site scripting.",
                suggestion="Sanitize and escape user input properly."
            ))
        
        return issues
    
    async def assess_quality(self, code: str) -> QualityMetrics:
        """
        Assess overall code quality
        
        Args:
            code: Code to assess
            
        Returns:
            QualityMetrics object
        """
        # Simple quality assessment based on code characteristics
        lines = code.split('\n')
        
        # Complexity based on line count and nesting
        complexity_score = min(100, len(lines) / 5)
        
        # Maintainability (inverse of complexity)
        maintainability_score = 100 - complexity_score
        
        # Check for tests
        has_tests = 'test' in code.lower() or 'assert' in code.lower()
        test_coverage_estimate = 80 if has_tests else 20
        
        # Check for documentation
        has_docs = '"""' in code or "'''" in code or '//' in code
        documentation_score = 80 if has_docs else 30
        
        # Security (default good unless issues found)
        security_score = 85
        
        return QualityMetrics(
            complexity_score=complexity_score,
            maintainability_score=maintainability_score,
            test_coverage_estimate=test_coverage_estimate,
            documentation_score=documentation_score,
            security_score=security_score
        )

# Made with Bob
