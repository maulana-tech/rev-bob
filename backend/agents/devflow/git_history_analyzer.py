"""
Git History Analyzer Agent - Analyze git history for pattern detection

This agent is responsible for:
1. Parsing git log & commit history
2. Detecting work patterns & habits
3. Identifying frequently changed files
4. Calculating code churn metrics
5. Tracking developer velocity
"""

import os
import subprocess
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class CommitInfo:
    """Represents a single commit"""
    hash: str
    author: str
    email: str
    date: datetime
    message: str
    files_changed: List[str]
    additions: int
    deletions: int


@dataclass
class FileChurn:
    """Represents churn metrics for a file"""
    path: str
    change_count: int
    total_additions: int
    total_deletions: int
    last_modified: datetime
    authors: List[str]


@dataclass
class DeveloperMetrics:
    """Metrics for a developer"""
    name: str
    email: str
    commit_count: int
    total_additions: int
    total_deletions: int
    files_touched: int
    avg_commit_size: float
    most_active_hours: List[int]
    most_changed_files: List[str]


@dataclass
class WorkPattern:
    """Detected work pattern"""
    pattern_type: str  # 'frequent_changes', 'large_commits', 'late_night', etc.
    description: str
    frequency: int
    examples: List[str]


@dataclass
class GitAnalysis:
    """Complete git history analysis"""
    commits: List[CommitInfo]
    file_churn: List[FileChurn]
    developer_metrics: Dict[str, DeveloperMetrics]
    work_patterns: List[WorkPattern]
    hotspots: List[str]  # Files changed most frequently
    velocity_trend: List[Tuple[str, int]]  # (date, commits_per_day)
    summary: str


class GitHistoryAnalyzerAgent:
    """
    Agent for analyzing git history and detecting patterns
    
    This agent helps understand development patterns, identify hotspots,
    and track team velocity over time.
    """
    
    def __init__(self, repo_path: str):
        """
        Initialize Git History Analyzer Agent
        
        Args:
            repo_path: Path to git repository
        """
        self.agent_id = "git_history_analyzer_001"
        self.repo_path = repo_path
        
        if not os.path.exists(os.path.join(repo_path, '.git')):
            raise ValueError(f"Not a git repository: {repo_path}")
    
    async def analyze(
        self,
        since: Optional[str] = None,
        until: Optional[str] = None,
        max_commits: int = 1000
    ) -> GitAnalysis:
        """
        Analyze git history
        
        Args:
            since: Start date (ISO format or relative like '1 month ago')
            until: End date (ISO format or relative)
            max_commits: Maximum number of commits to analyze
            
        Returns:
            GitAnalysis with all metrics and patterns
        """
        # Parse git log
        commits = self._parse_git_log(since, until, max_commits)
        
        # Calculate file churn
        file_churn = self._calculate_file_churn(commits)
        
        # Calculate developer metrics
        developer_metrics = self._calculate_developer_metrics(commits)
        
        # Detect work patterns
        work_patterns = self._detect_patterns(commits, developer_metrics)
        
        # Identify hotspots
        hotspots = self._identify_hotspots(file_churn)
        
        # Calculate velocity trend
        velocity_trend = self._calculate_velocity_trend(commits)
        
        # Generate summary
        summary = self._generate_summary(
            commits, file_churn, developer_metrics, work_patterns
        )
        
        return GitAnalysis(
            commits=commits,
            file_churn=file_churn,
            developer_metrics=developer_metrics,
            work_patterns=work_patterns,
            hotspots=hotspots,
            velocity_trend=velocity_trend,
            summary=summary
        )
    
    def _parse_git_log(
        self,
        since: Optional[str],
        until: Optional[str],
        max_commits: int
    ) -> List[CommitInfo]:
        """
        Parse git log to extract commit information
        
        Args:
            since: Start date
            until: End date
            max_commits: Maximum commits
            
        Returns:
            List of CommitInfo objects
        """
        # Build git log command
        cmd = ['git', 'log', f'--max-count={max_commits}', '--numstat', '--pretty=format:%H|%an|%ae|%ai|%s']
        
        if since:
            cmd.append(f'--since={since}')
        if until:
            cmd.append(f'--until={until}')
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            
            return self._parse_log_output(result.stdout)
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to parse git log: {e.stderr}")
    
    def _parse_log_output(self, output: str) -> List[CommitInfo]:
        """Parse git log output into CommitInfo objects"""
        commits = []
        lines = output.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Parse commit header
            if '|' in line:
                parts = line.split('|')
                if len(parts) >= 5:
                    commit_hash = parts[0]
                    author = parts[1]
                    email = parts[2]
                    date_str = parts[3]
                    message = parts[4]
                    
                    # Parse date
                    try:
                        date = datetime.fromisoformat(date_str.replace(' ', 'T'))
                    except:
                        date = datetime.now()
                    
                    # Parse file changes (numstat lines)
                    files_changed = []
                    additions = 0
                    deletions = 0
                    
                    i += 1
                    while i < len(lines) and lines[i].strip() and '|' not in lines[i]:
                        stat_line = lines[i].strip()
                        parts = stat_line.split('\t')
                        
                        if len(parts) >= 3:
                            try:
                                add = int(parts[0]) if parts[0] != '-' else 0
                                delete = int(parts[1]) if parts[1] != '-' else 0
                                file_path = parts[2]
                                
                                additions += add
                                deletions += delete
                                files_changed.append(file_path)
                            except ValueError:
                                pass
                        
                        i += 1
                    
                    commits.append(CommitInfo(
                        hash=commit_hash,
                        author=author,
                        email=email,
                        date=date,
                        message=message,
                        files_changed=files_changed,
                        additions=additions,
                        deletions=deletions
                    ))
                    continue
            
            i += 1
        
        return commits
    
    def _calculate_file_churn(self, commits: List[CommitInfo]) -> List[FileChurn]:
        """
        Calculate churn metrics for each file
        
        Args:
            commits: List of commits
            
        Returns:
            List of FileChurn objects
        """
        file_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            'count': 0,
            'additions': 0,
            'deletions': 0,
            'last_modified': None,
            'authors': set()
        })
        
        for commit in commits:
            for file_path in commit.files_changed:
                stats = file_stats[file_path]
                stats['count'] += 1
                stats['additions'] += commit.additions
                stats['deletions'] += commit.deletions
                stats['authors'].add(commit.author)
                
                if stats['last_modified'] is None or commit.date > stats['last_modified']:
                    stats['last_modified'] = commit.date
        
        # Convert to FileChurn objects
        file_churn = []
        for path, stats in file_stats.items():
            file_churn.append(FileChurn(
                path=path,
                change_count=stats['count'],
                total_additions=stats['additions'],
                total_deletions=stats['deletions'],
                last_modified=stats['last_modified'],
                authors=list(stats['authors'])
            ))
        
        # Sort by change count
        file_churn.sort(key=lambda x: x.change_count, reverse=True)
        
        return file_churn
    
    def _calculate_developer_metrics(
        self,
        commits: List[CommitInfo]
    ) -> Dict[str, DeveloperMetrics]:
        """
        Calculate metrics for each developer
        
        Args:
            commits: List of commits
            
        Returns:
            Dictionary mapping developer email to metrics
        """
        dev_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            'name': '',
            'commit_count': 0,
            'additions': 0,
            'deletions': 0,
            'files': set(),
            'hours': defaultdict(int),
            'file_changes': defaultdict(int)
        })
        
        for commit in commits:
            stats = dev_stats[commit.email]
            stats['name'] = commit.author
            stats['commit_count'] += 1
            stats['additions'] += commit.additions
            stats['deletions'] += commit.deletions
            stats['files'].update(commit.files_changed)
            stats['hours'][commit.date.hour] += 1
            
            for file_path in commit.files_changed:
                stats['file_changes'][file_path] += 1
        
        # Convert to DeveloperMetrics objects
        metrics = {}
        for email, stats in dev_stats.items():
            # Find most active hours
            most_active_hours = sorted(
                stats['hours'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            most_active_hours = [hour for hour, _ in most_active_hours]
            
            # Find most changed files
            most_changed_files = sorted(
                stats['file_changes'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            most_changed_files = [file for file, _ in most_changed_files]
            
            # Calculate average commit size
            avg_commit_size = (
                (stats['additions'] + stats['deletions']) / stats['commit_count']
                if stats['commit_count'] > 0 else 0
            )
            
            metrics[email] = DeveloperMetrics(
                name=stats['name'],
                email=email,
                commit_count=stats['commit_count'],
                total_additions=stats['additions'],
                total_deletions=stats['deletions'],
                files_touched=len(stats['files']),
                avg_commit_size=avg_commit_size,
                most_active_hours=most_active_hours,
                most_changed_files=most_changed_files
            )
        
        return metrics
    
    def _detect_patterns(
        self,
        commits: List[CommitInfo],
        developer_metrics: Dict[str, DeveloperMetrics]
    ) -> List[WorkPattern]:
        """
        Detect work patterns from commit history
        
        Args:
            commits: List of commits
            developer_metrics: Developer metrics
            
        Returns:
            List of detected patterns
        """
        patterns = []
        
        # Pattern 1: Frequent small commits
        small_commits = [c for c in commits if (c.additions + c.deletions) < 50]
        if len(small_commits) > len(commits) * 0.5:
            patterns.append(WorkPattern(
                pattern_type='frequent_small_commits',
                description='Team prefers frequent, small commits',
                frequency=len(small_commits),
                examples=[c.message[:50] for c in small_commits[:3]]
            ))
        
        # Pattern 2: Large commits
        large_commits = [c for c in commits if (c.additions + c.deletions) > 500]
        if large_commits:
            patterns.append(WorkPattern(
                pattern_type='large_commits',
                description='Some commits are very large (>500 lines)',
                frequency=len(large_commits),
                examples=[f"{c.message[:50]} ({c.additions + c.deletions} lines)" for c in large_commits[:3]]
            ))
        
        # Pattern 3: Late night commits
        late_night = [c for c in commits if c.date.hour >= 22 or c.date.hour <= 6]
        if len(late_night) > len(commits) * 0.2:
            patterns.append(WorkPattern(
                pattern_type='late_night_work',
                description='Significant late-night/early-morning activity',
                frequency=len(late_night),
                examples=[f"{c.author} at {c.date.strftime('%H:%M')}" for c in late_night[:3]]
            ))
        
        # Pattern 4: Weekend work
        weekend = [c for c in commits if c.date.weekday() >= 5]
        if len(weekend) > len(commits) * 0.15:
            patterns.append(WorkPattern(
                pattern_type='weekend_work',
                description='Regular weekend commits detected',
                frequency=len(weekend),
                examples=[f"{c.author} on {c.date.strftime('%A')}" for c in weekend[:3]]
            ))
        
        return patterns
    
    def _identify_hotspots(self, file_churn: List[FileChurn]) -> List[str]:
        """
        Identify code hotspots (frequently changed files)
        
        Args:
            file_churn: File churn metrics
            
        Returns:
            List of hotspot file paths
        """
        # Files changed more than average
        if not file_churn:
            return []
        
        avg_changes = sum(f.change_count for f in file_churn) / len(file_churn)
        hotspots = [f.path for f in file_churn if f.change_count > avg_changes * 1.5]
        
        return hotspots[:10]  # Top 10 hotspots
    
    def _calculate_velocity_trend(
        self,
        commits: List[CommitInfo]
    ) -> List[Tuple[str, int]]:
        """
        Calculate commit velocity trend over time
        
        Args:
            commits: List of commits
            
        Returns:
            List of (date, commits_per_day) tuples
        """
        if not commits:
            return []
        
        # Group commits by date
        commits_by_date = defaultdict(int)
        for commit in commits:
            date_str = commit.date.strftime('%Y-%m-%d')
            commits_by_date[date_str] += 1
        
        # Sort by date
        velocity = sorted(commits_by_date.items())
        
        return velocity
    
    def _generate_summary(
        self,
        commits: List[CommitInfo],
        file_churn: List[FileChurn],
        developer_metrics: Dict[str, DeveloperMetrics],
        work_patterns: List[WorkPattern]
    ) -> str:
        """Generate human-readable summary"""
        parts = []
        
        parts.append(f"Analyzed {len(commits)} commits")
        parts.append(f"by {len(developer_metrics)} developer(s)")
        parts.append(f"affecting {len(file_churn)} files.")
        
        if work_patterns:
            parts.append(f"\nDetected {len(work_patterns)} work pattern(s):")
            for pattern in work_patterns[:3]:
                parts.append(f"  - {pattern.description}")
        
        if file_churn:
            top_file = file_churn[0]
            parts.append(f"\nMost changed file: {top_file.path} ({top_file.change_count} changes)")
        
        return " ".join(parts)
    
    def get_commit_frequency(self, commits: List[CommitInfo]) -> Dict[str, int]:
        """Get commit frequency by day of week"""
        frequency = defaultdict(int)
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for commit in commits:
            day = days[commit.date.weekday()]
            frequency[day] += 1
        
        return dict(frequency)
    
    def get_hourly_distribution(self, commits: List[CommitInfo]) -> Dict[int, int]:
        """Get commit distribution by hour"""
        distribution = defaultdict(int)
        
        for commit in commits:
            distribution[commit.date.hour] += 1
        
        return dict(distribution)

# Made with Bob
