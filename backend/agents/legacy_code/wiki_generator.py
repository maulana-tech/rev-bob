"""
Wiki Generator Agent - Auto-generate documentation wiki

This agent is responsible for:
1. Generating module documentation
2. Creating cross-references
3. Generating API reference
4. Exporting to Markdown/Notion
"""

from typing import Dict, List, Any
from dataclasses import dataclass

from .repository_indexer import RepositoryIndex, FileStructure
from .knowledge_graph_builder import KnowledgeGraph


@dataclass
class WikiPage:
    """Single wiki page"""
    title: str
    content: str
    category: str
    cross_references: List[str]


class WikiGeneratorAgent:
    """Agent for generating documentation wiki"""
    
    def __init__(self):
        """Initialize Wiki Generator Agent"""
        self.agent_id = "wiki_generator_001"
    
    def generate_wiki(
        self,
        repo_index: RepositoryIndex,
        knowledge_graph: KnowledgeGraph
    ) -> List[WikiPage]:
        """Generate complete wiki"""
        pages = []
        
        # Overview page
        pages.append(self._generate_overview(repo_index))
        
        # Module pages
        for file in repo_index.files[:10]:  # Top 10 files
            pages.append(self._generate_module_page(file))
        
        # API reference
        pages.append(self._generate_api_reference(repo_index))
        
        return pages
    
    def _generate_overview(self, repo_index: RepositoryIndex) -> WikiPage:
        """Generate overview page"""
        content = f"""# Project Overview

## Statistics
- **Total Files**: {repo_index.total_files}
- **Total Lines**: {repo_index.total_lines:,}
- **Languages**: {', '.join(repo_index.languages.keys())}

## Structure
This codebase contains {repo_index.total_files} files across multiple languages.
"""
        
        return WikiPage(
            title="Overview",
            content=content,
            category="General",
            cross_references=[]
        )
    
    def _generate_module_page(self, file: FileStructure) -> WikiPage:
        """Generate page for a module"""
        content = f"""# {file.path}

## Information
- **Language**: {file.language}
- **Lines of Code**: {file.lines_of_code}
- **Complexity**: {file.complexity_score:.1f}

## Symbols
"""
        
        for symbol in file.symbols:
            content += f"\n### {symbol.name} ({symbol.type})\n"
            content += f"Line {symbol.line_number}\n"
        
        return WikiPage(
            title=file.path,
            content=content,
            category="Modules",
            cross_references=file.imports
        )
    
    def _generate_api_reference(self, repo_index: RepositoryIndex) -> WikiPage:
        """Generate API reference"""
        content = "# API Reference\n\n"
        
        for symbol_key, symbol in list(repo_index.symbols.items())[:20]:
            if symbol.type == 'function':
                content += f"## {symbol.name}\n"
                content += f"File: {symbol.file_path}\n"
                content += f"Line: {symbol.line_number}\n\n"
        
        return WikiPage(
            title="API Reference",
            content=content,
            category="Reference",
            cross_references=[]
        )
    
    def export_markdown(self, pages: List[WikiPage]) -> Dict[str, str]:
        """Export pages as markdown files"""
        return {
            page.title.replace('/', '_') + '.md': page.content
            for page in pages
        }

# Made with Bob
