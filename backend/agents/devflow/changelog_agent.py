"""
Changelog Agent - Auto-generate CHANGELOG from commits

This agent is responsible for:
1. Parsing commit messages
2. Categorizing changes (feat/fix/docs/etc)
3. Grouping by version/release
4. Formatting in Markdown
5. Following Keep a Changelog format
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from collections import defaultdict


@dataclass
class ChangelogEntry:
    """Single changelog entry"""
    type: str  # feat, fix, docs, style, refactor, test, chore
    scope: Optional[str]
    description: str
    breaking: bool
    commit_hash: str
    author: str


@dataclass
class ChangelogVersion:
    """Changelog for a version"""
    version: str
    date: datetime
    entries: Dict[str, List[ChangelogEntry]]  # type -> entries
    breaking_changes: List[ChangelogEntry]


class ChangelogAgent:
    """Agent for auto-generating CHANGELOG"""
    
    def __init__(self):
        """Initialize Changelog Agent"""
        self.agent_id = "changelog_agent_001"
        
        # Conventional Commits types
        self.commit_types = {
            'feat': 'Features',
            'fix': 'Bug Fixes',
            'docs': 'Documentation',
            'style': 'Styles',
            'refactor': 'Code Refactoring',
            'perf': 'Performance Improvements',
            'test': 'Tests',
            'build': 'Build System',
            'ci': 'Continuous Integration',
            'chore': 'Chores'
        }
    
    def parse_commits(
        self,
        commits: List[Dict[str, Any]]
    ) -> List[ChangelogEntry]:
        """
        Parse commits into changelog entries
        
        Args:
            commits: List of commit dictionaries
            
        Returns:
            List of ChangelogEntry objects
        """
        entries = []
        
        for commit in commits:
            entry = self._parse_commit_message(
                commit.get('message', ''),
                commit.get('hash', ''),
                commit.get('author', '')
            )
            if entry:
                entries.append(entry)
        
        return entries
    
    def _parse_commit_message(
        self,
        message: str,
        commit_hash: str,
        author: str
    ) -> Optional[ChangelogEntry]:
        """Parse conventional commit message"""
        # Pattern: type(scope): description
        pattern = r'^(\w+)(?:\(([^\)]+)\))?(!)?:\s*(.+)$'
        
        first_line = message.split('\n')[0]
        match = re.match(pattern, first_line)
        
        if match:
            commit_type = match.group(1)
            scope = match.group(2)
            breaking = match.group(3) == '!'
            description = match.group(4)
            
            return ChangelogEntry(
                type=commit_type,
                scope=scope,
                description=description,
                breaking=breaking,
                commit_hash=commit_hash[:7],
                author=author
            )
        
        # Fallback: treat as chore
        return ChangelogEntry(
            type='chore',
            scope=None,
            description=first_line,
            breaking=False,
            commit_hash=commit_hash[:7] if commit_hash else '',
            author=author
        )
    
    def categorize_changes(
        self,
        entries: List[ChangelogEntry]
    ) -> Dict[str, List[ChangelogEntry]]:
        """Categorize entries by type"""
        categorized: Dict[str, List[ChangelogEntry]] = defaultdict(list)
        
        for entry in entries:
            categorized[entry.type].append(entry)
        
        return dict(categorized)
    
    def generate_changelog(
        self,
        entries: List[ChangelogEntry],
        version: str = "Unreleased",
        date: Optional[datetime] = None
    ) -> str:
        """
        Generate changelog markdown
        
        Args:
            entries: List of changelog entries
            version: Version number
            date: Release date
            
        Returns:
            Markdown formatted changelog
        """
        lines = []
        
        # Header
        lines.append("# Changelog")
        lines.append("")
        lines.append("All notable changes to this project will be documented in this file.")
        lines.append("")
        lines.append("The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),")
        lines.append("and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).")
        lines.append("")
        
        # Version section
        date_str = date.strftime('%Y-%m-%d') if date else datetime.now().strftime('%Y-%m-%d')
        lines.append(f"## [{version}] - {date_str}")
        lines.append("")
        
        # Categorize entries
        categorized = self.categorize_changes(entries)
        
        # Breaking changes first
        breaking = [e for e in entries if e.breaking]
        if breaking:
            lines.append("### ⚠ BREAKING CHANGES")
            lines.append("")
            for entry in breaking:
                lines.append(f"- **{entry.scope or 'core'}**: {entry.description} ({entry.commit_hash})")
            lines.append("")
        
        # Other categories
        for commit_type, type_name in self.commit_types.items():
            if commit_type in categorized:
                type_entries = categorized[commit_type]
                lines.append(f"### {type_name}")
                lines.append("")
                
                for entry in type_entries:
                    if not entry.breaking:  # Skip breaking changes (already shown)
                        scope_str = f"**{entry.scope}**: " if entry.scope else ""
                        lines.append(f"- {scope_str}{entry.description} ({entry.commit_hash})")
                
                lines.append("")
        
        return '\n'.join(lines)
    
    def generate_version_changelog(
        self,
        version_data: ChangelogVersion
    ) -> str:
        """Generate changelog for specific version"""
        return self.generate_changelog(
            list(sum(version_data.entries.values(), [])),
            version_data.version,
            version_data.date
        )
    
    def update_changelog_file(
        self,
        file_path: str,
        new_entries: List[ChangelogEntry],
        version: str
    ) -> str:
        """
        Update existing CHANGELOG.md file
        
        Args:
            file_path: Path to CHANGELOG.md
            new_entries: New changelog entries
            version: Version number
            
        Returns:
            Updated changelog content
        """
        # Read existing changelog
        try:
            with open(file_path, 'r') as f:
                existing = f.read()
        except FileNotFoundError:
            existing = ""
        
        # Generate new version section
        new_section = self.generate_changelog(new_entries, version)
        
        # Find where to insert (after header, before first version)
        if "## [" in existing:
            # Insert before first version
            parts = existing.split("## [", 1)
            updated = parts[0] + new_section.split("## [")[1] + "\n\n## [" + parts[1]
        else:
            # Append to end
            updated = existing + "\n\n" + new_section
        
        return updated

# Made with Bob
