"""
Review Generator Agent - Generate human-readable review comments

This agent is responsible for:
1. Synthesizing analysis results
2. Generating actionable review comments
3. Categorizing by severity (Critical/Warning/Info)
4. Formatting for GitHub comment syntax
5. Including code suggestions & fixes
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from backend.services.bob_client import IBMBobClient
from .code_analyzer import CodeAnalysis, CodeIssue, Severity, IssueType
from .impact_graph import ImpactGraph


@dataclass
class ReviewComment:
    """Represents a single review comment"""
    severity: Severity
    title: str
    description: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    suggestion: Optional[str] = None
    code_snippet: Optional[str] = None


@dataclass
class ReviewReport:
    """Complete review report"""
    summary: str
    overall_score: float  # 0-100
    comments: List[ReviewComment]
    critical_count: int
    warning_count: int
    info_count: int
    github_markdown: str
    impact_summary: str
    recommendations: List[str]


class ReviewGeneratorAgent:
    """
    Agent for generating human-readable code review comments
    
    This agent takes analysis results and generates professional,
    actionable review comments formatted for GitHub.
    """
    
    def __init__(self):
        """Initialize Review Generator Agent"""
        self.agent_id = "review_generator_001"
        self.bob_client = IBMBobClient()
        
    async def generate_review(
        self,
        code_analysis: CodeAnalysis,
        impact_graph: ImpactGraph,
        pr_title: str,
        pr_description: str
    ) -> ReviewReport:
        """
        Generate complete review report
        
        Args:
            code_analysis: Code analysis results
            impact_graph: Impact graph data
            pr_title: PR title
            pr_description: PR description
            
        Returns:
            ReviewReport with all comments and formatting
        """
        # Convert issues to comments
        comments = self._convert_issues_to_comments(code_analysis.issues)
        
        # Count by severity
        critical_count = len([c for c in comments if c.severity == Severity.CRITICAL])
        warning_count = len([c for c in comments if c.severity == Severity.WARNING])
        info_count = len([c for c in comments if c.severity == Severity.INFO])
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(
            code_analysis, critical_count, warning_count
        )
        
        # Generate summary
        summary = self._generate_summary(
            code_analysis, impact_graph, overall_score
        )
        
        # Generate impact summary
        impact_summary = self._generate_impact_summary(impact_graph)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            code_analysis, impact_graph, critical_count, warning_count
        )
        
        # Format as GitHub markdown
        github_markdown = self._format_github_markdown(
            summary, comments, impact_summary, recommendations,
            overall_score, critical_count, warning_count, info_count
        )
        
        return ReviewReport(
            summary=summary,
            overall_score=overall_score,
            comments=comments,
            critical_count=critical_count,
            warning_count=warning_count,
            info_count=info_count,
            github_markdown=github_markdown,
            impact_summary=impact_summary,
            recommendations=recommendations
        )
    
    def _convert_issues_to_comments(
        self,
        issues: List[CodeIssue]
    ) -> List[ReviewComment]:
        """
        Convert CodeIssue objects to ReviewComment objects
        
        Args:
            issues: List of code issues
            
        Returns:
            List of review comments
        """
        comments = []
        
        for issue in issues:
            comments.append(ReviewComment(
                severity=issue.severity,
                title=issue.title,
                description=issue.description,
                file_path=issue.file_path,
                line_number=issue.line_number,
                suggestion=issue.suggestion,
                code_snippet=issue.code_snippet
            ))
        
        return comments
    
    def _calculate_overall_score(
        self,
        code_analysis: CodeAnalysis,
        critical_count: int,
        warning_count: int
    ) -> float:
        """
        Calculate overall code quality score
        
        Args:
            code_analysis: Code analysis results
            critical_count: Number of critical issues
            warning_count: Number of warnings
            
        Returns:
            Score from 0-100
        """
        # Start with quality metrics average
        metrics = code_analysis.quality_metrics
        base_score = (
            metrics.maintainability_score * 0.3 +
            metrics.security_score * 0.3 +
            metrics.test_coverage_estimate * 0.2 +
            metrics.documentation_score * 0.2
        )
        
        # Deduct points for issues
        penalty = (critical_count * 15) + (warning_count * 5)
        
        final_score = max(0, base_score - penalty)
        
        return round(final_score, 1)
    
    def _generate_summary(
        self,
        code_analysis: CodeAnalysis,
        impact_graph: ImpactGraph,
        overall_score: float
    ) -> str:
        """
        Generate review summary
        
        Args:
            code_analysis: Code analysis results
            impact_graph: Impact graph
            overall_score: Overall quality score
            
        Returns:
            Summary text
        """
        parts = []
        
        # Overall assessment
        if overall_score >= 80:
            parts.append("✅ **Excellent code quality!** This PR looks great overall.")
        elif overall_score >= 60:
            parts.append("👍 **Good code quality** with some areas for improvement.")
        elif overall_score >= 40:
            parts.append("⚠️ **Moderate concerns** - several issues should be addressed.")
        else:
            parts.append("🚨 **Significant issues detected** - please review carefully.")
        
        # Add metrics
        parts.append(f"\n**Overall Score:** {overall_score}/100")
        parts.append(f"**Files Changed:** {code_analysis.files_analyzed}")
        parts.append(f"**Lines Changed:** {code_analysis.lines_analyzed}")
        parts.append(f"**Impact Radius:** {impact_graph.impact_radius} levels")
        
        return "\n".join(parts)
    
    def _generate_impact_summary(self, impact_graph: ImpactGraph) -> str:
        """
        Generate impact analysis summary
        
        Args:
            impact_graph: Impact graph
            
        Returns:
            Impact summary text
        """
        parts = [
            "### 📊 Impact Analysis",
            "",
            f"- **Changed Files:** {len(impact_graph.changed_files)}",
            f"- **Affected Files:** {len(impact_graph.affected_files)}",
            f"- **Impact Radius:** {impact_graph.impact_radius} dependency levels",
            ""
        ]
        
        if impact_graph.affected_files:
            parts.append("**Files Affected by Changes:**")
            for file in impact_graph.affected_files[:5]:  # Show top 5
                parts.append(f"- `{file}`")
            
            if len(impact_graph.affected_files) > 5:
                parts.append(f"- ... and {len(impact_graph.affected_files) - 5} more")
        
        return "\n".join(parts)
    
    def _generate_recommendations(
        self,
        code_analysis: CodeAnalysis,
        impact_graph: ImpactGraph,
        critical_count: int,
        warning_count: int
    ) -> List[str]:
        """
        Generate actionable recommendations
        
        Args:
            code_analysis: Code analysis
            impact_graph: Impact graph
            critical_count: Number of critical issues
            warning_count: Number of warnings
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Critical issues
        if critical_count > 0:
            recommendations.append(
                f"🚨 Address {critical_count} critical issue(s) before merging"
            )
        
        # Test coverage
        if code_analysis.quality_metrics.test_coverage_estimate < 50:
            recommendations.append(
                "🧪 Add unit tests to improve coverage (currently low)"
            )
        
        # Documentation
        if code_analysis.quality_metrics.documentation_score < 50:
            recommendations.append(
                "📝 Add documentation/comments for better maintainability"
            )
        
        # Large impact
        if impact_graph.impact_radius > 3:
            recommendations.append(
                f"⚡ High impact radius ({impact_graph.impact_radius} levels) - consider breaking into smaller PRs"
            )
        
        # Security
        if code_analysis.quality_metrics.security_score < 70:
            recommendations.append(
                "🔒 Review security concerns identified in the analysis"
            )
        
        # Complexity
        if code_analysis.quality_metrics.complexity_score > 70:
            recommendations.append(
                "🔧 Consider refactoring complex code for better maintainability"
            )
        
        # Default positive message
        if not recommendations:
            recommendations.append(
                "✨ Code looks good! Consider adding tests if not already present."
            )
        
        return recommendations
    
    def _format_github_markdown(
        self,
        summary: str,
        comments: List[ReviewComment],
        impact_summary: str,
        recommendations: List[str],
        overall_score: float,
        critical_count: int,
        warning_count: int,
        info_count: int
    ) -> str:
        """
        Format review as GitHub markdown
        
        Args:
            summary: Review summary
            comments: List of comments
            impact_summary: Impact analysis summary
            recommendations: List of recommendations
            overall_score: Overall score
            critical_count: Critical issues count
            warning_count: Warnings count
            info_count: Info count
            
        Returns:
            Formatted markdown string
        """
        lines = [
            "# 🤖 AI Code Review by DevTools AI Suite",
            "",
            summary,
            "",
            "---",
            "",
            impact_summary,
            "",
            "---",
            "",
            "### 🔍 Detailed Findings",
            ""
        ]
        
        # Group comments by severity
        critical_comments = [c for c in comments if c.severity == Severity.CRITICAL]
        warning_comments = [c for c in comments if c.severity == Severity.WARNING]
        info_comments = [c for c in comments if c.severity == Severity.INFO]
        
        # Critical issues
        if critical_comments:
            lines.append("#### 🚨 Critical Issues")
            lines.append("")
            for comment in critical_comments:
                lines.extend(self._format_comment(comment))
            lines.append("")
        
        # Warnings
        if warning_comments:
            lines.append("#### ⚠️ Warnings")
            lines.append("")
            for comment in warning_comments:
                lines.extend(self._format_comment(comment))
            lines.append("")
        
        # Info
        if info_comments:
            lines.append("#### ℹ️ Suggestions")
            lines.append("")
            for comment in info_comments:
                lines.extend(self._format_comment(comment))
            lines.append("")
        
        # Recommendations
        lines.append("---")
        lines.append("")
        lines.append("### 💡 Recommendations")
        lines.append("")
        for rec in recommendations:
            lines.append(f"- {rec}")
        
        # Footer
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append(f"*Generated by DevTools AI Suite powered by IBM Bob* | Score: **{overall_score}/100**")
        lines.append(f"*Issues: {critical_count} critical, {warning_count} warnings, {info_count} info*")
        
        return "\n".join(lines)
    
    def _format_comment(self, comment: ReviewComment) -> List[str]:
        """
        Format a single comment as markdown
        
        Args:
            comment: Review comment
            
        Returns:
            List of markdown lines
        """
        lines = []
        
        # Title with file/line info
        if comment.file_path:
            location = f"`{comment.file_path}`"
            if comment.line_number:
                location += f" (line {comment.line_number})"
            lines.append(f"**{comment.title}** - {location}")
        else:
            lines.append(f"**{comment.title}**")
        
        # Description
        lines.append("")
        lines.append(comment.description)
        
        # Code snippet
        if comment.code_snippet:
            lines.append("")
            lines.append("```")
            lines.append(comment.code_snippet)
            lines.append("```")
        
        # Suggestion
        if comment.suggestion:
            lines.append("")
            lines.append(f"💡 **Suggestion:** {comment.suggestion}")
        
        lines.append("")
        
        return lines
    
    async def generate_inline_comments(
        self,
        code_analysis: CodeAnalysis
    ) -> List[Dict[str, Any]]:
        """
        Generate inline comments for GitHub PR review
        
        Args:
            code_analysis: Code analysis results
            
        Returns:
            List of inline comment objects for GitHub API
        """
        inline_comments = []
        
        for issue in code_analysis.issues:
            if issue.file_path and issue.line_number:
                inline_comments.append({
                    'path': issue.file_path,
                    'line': issue.line_number,
                    'body': f"**{issue.title}**\n\n{issue.description}" + 
                           (f"\n\n💡 {issue.suggestion}" if issue.suggestion else "")
                })
        
        return inline_comments
    
    def categorize_by_severity(
        self,
        comments: List[ReviewComment]
    ) -> Dict[Severity, List[ReviewComment]]:
        """
        Categorize comments by severity
        
        Args:
            comments: List of review comments
            
        Returns:
            Dictionary mapping severity to comments
        """
        categorized = {
            Severity.CRITICAL: [],
            Severity.WARNING: [],
            Severity.INFO: []
        }
        
        for comment in comments:
            categorized[comment.severity].append(comment)
        
        return categorized
    
    def format_for_slack(self, review_report: ReviewReport) -> str:
        """
        Format review for Slack notification
        
        Args:
            review_report: Review report
            
        Returns:
            Slack-formatted message
        """
        emoji = "✅" if review_report.overall_score >= 80 else "⚠️" if review_report.overall_score >= 60 else "🚨"
        
        message = f"{emoji} *Code Review Complete*\n\n"
        message += f"*Score:* {review_report.overall_score}/100\n"
        message += f"*Issues:* {review_report.critical_count} critical, {review_report.warning_count} warnings\n"
        message += f"\n{review_report.summary}"
        
        return message

# Made with Bob
