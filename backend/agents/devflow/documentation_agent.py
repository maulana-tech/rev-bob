"""
Documentation Agent - Auto-generate and update documentation

This agent is responsible for:
1. Generating docstrings for functions/classes
2. Updating JSDoc/TSDoc comments
3. Generating API documentation
4. Creating inline code comments
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from backend.services.bob_client import IBMBobClient


@dataclass
class Documentation:
    """Generated documentation"""
    original_code: str
    documented_code: str
    doc_type: str
    language: str
    improvements: List[str]


class DocumentationAgent:
    """Agent for auto-generating documentation"""
    
    def __init__(self):
        """Initialize Documentation Agent"""
        self.agent_id = "documentation_agent_001"
        self.bob_client = IBMBobClient()
    
    async def generate_docstring(
        self,
        code: str,
        language: str
    ) -> Documentation:
        """
        Generate docstring for code
        
        Args:
            code: Source code
            language: Programming language
            
        Returns:
            Documentation object with generated docstring
        """
        doc_type = self._get_doc_type(language)
        
        # Generate documentation using IBM Bob
        documented = await self.bob_client.generate_documentation(
            code=code,
            language=language,
            doc_type=doc_type
        )
        
        # Merge documentation with code
        documented_code = self._merge_documentation(code, documented, language)
        
        improvements = [
            "Added comprehensive docstring",
            "Documented parameters and return values",
            "Included usage examples"
        ]
        
        return Documentation(
            original_code=code,
            documented_code=documented_code,
            doc_type=doc_type,
            language=language,
            improvements=improvements
        )
    
    def _get_doc_type(self, language: str) -> str:
        """Get documentation type for language"""
        doc_types = {
            'python': 'docstring',
            'javascript': 'jsdoc',
            'typescript': 'tsdoc',
            'java': 'javadoc',
            'go': 'godoc'
        }
        return doc_types.get(language, 'docstring')
    
    def _merge_documentation(
        self,
        code: str,
        documentation: str,
        language: str
    ) -> str:
        """Merge generated documentation with original code"""
        lines = code.split('\n')
        doc_lines = documentation.split('\n')
        
        # Find function/class definition
        for i, line in enumerate(lines):
            if 'def ' in line or 'function ' in line or 'class ' in line:
                # Insert documentation before definition
                return '\n'.join(lines[:i] + doc_lines + lines[i:])
        
        # If no definition found, prepend documentation
        return documentation + '\n\n' + code
    
    async def update_file_documentation(
        self,
        file_path: str,
        language: str
    ) -> str:
        """Update documentation for entire file"""
        with open(file_path, 'r') as f:
            code = f.read()
        
        doc = await self.generate_docstring(code, language)
        return doc.documented_code

# Made with Bob
