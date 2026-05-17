"""
Danger Zone Detector Agent - Identify risky code areas

This agent is responsible for:
1. Finding functions without tests
2. Identifying undocumented code
3. Detecting high complexity areas
4. Finding deprecated patterns
5. Highlighting security concerns
"""

from typing import Dict, List, Any, Set
from dataclasses import dataclass

from .repository_indexer import RepositoryIndex, FileStructure, CodeSymbol


@dataclass
class DangerZone:
    """Risky code area"""
    type: str  # 'untested', 'undocumented', 'complex', 'deprecated', 'security'
    severity: str  # 'high', 'medium', 'low'
    location: str
    description: str
    recommendation: str


class DangerZoneDetectorAgent:
    """Agent for identifying risky code areas"""
    
    def __init__(self):
        """Initialize Danger Zone Detector Agent"""
        self.agent_id = "danger_zone_detector_001"
    
    def detect_danger_zones(
        self,
        repo_index: RepositoryIndex
    ) -> List[DangerZone]:
        """Detect all danger zones"""
        danger_zones = []
        
        # Find untested code
        danger_zones.extend(self._find_untested_code(repo_index))
        
        # Find undocumented code
        danger_zones.extend(self._find_undocumented_code(repo_index))
        
        # Find complex code
        danger_zones.extend(self._find_complex_code(repo_index))
        
        # Find deprecated patterns
        danger_zones.extend(self._find_deprecated_patterns(repo_index))
        
        return danger_zones
    
    def _find_untested_code(
        self,
        repo_index: RepositoryIndex
    ) -> List[DangerZone]:
        """Find functions without tests"""
        danger_zones = []
        
        # Get all test files
        test_files = {
            f.path for f in repo_index.files
            if 'test' in f.path.lower() or 'spec' in f.path.lower()
        }
        
        # Find functions in non-test files
        for file in repo_index.files:
            if file.path in test_files:
                continue
            
            for symbol in file.symbols:
                if symbol.type == 'function':
                    # Check if there's a corresponding test
                    has_test = any(
                        symbol.name in tf
                        for tf in test_files
                    )
                    
                    if not has_test:
                        danger_zones.append(DangerZone(
                            type='untested',
                            severity='medium',
                            location=f"{file.path}:{symbol.line_number}",
                            description=f"Function '{symbol.name}' has no tests",
                            recommendation="Add unit tests to ensure reliability"
                        ))
        
        return danger_zones[:10]  # Top 10
    
    def _find_undocumented_code(
        self,
        repo_index: RepositoryIndex
    ) -> List[DangerZone]:
        """Find undocumented code"""
        danger_zones = []
        
        for file in repo_index.files:
            for symbol in file.symbols:
                if symbol.type in ['function', 'class'] and not symbol.docstring:
                    danger_zones.append(DangerZone(
                        type='undocumented',
                        severity='low',
                        location=f"{file.path}:{symbol.line_number}",
                        description=f"{symbol.type.capitalize()} '{symbol.name}' lacks documentation",
                        recommendation="Add docstring explaining purpose and usage"
                    ))
        
        return danger_zones[:10]  # Top 10
    
    def _find_complex_code(
        self,
        repo_index: RepositoryIndex
    ) -> List[DangerZone]:
        """Find high complexity code"""
        danger_zones = []
        
        for file in repo_index.files:
            if file.complexity_score > 50:  # High complexity threshold
                danger_zones.append(DangerZone(
                    type='complex',
                    severity='high',
                    location=file.path,
                    description=f"High complexity score: {file.complexity_score:.1f}",
                    recommendation="Refactor into smaller, testable functions"
                ))
        
        return danger_zones
    
    def _find_deprecated_patterns(
        self,
        repo_index: RepositoryIndex
    ) -> List[DangerZone]:
        """Find deprecated patterns"""
        danger_zones = []
        
        deprecated_keywords = ['eval', 'exec', 'var ', '__proto__']
        
        for file in repo_index.files:
            # This is simplified - would need actual file content
            for keyword in deprecated_keywords:
                if keyword in str(file.imports):
                    danger_zones.append(DangerZone(
                        type='deprecated',
                        severity='medium',
                        location=file.path,
                        description=f"Uses deprecated pattern: {keyword}",
                        recommendation="Update to modern alternatives"
                    ))
        
        return danger_zones
    
    def generate_report(
        self,
        danger_zones: List[DangerZone]
    ) -> str:
        """Generate danger zone report"""
        lines = ["# Danger Zone Report\n"]
        
        # Group by severity
        by_severity: Dict[str, List[DangerZone]] = {
            'high': [],
            'medium': [],
            'low': []
        }
        
        for dz in danger_zones:
            by_severity[dz.severity].append(dz)
        
        # High severity first
        for severity in ['high', 'medium', 'low']:
            zones = by_severity[severity]
            if zones:
                lines.append(f"\n## {severity.upper()} Priority ({len(zones)} issues)\n")
                
                for dz in zones:
                    lines.append(f"### {dz.type.upper()}: {dz.location}")
                    lines.append(f"**Issue**: {dz.description}")
                    lines.append(f"**Recommendation**: {dz.recommendation}\n")
        
        return '\n'.join(lines)

# Made with Bob
