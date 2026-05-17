"""
PR Fetcher Agent - Fetch and parse GitHub PR data

This agent is responsible for:
1. Authenticating with GitHub API
2. Fetching PR diff, files changed, commit history
3. Cloning repository for full context
4. Extracting metadata (author, reviewers, labels)
"""

import os
import tempfile
import subprocess
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

from backend.services.github_client import GitHubClient


@dataclass
class PRMetadata:
    """PR metadata structure"""
    number: int
    title: str
    description: str
    author: str
    reviewers: List[str]
    labels: List[str]
    state: str
    created_at: datetime
    updated_at: datetime
    base_branch: str
    head_branch: str
    commits_count: int
    changed_files_count: int
    additions: int
    deletions: int


@dataclass
class PRData:
    """Complete PR data structure"""
    metadata: PRMetadata
    diff: str
    files_changed: List[Dict[str, Any]]
    commits: List[Dict[str, Any]]
    repo_path: Optional[str] = None


class PRFetcherAgent:
    """
    Agent for fetching and parsing GitHub Pull Request data
    
    This agent handles all GitHub API interactions and repository cloning
    to provide complete context for code review analysis.
    """
    
    def __init__(self, github_token: Optional[str] = None):
        """
        Initialize PR Fetcher Agent
        
        Args:
            github_token: GitHub personal access token (optional, uses env var if not provided)
        """
        self.agent_id = "pr_fetcher_001"
        self.github_client = GitHubClient(github_token)
        self.temp_dir = tempfile.mkdtemp(prefix="devtools_pr_")
        
    async def fetch_pr(self, pr_url: str) -> PRData:
        """
        Fetch complete PR data from GitHub
        
        Args:
            pr_url: GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
            
        Returns:
            PRData object containing all PR information
            
        Raises:
            ValueError: If PR URL is invalid
            Exception: If GitHub API request fails
        """
        try:
            # Parse PR URL
            owner, repo, pr_number = self._parse_pr_url(pr_url)
            
            # Fetch PR data from GitHub
            pr_info = await self.github_client.fetch_pr(owner, repo, pr_number)
            
            # Fetch diff
            diff = await self.github_client.fetch_pr_diff(owner, repo, pr_number)
            
            # Fetch files changed
            files_changed = await self.github_client.fetch_pr_files(owner, repo, pr_number)
            
            # Fetch commits
            commits = await self.github_client.fetch_pr_commits(owner, repo, pr_number)
            
            # Extract metadata
            metadata = self._extract_metadata(pr_info)
            
            # Clone repository for full context
            repo_path = await self._clone_repository(owner, repo, metadata.base_branch)
            
            return PRData(
                metadata=metadata,
                diff=diff,
                files_changed=files_changed,
                commits=commits,
                repo_path=repo_path
            )
            
        except Exception as e:
            raise Exception(f"Failed to fetch PR data: {str(e)}")
    
    def _parse_pr_url(self, pr_url: str) -> tuple[str, str, int]:
        """
        Parse GitHub PR URL to extract owner, repo, and PR number
        
        Args:
            pr_url: GitHub PR URL
            
        Returns:
            Tuple of (owner, repo, pr_number)
            
        Raises:
            ValueError: If URL format is invalid
        """
        try:
            # Remove trailing slash
            pr_url = pr_url.rstrip('/')
            
            # Expected format: https://github.com/owner/repo/pull/123
            parts = pr_url.split('/')
            
            if len(parts) < 7 or parts[-2] != 'pull':
                raise ValueError("Invalid PR URL format")
            
            owner = parts[-4]
            repo = parts[-3]
            pr_number = int(parts[-1])
            
            return owner, repo, pr_number
            
        except (IndexError, ValueError) as e:
            raise ValueError(f"Invalid PR URL format: {pr_url}. Expected: https://github.com/owner/repo/pull/123")
    
    def _extract_metadata(self, pr_info: Dict[str, Any]) -> PRMetadata:
        """
        Extract metadata from PR info
        
        Args:
            pr_info: Raw PR info from GitHub API
            
        Returns:
            PRMetadata object
        """
        return PRMetadata(
            number=pr_info['number'],
            title=pr_info['title'],
            description=pr_info.get('body', ''),
            author=pr_info['user']['login'],
            reviewers=[r['login'] for r in pr_info.get('requested_reviewers', [])],
            labels=[l['name'] for l in pr_info.get('labels', [])],
            state=pr_info['state'],
            created_at=datetime.fromisoformat(pr_info['created_at'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(pr_info['updated_at'].replace('Z', '+00:00')),
            base_branch=pr_info['base']['ref'],
            head_branch=pr_info['head']['ref'],
            commits_count=pr_info['commits'],
            changed_files_count=pr_info['changed_files'],
            additions=pr_info['additions'],
            deletions=pr_info['deletions']
        )
    
    async def _clone_repository(self, owner: str, repo: str, branch: str) -> str:
        """
        Clone repository for full context analysis
        
        Args:
            owner: Repository owner
            repo: Repository name
            branch: Branch to clone
            
        Returns:
            Path to cloned repository
            
        Raises:
            Exception: If clone fails
        """
        try:
            repo_url = f"https://github.com/{owner}/{repo}.git"
            repo_path = os.path.join(self.temp_dir, repo)
            
            # Clone repository
            subprocess.run(
                ['git', 'clone', '--depth', '1', '--branch', branch, repo_url, repo_path],
                check=True,
                capture_output=True,
                text=True
            )
            
            return repo_path
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to clone repository: {e.stderr}")
    
    def get_diff(self, pr_data: PRData) -> str:
        """
        Get PR diff
        
        Args:
            pr_data: PR data object
            
        Returns:
            Diff string
        """
        return pr_data.diff
    
    def get_files_changed(self, pr_data: PRData) -> List[Dict[str, Any]]:
        """
        Get list of files changed in PR
        
        Args:
            pr_data: PR data object
            
        Returns:
            List of file change objects
        """
        return pr_data.files_changed
    
    def get_file_content(self, pr_data: PRData, file_path: str) -> Optional[str]:
        """
        Get content of a specific file from cloned repository
        
        Args:
            pr_data: PR data object
            file_path: Relative path to file
            
        Returns:
            File content as string, or None if file not found
        """
        if not pr_data.repo_path:
            return None
        
        full_path = os.path.join(pr_data.repo_path, file_path)
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except (FileNotFoundError, UnicodeDecodeError):
            return None
    
    def cleanup(self):
        """Clean up temporary files and cloned repositories"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def __del__(self):
        """Cleanup on deletion"""
        self.cleanup()

# Made with Bob
