"""
IBM Bob Client Service
Wrapper for IBM Bob API integration
"""

import os
import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

class IBMBobClient:
    """
    IBM Bob API Client
    
    Handles all interactions with IBM Bob AI engine
    """
    
    def __init__(self):
        self.api_key = os.getenv("IBM_BOB_API_KEY")
        self.base_url = os.getenv("IBM_BOB_BASE_URL", "https://api.ibm.com/bob/v1")
        self.session_id = None
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    async def initialize_session(self) -> str:
        """Initialize a new IBM Bob session"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sessions",
                headers=self.headers,
                json={"metadata": {"source": "devtools-ai-suite"}}
            )
            response.raise_for_status()
            data = response.json()
            self.session_id = data.get("session_id")
            return self.session_id
    
    async def analyze(
        self, 
        prompt: str, 
        context: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Send analysis request to IBM Bob
        
        Args:
            prompt: The prompt/question for IBM Bob
            context: Additional context (code, files, etc.)
            options: Analysis options (temperature, max_tokens, etc.)
            
        Returns:
            IBM Bob's response as string
        """
        if not self.session_id:
            await self.initialize_session()
        
        payload = {
            "session_id": self.session_id,
            "prompt": prompt,
            "context": context or {},
            "options": options or {
                "temperature": 0.7,
                "max_tokens": 2000,
                "model": "ibm-bob-v1"
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/analyze",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
    
    async def analyze_code(
        self,
        code: str,
        language: str,
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Analyze code with IBM Bob
        
        Args:
            code: Source code to analyze
            language: Programming language
            analysis_type: Type of analysis (bugs, security, quality, etc.)
            
        Returns:
            Structured analysis results
        """
        prompt = self._build_code_analysis_prompt(code, language, analysis_type)
        response = await self.analyze(prompt, {"code": code, "language": language})
        return self._parse_code_analysis(response)
    
    async def generate_tests(
        self,
        function_code: str,
        language: str,
        framework: str = "pytest"
    ) -> str:
        """
        Generate unit tests for a function
        
        Args:
            function_code: Function source code
            language: Programming language
            framework: Test framework to use
            
        Returns:
            Generated test code
        """
        prompt = f"""
        Generate comprehensive unit tests for this {language} function.
        
        Function:
        ```{language}
        {function_code}
        ```
        
        Requirements:
        - Use {framework} framework
        - Include happy path tests
        - Include edge cases
        - Include error handling tests
        - Mock external dependencies
        - Add descriptive test names
        
        Return only the test code, no explanations.
        """
        
        return await self.analyze(prompt, {
            "function": function_code,
            "language": language,
            "framework": framework
        })
    
    async def generate_documentation(
        self,
        code: str,
        language: str,
        doc_type: str = "docstring"
    ) -> str:
        """
        Generate documentation for code
        
        Args:
            code: Source code
            language: Programming language
            doc_type: Type of documentation (docstring, jsdoc, etc.)
            
        Returns:
            Generated documentation
        """
        prompt = f"""
        Generate comprehensive {doc_type} documentation for this {language} code.
        
        Code:
        ```{language}
        {code}
        ```
        
        Include:
        - Description
        - Parameters with types
        - Return value with type
        - Examples
        - Exceptions/Errors
        
        Return only the documentation, no explanations.
        """
        
        return await self.analyze(prompt, {
            "code": code,
            "language": language,
            "doc_type": doc_type
        })
    
    async def explain_code(
        self,
        code: str,
        language: str,
        question: Optional[str] = None
    ) -> str:
        """
        Explain code functionality
        
        Args:
            code: Source code to explain
            language: Programming language
            question: Specific question about the code
            
        Returns:
            Explanation text
        """
        if question:
            prompt = f"""
            Question: {question}
            
            Code:
            ```{language}
            {code}
            ```
            
            Provide a detailed answer based on the code above.
            """
        else:
            prompt = f"""
            Explain what this {language} code does:
            
            ```{language}
            {code}
            ```
            
            Include:
            - Overall purpose
            - Key components
            - Data flow
            - Important details
            """
        
        return await self.analyze(prompt, {
            "code": code,
            "language": language
        })
    
    async def close_session(self):
        """Close IBM Bob session"""
        if self.session_id:
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{self.base_url}/sessions/{self.session_id}",
                    headers=self.headers
                )
            self.session_id = None
    
    def _build_code_analysis_prompt(
        self,
        code: str,
        language: str,
        analysis_type: str
    ) -> str:
        """Build prompt for code analysis"""
        prompts = {
            "bugs": f"""
            Analyze this {language} code for potential bugs:
            
            ```{language}
            {code}
            ```
            
            Identify:
            1. Logic errors
            2. Null pointer issues
            3. Off-by-one errors
            4. Resource leaks
            5. Race conditions
            
            For each issue, provide:
            - Line number
            - Severity (Critical/Warning/Info)
            - Description
            - Suggested fix
            """,
            
            "security": f"""
            Analyze this {language} code for security vulnerabilities:
            
            ```{language}
            {code}
            ```
            
            Check for:
            1. SQL injection
            2. XSS vulnerabilities
            3. Authentication issues
            4. Authorization flaws
            5. Data exposure
            6. Insecure dependencies
            
            For each issue, provide:
            - Line number
            - Severity (Critical/Warning/Info)
            - Description
            - Remediation steps
            """,
            
            "quality": f"""
            Analyze this {language} code for quality issues:
            
            ```{language}
            {code}
            ```
            
            Check for:
            1. Code smells
            2. Naming conventions
            3. Code complexity
            4. Duplication
            5. Best practices
            
            For each issue, provide:
            - Line number
            - Severity (Warning/Info)
            - Description
            - Improvement suggestion
            """
        }
        
        return prompts.get(analysis_type, prompts["bugs"])
    
    def _parse_code_analysis(self, response: str) -> Dict[str, Any]:
        """Parse IBM Bob code analysis response"""
        # TODO: Implement proper parsing logic
        # For now, return structured format
        return {
            "raw_response": response,
            "issues": [],
            "summary": {
                "critical": 0,
                "warning": 0,
                "info": 0
            }
        }
    
    async def export_session_log(self) -> Dict[str, Any]:
        """
        Export IBM Bob session log for hackathon submission
        
        Returns:
            Session log with all interactions
        """
        if not self.session_id:
            return {"error": "No active session"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/sessions/{self.session_id}/log",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
bob_client = IBMBobClient()

# Made with Bob
