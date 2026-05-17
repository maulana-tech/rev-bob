"""
Code Comprehension Agent - Deep understanding using IBM Bob

This agent is responsible for:
1. Analyzing code purpose & functionality
2. Identifying design patterns
3. Detecting architectural decisions
4. Finding undocumented behaviors
5. Generating code explanations
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from backend.services.bob_client import IBMBobClient
from .repository_indexer import RepositoryIndex, FileStructure


@dataclass
class CodeExplanation:
    """Explanation of code"""
    component: str
    purpose: str
    functionality: str
    design_patterns: List[str]
    dependencies: List[str]
    risks: List[str]


class CodeComprehensionAgent:
    """Agent for deep code understanding"""
    
    def __init__(self):
        """Initialize Code Comprehension Agent"""
        self.agent_id = "code_comprehension_001"
        self.bob_client = IBMBobClient()
    
    async def analyze_architecture(
        self,
        repo_index: RepositoryIndex
    ) -> Dict[str, Any]:
        """Analyze overall architecture"""
        # Build context
        context = f"""
        Repository Analysis:
        - Total Files: {repo_index.total_files}
        - Total Lines: {repo_index.total_lines}
        - Languages: {', '.join(repo_index.languages.keys())}
        
        File Structure:
        {self._build_file_tree(repo_index)}
        """
        
        # Ask IBM Bob
        explanation = await self.bob_client.explain_code(
            code=context,
            language='text',
            question="Explain the overall architecture and design of this codebase"
        )
        
        return {
            'architecture': explanation,
            'languages': repo_index.languages,
            'total_files': repo_index.total_files
        }
    
    def _build_file_tree(self, repo_index: RepositoryIndex) -> str:
        """Build file tree string"""
        lines = []
        for file in repo_index.files[:20]:  # First 20 files
            lines.append(f"  - {file.path} ({file.language}, {file.lines_of_code} lines)")
        return '\n'.join(lines)
    
    async def explain_component(
        self,
        file: FileStructure,
        full_code: str
    ) -> CodeExplanation:
        """Explain a specific component"""
        explanation_text = await self.bob_client.explain_code(
            code=full_code,
            language=file.language,
            question=f"Explain the purpose and functionality of {file.path}"
        )
        
        return CodeExplanation(
            component=file.path,
            purpose=explanation_text[:200],
            functionality=explanation_text,
            design_patterns=[],
            dependencies=file.imports,
            risks=[]
        )
    
    async def identify_patterns(
        self,
        code: str,
        language: str
    ) -> List[str]:
        """Identify design patterns"""
        response = await self.bob_client.analyze(
            prompt=f"Identify design patterns in this {language} code",
            context={'code': code}
        )
        
        # Parse patterns from response
        patterns = []
        if 'singleton' in response.lower():
            patterns.append('Singleton')
        if 'factory' in response.lower():
            patterns.append('Factory')
        if 'observer' in response.lower():
            patterns.append('Observer')
        
        return patterns

# Made with Bob
