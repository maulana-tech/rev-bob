"""
Impact Graph Agent - Generate visual impact graph of code changes

This agent is responsible for:
1. Building dependency graph from repository
2. Calculating impact radius of changes
3. Identifying affected files & modules
4. Generating D3.js/Sigma.js visualization data
"""

import os
import re
from typing import Dict, List, Any, Set, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict

from .pr_fetcher import PRData


@dataclass
class GraphNode:
    """Represents a node in the dependency graph"""
    id: str
    label: str
    type: str  # 'file', 'function', 'class', 'module'
    path: str
    size: int = 0  # Lines of code or importance score
    changed: bool = False
    impact_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphEdge:
    """Represents an edge (dependency) in the graph"""
    source: str
    target: str
    type: str  # 'imports', 'calls', 'extends', 'uses'
    weight: float = 1.0


@dataclass
class ImpactGraph:
    """Complete impact graph structure"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    changed_files: List[str]
    affected_files: List[str]
    impact_radius: int
    visualization_data: Dict[str, Any]


class ImpactGraphAgent:
    """
    Agent for generating impact graphs of code changes
    
    This agent analyzes how code changes propagate through the codebase
    and generates interactive visualizations.
    """
    
    def __init__(self):
        """Initialize Impact Graph Agent"""
        self.agent_id = "impact_graph_001"
        
    async def build_dependency_graph(self, pr_data: PRData) -> Dict[str, Any]:
        """
        Build dependency graph from repository
        
        Args:
            pr_data: PR data with repository context
            
        Returns:
            Dependency graph structure
        """
        if not pr_data.repo_path:
            raise ValueError("Repository path not available in PR data")
        
        # Parse all files to extract dependencies
        dependencies = self._parse_dependencies(pr_data.repo_path)
        
        # Build graph structure
        graph = {
            'nodes': {},
            'edges': []
        }
        
        # Add nodes for each file
        for file_path, deps in dependencies.items():
            node_id = self._file_to_node_id(file_path)
            graph['nodes'][node_id] = {
                'id': node_id,
                'label': os.path.basename(file_path),
                'path': file_path,
                'type': 'file',
                'dependencies': deps
            }
        
        # Add edges for dependencies
        for file_path, deps in dependencies.items():
            source_id = self._file_to_node_id(file_path)
            for dep in deps:
                target_id = self._file_to_node_id(dep)
                if target_id in graph['nodes']:
                    graph['edges'].append({
                        'source': source_id,
                        'target': target_id,
                        'type': 'imports'
                    })
        
        return graph
    
    def _parse_dependencies(self, repo_path: str) -> Dict[str, List[str]]:
        """
        Parse dependencies from repository files
        
        Args:
            repo_path: Path to repository
            
        Returns:
            Dictionary mapping file paths to their dependencies
        """
        dependencies = {}
        
        # Walk through repository
        for root, dirs, files in os.walk(repo_path):
            # Skip common directories
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', '.venv']]
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, repo_path)
                
                # Parse based on file extension
                if file.endswith('.py'):
                    deps = self._parse_python_imports(file_path, repo_path)
                elif file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    deps = self._parse_javascript_imports(file_path, repo_path)
                else:
                    deps = []
                
                if deps:
                    dependencies[rel_path] = deps
        
        return dependencies
    
    def _parse_python_imports(self, file_path: str, repo_path: str) -> List[str]:
        """Parse Python import statements"""
        imports = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Match import statements
            import_patterns = [
                r'from\s+(\S+)\s+import',
                r'import\s+(\S+)'
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    # Convert module path to file path
                    module_path = match.replace('.', os.sep) + '.py'
                    imports.append(module_path)
        
        except Exception:
            pass
        
        return imports
    
    def _parse_javascript_imports(self, file_path: str, repo_path: str) -> List[str]:
        """Parse JavaScript/TypeScript import statements"""
        imports = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Match import statements
            import_patterns = [
                r'import\s+.*\s+from\s+[\'"](.+)[\'"]',
                r'require\([\'"](.+)[\'"]\)'
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    # Skip node_modules
                    if not match.startswith('.'):
                        continue
                    
                    # Resolve relative path
                    file_dir = os.path.dirname(file_path)
                    import_path = os.path.normpath(os.path.join(file_dir, match))
                    rel_path = os.path.relpath(import_path, repo_path)
                    imports.append(rel_path)
        
        except Exception:
            pass
        
        return imports
    
    async def calculate_impact(
        self,
        pr_data: PRData,
        graph: Dict[str, Any]
    ) -> ImpactGraph:
        """
        Calculate impact of changes on the codebase
        
        Args:
            pr_data: PR data
            graph: Dependency graph
            
        Returns:
            ImpactGraph with calculated impacts
        """
        # Get changed files
        changed_files = [f['filename'] for f in pr_data.files_changed]
        
        # Find affected files (files that depend on changed files)
        affected_files = self._find_affected_files(changed_files, graph)
        
        # Calculate impact scores
        nodes = []
        for node_id, node_data in graph['nodes'].items():
            file_path = node_data['path']
            changed = file_path in changed_files
            
            # Calculate impact score based on:
            # 1. Direct change (100%)
            # 2. Direct dependency (50%)
            # 3. Indirect dependency (25%)
            impact_score = 0.0
            if changed:
                impact_score = 100.0
            elif file_path in affected_files:
                # Check dependency distance
                distance = self._calculate_dependency_distance(
                    file_path, changed_files, graph
                )
                if distance == 1:
                    impact_score = 50.0
                elif distance == 2:
                    impact_score = 25.0
                else:
                    impact_score = 10.0
            
            nodes.append(GraphNode(
                id=node_id,
                label=node_data['label'],
                type=node_data['type'],
                path=file_path,
                changed=changed,
                impact_score=impact_score,
                metadata=node_data
            ))
        
        # Convert edges
        edges = [
            GraphEdge(
                source=edge['source'],
                target=edge['target'],
                type=edge['type']
            )
            for edge in graph['edges']
        ]
        
        # Calculate impact radius (max dependency distance)
        impact_radius = max(
            (self._calculate_dependency_distance(f, changed_files, graph)
             for f in affected_files),
            default=0
        )
        
        # Generate visualization data
        viz_data = self._generate_visualization_data(nodes, edges, changed_files)
        
        return ImpactGraph(
            nodes=nodes,
            edges=edges,
            changed_files=changed_files,
            affected_files=affected_files,
            impact_radius=impact_radius,
            visualization_data=viz_data
        )
    
    def _find_affected_files(
        self,
        changed_files: List[str],
        graph: Dict[str, Any]
    ) -> List[str]:
        """
        Find files affected by changes (reverse dependencies)
        
        Args:
            changed_files: List of changed file paths
            graph: Dependency graph
            
        Returns:
            List of affected file paths
        """
        affected = set()
        
        # Build reverse dependency map
        reverse_deps = defaultdict(list)
        for edge in graph['edges']:
            source_path = graph['nodes'][edge['source']]['path']
            target_path = graph['nodes'][edge['target']]['path']
            reverse_deps[target_path].append(source_path)
        
        # BFS to find all affected files
        queue = list(changed_files)
        visited = set(changed_files)
        
        while queue:
            current = queue.pop(0)
            
            # Find files that depend on current file
            for dependent in reverse_deps.get(current, []):
                if dependent not in visited:
                    visited.add(dependent)
                    affected.add(dependent)
                    queue.append(dependent)
        
        return list(affected)
    
    def _calculate_dependency_distance(
        self,
        target_file: str,
        changed_files: List[str],
        graph: Dict[str, Any]
    ) -> int:
        """
        Calculate shortest dependency distance from target to any changed file
        
        Args:
            target_file: Target file path
            changed_files: List of changed file paths
            graph: Dependency graph
            
        Returns:
            Minimum distance (0 if target is changed, -1 if no path)
        """
        if target_file in changed_files:
            return 0
        
        # Build dependency map
        deps = {}
        for node_id, node_data in graph['nodes'].items():
            deps[node_data['path']] = node_data.get('dependencies', [])
        
        # BFS to find shortest path
        queue = [(target_file, 0)]
        visited = {target_file}
        
        while queue:
            current, distance = queue.pop(0)
            
            # Check dependencies
            for dep in deps.get(current, []):
                if dep in changed_files:
                    return distance + 1
                
                if dep not in visited:
                    visited.add(dep)
                    queue.append((dep, distance + 1))
        
        return -1  # No path found
    
    def _generate_visualization_data(
        self,
        nodes: List[GraphNode],
        edges: List[GraphEdge],
        changed_files: List[str]
    ) -> Dict[str, Any]:
        """
        Generate D3.js/Sigma.js compatible visualization data
        
        Args:
            nodes: Graph nodes
            edges: Graph edges
            changed_files: List of changed files
            
        Returns:
            Visualization data structure
        """
        # Convert to D3/Sigma format
        viz_nodes = []
        for node in nodes:
            # Determine node color based on impact
            if node.changed:
                color = '#ef4444'  # Red for changed
            elif node.impact_score >= 50:
                color = '#f59e0b'  # Orange for high impact
            elif node.impact_score >= 25:
                color = '#eab308'  # Yellow for medium impact
            elif node.impact_score > 0:
                color = '#3b82f6'  # Blue for low impact
            else:
                color = '#9ca3af'  # Gray for no impact
            
            # Node size based on impact score
            size = max(5, node.impact_score / 10)
            
            viz_nodes.append({
                'id': node.id,
                'label': node.label,
                'x': 0,  # Will be positioned by force layout
                'y': 0,
                'size': size,
                'color': color,
                'attributes': {
                    'path': node.path,
                    'type': node.type,
                    'changed': node.changed,
                    'impact_score': node.impact_score
                }
            })
        
        viz_edges = []
        for edge in edges:
            viz_edges.append({
                'id': f"{edge.source}-{edge.target}",
                'source': edge.source,
                'target': edge.target,
                'size': edge.weight,
                'color': '#cbd5e1'
            })
        
        return {
            'nodes': viz_nodes,
            'edges': viz_edges,
            'metadata': {
                'changed_files_count': len(changed_files),
                'total_nodes': len(viz_nodes),
                'total_edges': len(viz_edges)
            }
        }
    
    def _file_to_node_id(self, file_path: str) -> str:
        """Convert file path to node ID"""
        return file_path.replace(os.sep, '_').replace('.', '_')
    
    def generate_d3_data(self, impact_graph: ImpactGraph) -> Dict[str, Any]:
        """
        Generate D3.js specific format
        
        Args:
            impact_graph: Impact graph
            
        Returns:
            D3.js compatible data
        """
        return impact_graph.visualization_data
    
    def generate_sigma_data(self, impact_graph: ImpactGraph) -> Dict[str, Any]:
        """
        Generate Sigma.js specific format
        
        Args:
            impact_graph: Impact graph
            
        Returns:
            Sigma.js compatible data
        """
        # Sigma.js uses similar format to D3
        return impact_graph.visualization_data

# Made with Bob
