"""
Repository Indexer Agent - Full repository indexing and parsing

This agent is responsible for:
1. Cloning & scanning entire repository
2. Parsing all source files
3. Extracting code structure (classes, functions, imports)
4. Building file dependency tree
5. Indexing code symbols
"""

import os
import re
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class CodeSymbol:
    """Represents a code symbol (function, class, variable)"""
    name: str
    type: str  # 'function', 'class', 'variable', 'import'
    file_path: str
    line_number: int
    signature: Optional[str] = None
    docstring: Optional[str] = None


@dataclass
class FileStructure:
    """Structure of a single file"""
    path: str
    language: str
    symbols: List[CodeSymbol]
    imports: List[str]
    exports: List[str]
    lines_of_code: int
    complexity_score: float


@dataclass
class RepositoryIndex:
    """Complete repository index"""
    repo_path: str
    total_files: int
    total_lines: int
    files: List[FileStructure]
    symbols: Dict[str, CodeSymbol]  # name -> symbol
    dependency_tree: Dict[str, List[str]]  # file -> dependencies
    languages: Dict[str, int]  # language -> file count


class RepositoryIndexerAgent:
    """Agent for indexing entire repository"""
    
    def __init__(self, repo_path: str):
        """Initialize Repository Indexer Agent"""
        self.agent_id = "repository_indexer_001"
        self.repo_path = repo_path
        
        # Supported file extensions
        self.supported_extensions = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.go': 'go',
            '.rs': 'rust',
            '.cpp': 'cpp',
            '.c': 'c',
        }
        
        # Directories to skip
        self.skip_dirs = {
            '.git', 'node_modules', '__pycache__', 'venv', '.venv',
            'dist', 'build', 'target', '.next', 'coverage'
        }
    
    async def index_repository(self) -> RepositoryIndex:
        """
        Index entire repository
        
        Returns:
            RepositoryIndex with all files and symbols
        """
        files = []
        all_symbols: Dict[str, CodeSymbol] = {}
        dependency_tree: Dict[str, List[str]] = {}
        languages: Dict[str, int] = {}
        total_lines = 0
        
        # Scan all files
        for root, dirs, filenames in os.walk(self.repo_path):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in self.skip_dirs]
            
            for filename in filenames:
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, self.repo_path)
                
                # Check if supported
                ext = os.path.splitext(filename)[1]
                if ext not in self.supported_extensions:
                    continue
                
                language = self.supported_extensions[ext]
                languages[language] = languages.get(language, 0) + 1
                
                # Parse file
                try:
                    file_structure = self._parse_file(file_path, rel_path, language)
                    files.append(file_structure)
                    total_lines += file_structure.lines_of_code
                    
                    # Add symbols
                    for symbol in file_structure.symbols:
                        all_symbols[f"{rel_path}:{symbol.name}"] = symbol
                    
                    # Add dependencies
                    if file_structure.imports:
                        dependency_tree[rel_path] = file_structure.imports
                
                except Exception as e:
                    print(f"Error parsing {rel_path}: {e}")
        
        return RepositoryIndex(
            repo_path=self.repo_path,
            total_files=len(files),
            total_lines=total_lines,
            files=files,
            symbols=all_symbols,
            dependency_tree=dependency_tree,
            languages=languages
        )
    
    def _parse_file(
        self,
        file_path: str,
        rel_path: str,
        language: str
    ) -> FileStructure:
        """Parse a single file"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        lines = content.split('\n')
        lines_of_code = len([l for l in lines if l.strip() and not l.strip().startswith('#')])
        
        if language == 'python':
            symbols, imports = self._parse_python(content, rel_path)
        elif language in ['javascript', 'typescript']:
            symbols, imports = self._parse_javascript(content, rel_path)
        else:
            symbols, imports = [], []
        
        # Calculate complexity (simple heuristic)
        complexity = self._calculate_complexity(content)
        
        return FileStructure(
            path=rel_path,
            language=language,
            symbols=symbols,
            imports=imports,
            exports=[],
            lines_of_code=lines_of_code,
            complexity_score=complexity
        )
    
    def _parse_python(
        self,
        content: str,
        file_path: str
    ) -> tuple[List[CodeSymbol], List[str]]:
        """Parse Python file"""
        symbols = []
        imports = []
        lines = content.split('\n')
        
        # Find functions and classes
        for i, line in enumerate(lines):
            # Classes
            if line.strip().startswith('class '):
                match = re.search(r'class\s+(\w+)', line)
                if match:
                    symbols.append(CodeSymbol(
                        name=match.group(1),
                        type='class',
                        file_path=file_path,
                        line_number=i + 1
                    ))
            
            # Functions
            elif 'def ' in line:
                match = re.search(r'def\s+(\w+)\s*\((.*?)\)', line)
                if match:
                    symbols.append(CodeSymbol(
                        name=match.group(1),
                        type='function',
                        file_path=file_path,
                        line_number=i + 1,
                        signature=match.group(2)
                    ))
            
            # Imports
            elif line.strip().startswith(('import ', 'from ')):
                imports.append(line.strip())
        
        return symbols, imports
    
    def _parse_javascript(
        self,
        content: str,
        file_path: str
    ) -> tuple[List[CodeSymbol], List[str]]:
        """Parse JavaScript/TypeScript file"""
        symbols = []
        imports = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            # Functions
            if 'function ' in line:
                match = re.search(r'function\s+(\w+)', line)
                if match:
                    symbols.append(CodeSymbol(
                        name=match.group(1),
                        type='function',
                        file_path=file_path,
                        line_number=i + 1
                    ))
            
            # Classes
            elif line.strip().startswith('class '):
                match = re.search(r'class\s+(\w+)', line)
                if match:
                    symbols.append(CodeSymbol(
                        name=match.group(1),
                        type='class',
                        file_path=file_path,
                        line_number=i + 1
                    ))
            
            # Imports
            elif 'import ' in line or 'require(' in line:
                imports.append(line.strip())
        
        return symbols, imports
    
    def _calculate_complexity(self, content: str) -> float:
        """Calculate code complexity score"""
        # Simple heuristic based on control flow statements
        complexity_keywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch']
        score = 0
        
        for keyword in complexity_keywords:
            score += content.count(keyword)
        
        # Normalize by lines
        lines = len(content.split('\n'))
        return score / max(lines, 1) * 100
    
    def get_file_by_path(
        self,
        index: RepositoryIndex,
        path: str
    ) -> Optional[FileStructure]:
        """Get file structure by path"""
        for file in index.files:
            if file.path == path:
                return file
        return None
    
    def search_symbols(
        self,
        index: RepositoryIndex,
        query: str
    ) -> List[CodeSymbol]:
        """Search for symbols by name"""
        results = []
        query_lower = query.lower()
        
        for symbol in index.symbols.values():
            if query_lower in symbol.name.lower():
                results.append(symbol)
        
        return results

# Made with Bob
