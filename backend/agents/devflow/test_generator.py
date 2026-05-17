"""
Test Generator Agent - Auto-generate unit tests for code changes

This agent is responsible for:
1. Identifying functions that need tests
2. Generating test cases based on function signature
3. Creating mock data & fixtures
4. Generating assertions & edge cases
5. Supporting multiple test frameworks (Jest, Pytest, etc)
"""

import os
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from backend.services.bob_client import IBMBobClient


class TestFramework(str, Enum):
    """Supported test frameworks"""
    PYTEST = "pytest"
    UNITTEST = "unittest"
    JEST = "jest"
    MOCHA = "mocha"
    VITEST = "vitest"


@dataclass
class FunctionSignature:
    """Represents a function signature"""
    name: str
    parameters: List[Tuple[str, str]]  # (name, type)
    return_type: str
    docstring: Optional[str]
    file_path: str
    line_number: int
    is_async: bool = False


@dataclass
class TestCase:
    """Represents a single test case"""
    name: str
    description: str
    test_code: str
    test_type: str  # 'happy_path', 'edge_case', 'error_handling'
    mocks_needed: List[str]


@dataclass
class GeneratedTests:
    """Complete generated test suite"""
    function_name: str
    framework: TestFramework
    test_file_path: str
    imports: List[str]
    fixtures: List[str]
    test_cases: List[TestCase]
    full_test_code: str
    coverage_estimate: float


class TestGeneratorAgent:
    """
    Agent for auto-generating unit tests
    
    This agent uses IBM Bob to generate comprehensive test suites
    for functions, including happy paths, edge cases, and error handling.
    """
    
    def __init__(self):
        """Initialize Test Generator Agent"""
        self.agent_id = "test_generator_001"
        self.bob_client = IBMBobClient()
        
    async def generate_tests(
        self,
        code: str,
        language: str,
        framework: Optional[TestFramework] = None
    ) -> GeneratedTests:
        """
        Generate tests for given code
        
        Args:
            code: Source code to generate tests for
            language: Programming language
            framework: Test framework to use (auto-detected if None)
            
        Returns:
            GeneratedTests with complete test suite
        """
        # Auto-detect framework if not specified
        if framework is None:
            framework = self._detect_framework(language)
        
        # Extract function signatures
        functions = self._extract_functions(code, language)
        
        if not functions:
            raise ValueError("No testable functions found in code")
        
        # Generate tests for the first function (can be extended to all)
        function = functions[0]
        
        # Use IBM Bob to generate test cases
        test_cases = await self._generate_test_cases_with_bob(
            function, language, framework
        )
        
        # Generate imports and fixtures
        imports = self._generate_imports(framework, language)
        fixtures = self._generate_fixtures(function, test_cases)
        
        # Assemble full test code
        full_test_code = self._assemble_test_code(
            function, test_cases, imports, fixtures, framework
        )
        
        # Estimate coverage
        coverage_estimate = self._estimate_coverage(test_cases)
        
        # Determine test file path
        test_file_path = self._get_test_file_path(function.file_path, framework)
        
        return GeneratedTests(
            function_name=function.name,
            framework=framework,
            test_file_path=test_file_path,
            imports=imports,
            fixtures=fixtures,
            test_cases=test_cases,
            full_test_code=full_test_code,
            coverage_estimate=coverage_estimate
        )
    
    def _detect_framework(self, language: str) -> TestFramework:
        """Detect appropriate test framework for language"""
        framework_map = {
            'python': TestFramework.PYTEST,
            'javascript': TestFramework.JEST,
            'typescript': TestFramework.JEST,
        }
        return framework_map.get(language, TestFramework.PYTEST)
    
    def _extract_functions(
        self,
        code: str,
        language: str
    ) -> List[FunctionSignature]:
        """
        Extract function signatures from code
        
        Args:
            code: Source code
            language: Programming language
            
        Returns:
            List of FunctionSignature objects
        """
        if language == 'python':
            return self._extract_python_functions(code)
        elif language in ['javascript', 'typescript']:
            return self._extract_javascript_functions(code)
        else:
            return []
    
    def _extract_python_functions(self, code: str) -> List[FunctionSignature]:
        """Extract Python function signatures"""
        functions = []
        lines = code.split('\n')
        
        # Simple regex-based extraction (can be improved with AST)
        func_pattern = r'(async\s+)?def\s+(\w+)\s*\((.*?)\)\s*(?:->\s*(.+?))?:'
        
        for i, line in enumerate(lines):
            match = re.search(func_pattern, line)
            if match:
                is_async = match.group(1) is not None
                func_name = match.group(2)
                params_str = match.group(3)
                return_type = match.group(4) or 'Any'
                
                # Parse parameters
                parameters = []
                if params_str.strip():
                    for param in params_str.split(','):
                        param = param.strip()
                        if ':' in param:
                            name, type_hint = param.split(':', 1)
                            parameters.append((name.strip(), type_hint.strip()))
                        else:
                            parameters.append((param, 'Any'))
                
                # Extract docstring (next non-empty line if it starts with """)
                docstring = None
                for j in range(i + 1, min(i + 5, len(lines))):
                    if '"""' in lines[j] or "'''" in lines[j]:
                        docstring = lines[j].strip()
                        break
                
                functions.append(FunctionSignature(
                    name=func_name,
                    parameters=parameters,
                    return_type=return_type.strip(),
                    docstring=docstring,
                    file_path='',
                    line_number=i + 1,
                    is_async=is_async
                ))
        
        return functions
    
    def _extract_javascript_functions(self, code: str) -> List[FunctionSignature]:
        """Extract JavaScript/TypeScript function signatures"""
        functions = []
        lines = code.split('\n')
        
        # Match function declarations and arrow functions
        patterns = [
            r'(async\s+)?function\s+(\w+)\s*\((.*?)\)\s*(?::\s*(.+?))?{',
            r'(async\s+)?(\w+)\s*=\s*\((.*?)\)\s*(?::\s*(.+?))?\s*=>',
            r'(async\s+)?(\w+)\s*\((.*?)\)\s*(?::\s*(.+?))?{',
        ]
        
        for i, line in enumerate(lines):
            for pattern in patterns:
                match = re.search(pattern, line)
                if match:
                    is_async = match.group(1) is not None
                    func_name = match.group(2)
                    params_str = match.group(3)
                    return_type = match.group(4) or 'any'
                    
                    # Parse parameters
                    parameters = []
                    if params_str.strip():
                        for param in params_str.split(','):
                            param = param.strip()
                            if ':' in param:
                                name, type_hint = param.split(':', 1)
                                parameters.append((name.strip(), type_hint.strip()))
                            else:
                                parameters.append((param, 'any'))
                    
                    functions.append(FunctionSignature(
                        name=func_name,
                        parameters=parameters,
                        return_type=return_type.strip(),
                        docstring=None,
                        file_path='',
                        line_number=i + 1,
                        is_async=is_async
                    ))
                    break
        
        return functions
    
    async def _generate_test_cases_with_bob(
        self,
        function: FunctionSignature,
        language: str,
        framework: TestFramework
    ) -> List[TestCase]:
        """
        Use IBM Bob to generate test cases
        
        Args:
            function: Function signature
            language: Programming language
            framework: Test framework
            
        Returns:
            List of TestCase objects
        """
        # Get response from IBM Bob
        test_code_response = await self.bob_client.generate_tests(
            function_code=self._function_to_code(function),
            language=language,
            framework=framework.value
        )
        
        # Parse response into test cases
        test_cases = self._parse_bob_test_response(
            {'test_code': test_code_response},
            framework
        )
        
        return test_cases
    
    def _build_test_generation_prompt(
        self,
        function: FunctionSignature,
        language: str,
        framework: TestFramework
    ) -> str:
        """Build prompt for IBM Bob"""
        params_str = ', '.join([f"{name}: {type_}" for name, type_ in function.parameters])
        
        prompt = f"""Generate comprehensive unit tests for this {language} function using {framework.value}:

Function: {function.name}({params_str}) -> {function.return_type}
{f'Docstring: {function.docstring}' if function.docstring else ''}

Please generate tests for:
1. Happy path (normal execution)
2. Edge cases (boundary conditions, empty inputs, etc.)
3. Error handling (invalid inputs, exceptions)
4. Mock any external dependencies

Format: Provide test code with clear test names and assertions."""
        
        return prompt
    
    def _function_to_code(self, function: FunctionSignature) -> str:
        """Convert function signature to code string"""
        params = ', '.join([f"{name}: {type_}" for name, type_ in function.parameters])
        async_keyword = 'async ' if function.is_async else ''
        return f"{async_keyword}def {function.name}({params}) -> {function.return_type}:\n    pass"
    
    def _parse_bob_test_response(
        self,
        response: Dict[str, Any],
        framework: TestFramework
    ) -> List[TestCase]:
        """Parse IBM Bob response into test cases"""
        test_cases = []
        
        # Extract test code from response
        test_code = response.get('test_code', '')
        
        if not test_code:
            # Generate default test cases if Bob response is empty
            test_cases.append(TestCase(
                name='test_happy_path',
                description='Test normal execution',
                test_code='# TODO: Implement test',
                test_type='happy_path',
                mocks_needed=[]
            ))
        else:
            # Parse test functions from generated code
            if framework in [TestFramework.PYTEST, TestFramework.UNITTEST]:
                test_cases = self._parse_python_tests(test_code)
            else:
                test_cases = self._parse_javascript_tests(test_code)
        
        return test_cases
    
    def _parse_python_tests(self, test_code: str) -> List[TestCase]:
        """Parse Python test code into TestCase objects"""
        test_cases = []
        lines = test_code.split('\n')
        
        current_test = None
        current_code = []
        
        for line in lines:
            if line.strip().startswith('def test_'):
                # Save previous test
                if current_test:
                    test_cases.append(TestCase(
                        name=current_test,
                        description=f'Test case for {current_test}',
                        test_code='\n'.join(current_code),
                        test_type='happy_path',
                        mocks_needed=[]
                    ))
                
                # Start new test
                match = re.search(r'def (test_\w+)', line)
                if match:
                    current_test = match.group(1)
                    current_code = [line]
            elif current_test:
                current_code.append(line)
        
        # Save last test
        if current_test:
            test_cases.append(TestCase(
                name=current_test,
                description=f'Test case for {current_test}',
                test_code='\n'.join(current_code),
                test_type='happy_path',
                mocks_needed=[]
            ))
        
        return test_cases
    
    def _parse_javascript_tests(self, test_code: str) -> List[TestCase]:
        """Parse JavaScript test code into TestCase objects"""
        test_cases = []
        
        # Match test/it blocks
        pattern = r"(?:test|it)\(['\"](.+?)['\"]\s*,\s*(?:async\s+)?\(\)\s*=>\s*{([\s\S]*?)}\)"
        matches = re.finditer(pattern, test_code)
        
        for match in matches:
            test_name = match.group(1)
            test_body = match.group(2)
            
            test_cases.append(TestCase(
                name=test_name.replace(' ', '_'),
                description=test_name,
                test_code=f"test('{test_name}', () => {{{test_body}}})",
                test_type='happy_path',
                mocks_needed=[]
            ))
        
        return test_cases
    
    def _generate_imports(
        self,
        framework: TestFramework,
        language: str
    ) -> List[str]:
        """Generate necessary imports for test file"""
        imports = []
        
        if framework == TestFramework.PYTEST:
            imports = [
                'import pytest',
                'from unittest.mock import Mock, patch'
            ]
        elif framework == TestFramework.UNITTEST:
            imports = [
                'import unittest',
                'from unittest.mock import Mock, patch'
            ]
        elif framework == TestFramework.JEST:
            imports = [
                "import { describe, it, expect, jest } from '@jest/globals';"
            ]
        elif framework == TestFramework.VITEST:
            imports = [
                "import { describe, it, expect, vi } from 'vitest';"
            ]
        
        return imports
    
    def _generate_fixtures(
        self,
        function: FunctionSignature,
        test_cases: List[TestCase]
    ) -> List[str]:
        """Generate test fixtures"""
        fixtures = []
        
        # Generate sample data based on parameter types
        for param_name, param_type in function.parameters:
            if 'str' in param_type.lower():
                fixtures.append(f"{param_name}_sample = 'test_value'")
            elif 'int' in param_type.lower():
                fixtures.append(f"{param_name}_sample = 42")
            elif 'list' in param_type.lower():
                fixtures.append(f"{param_name}_sample = [1, 2, 3]")
            elif 'dict' in param_type.lower():
                fixtures.append(f"{param_name}_sample = {{'key': 'value'}}")
        
        return fixtures
    
    def _assemble_test_code(
        self,
        function: FunctionSignature,
        test_cases: List[TestCase],
        imports: List[str],
        fixtures: List[str],
        framework: TestFramework
    ) -> str:
        """Assemble complete test file code"""
        lines = []
        
        # Add header comment
        lines.append(f"# Auto-generated tests for {function.name}")
        lines.append(f"# Generated by DevTools AI Suite")
        lines.append("")
        
        # Add imports
        lines.extend(imports)
        lines.append("")
        
        # Add fixtures
        if fixtures:
            lines.extend(fixtures)
            lines.append("")
        
        # Add test cases
        for test_case in test_cases:
            lines.append(test_case.test_code)
            lines.append("")
        
        return '\n'.join(lines)
    
    def _estimate_coverage(self, test_cases: List[TestCase]) -> float:
        """Estimate test coverage percentage"""
        # Simple heuristic: more test cases = better coverage
        base_coverage = min(30 + (len(test_cases) * 15), 90)
        
        # Bonus for different test types
        test_types = set(tc.test_type for tc in test_cases)
        type_bonus = len(test_types) * 5
        
        return min(base_coverage + type_bonus, 95)
    
    def _get_test_file_path(
        self,
        source_file: str,
        framework: TestFramework
    ) -> str:
        """Determine test file path based on source file"""
        if not source_file:
            return 'test_generated.py'
        
        base_name = os.path.basename(source_file)
        name_without_ext = os.path.splitext(base_name)[0]
        
        if framework in [TestFramework.PYTEST, TestFramework.UNITTEST]:
            return f"test_{name_without_ext}.py"
        else:
            return f"{name_without_ext}.test.ts"
    
    async def generate_tests_for_file(
        self,
        file_path: str,
        language: str
    ) -> List[GeneratedTests]:
        """
        Generate tests for all functions in a file
        
        Args:
            file_path: Path to source file
            language: Programming language
            
        Returns:
            List of GeneratedTests for each function
        """
        with open(file_path, 'r') as f:
            code = f.read()
        
        functions = self._extract_functions(code, language)
        all_tests = []
        
        for function in functions:
            try:
                tests = await self.generate_tests(code, language)
                all_tests.append(tests)
            except Exception as e:
                print(f"Failed to generate tests for {function.name}: {e}")
        
        return all_tests

# Made with Bob
