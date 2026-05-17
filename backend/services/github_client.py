"""
GitHub API Client Service
Handles all GitHub API interactions
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

class GitHubClient:
    """
    GitHub API Client
    
    Handles fetching PR data, repository files, and other GitHub operations
    """
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevTools-AI-Suite"
        }
    
    def parse_pr_url(self, pr_url: str) -> tuple[str, str, int]:
        """
        Parse GitHub PR URL
        
        Args:
            pr_url: GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
            
        Returns:
            Tuple of (owner, repo, pr_number)
        """
        parts = pr_url.rstrip('/').split('/')
        owner = parts[-4]
        repo = parts[-3]
        pr_number = int(parts[-1])
        return owner, repo, pr_number
    
    async def fetch_pr(
        self,
        owner: str,
        repo: str,
        pr_number: int
    ) -> Dict[str, Any]:
        """
        Fetch Pull Request data
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            
        Returns:
            PR data dictionary
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def fetch_pr_diff(
        self,
        owner: str,
        repo: str,
        pr_number: int
    ) -> str:
        """
        Fetch PR diff
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            
        Returns:
            Diff as string
        """
        headers = {**self.headers, "Accept": "application/vnd.github.v3.diff"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}",
                headers=headers
            )
            response.raise_for_status()
            return response.text
    
    async def fetch_pr_files(
        self,
        owner: str,
        repo: str,
        pr_number: int
    ) -> List[Dict[str, Any]]:
        """
        Fetch files changed in PR
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            
        Returns:
            List of changed files
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/files",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def fetch_pr_commits(
        self,
        owner: str,
        repo: str,
        pr_number: int
    ) -> List[Dict[str, Any]]:
        """
        Fetch commits in PR
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            
        Returns:
            List of commits
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/commits",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def fetch_file_content(
        self,
        owner: str,
        repo: str,
        path: str,
        ref: str = "main"
    ) -> str:
        """
        Fetch file content from repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            path: File path
            ref: Git reference (branch, tag, commit)
            
        Returns:
            File content as string
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers=self.headers,
                params={"ref": ref}
            )
            response.raise_for_status()
            data = response.json()
            
            # Decode base64 content
            import base64
            content = base64.b64decode(data["content"]).decode("utf-8")
            return content
    
    async def fetch_repository_tree(
        self,
        owner: str,
        repo: str,
        ref: str = "main",
        recursive: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Fetch repository file tree
        
        Args:
            owner: Repository owner
            repo: Repository name
            ref: Git reference
            recursive: Fetch recursively
            
        Returns:
            List of files and directories
        """
        # First get the commit SHA
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/git/ref/heads/{ref}",
                headers=self.headers
            )
            response.raise_for_status()
            commit_sha = response.json()["object"]["sha"]
            
            # Get the tree
            params = {"recursive": "1"} if recursive else {}
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/git/trees/{commit_sha}",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            return response.json()["tree"]
    
    async def fetch_repository_info(
        self,
        owner: str,
        repo: str
    ) -> Dict[str, Any]:
        """
        Fetch repository information
        
        Args:
            owner: Repository owner
            repo: Repository name
            
        Returns:
            Repository info dictionary
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def fetch_commits(
        self,
        owner: str,
        repo: str,
        since: Optional[str] = None,
        until: Optional[str] = None,
        per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch repository commits
        
        Args:
            owner: Repository owner
            repo: Repository name
            since: ISO 8601 date string
            until: ISO 8601 date string
            per_page: Results per page
            
        Returns:
            List of commits
        """
        params = {"per_page": per_page}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/commits",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
    
    async def post_pr_comment(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        body: str
    ) -> Dict[str, Any]:
        """
        Post comment on PR
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            body: Comment body (markdown)
            
        Returns:
            Created comment data
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/repos/{owner}/{repo}/issues/{pr_number}/comments",
                headers=self.headers,
                json={"body": body}
            )
            response.raise_for_status()
            return response.json()
    
    async def post_pr_review(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        body: str,
        event: str = "COMMENT",
        comments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Post review on PR
        
        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: PR number
            body: Review body
            event: Review event (APPROVE, REQUEST_CHANGES, COMMENT)
            comments: Line-specific comments
            
        Returns:
            Created review data
        """
        payload = {
            "body": body,
            "event": event
        }
        
        if comments:
            payload["comments"] = comments
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
github_client = GitHubClient()

# Made with Bob
