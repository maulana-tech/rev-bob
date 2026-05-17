"""
Knowledge Graph Builder Agent - Build interactive knowledge graph from codebase

This agent is responsible for:
1. Creating nodes for files, classes, functions
2. Creating edges for dependencies & relationships
3. Calculating centrality & importance scores
4. Identifying code clusters & modules
5. Storing graph in database
"""

import sqlite3
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass
from collections import defaultdict

from .repository_indexer import RepositoryIndex, CodeSymbol


@dataclass
class GraphNode:
    """Node in knowledge graph"""
    id: str
    label: str
    type: str  # 'file', 'class', 'function', 'module'
    properties: Dict[str, Any]
    centrality_score: float = 0.0
    importance_score: float = 0.0


@dataclass
class GraphEdge:
    """Edge in knowledge graph"""
    source: str
    target: str
    type: str  # 'imports', 'calls', 'contains', 'extends'
    weight: float = 1.0


@dataclass
class CodeCluster:
    """Cluster of related code"""
    id: str
    name: str
    nodes: List[str]
    description: str


@dataclass
class KnowledgeGraph:
    """Complete knowledge graph"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    clusters: List[CodeCluster]
    metrics: Dict[str, Any]


class KnowledgeGraphBuilderAgent:
    """Agent for building knowledge graphs from code"""
    
    def __init__(self, db_path: str = ":memory:"):
        """Initialize Knowledge Graph Builder Agent"""
        self.agent_id = "knowledge_graph_builder_001"
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database for graph storage"""
        cursor = self.conn.cursor()
        
        # Nodes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT PRIMARY KEY,
                label TEXT,
                type TEXT,
                properties TEXT,
                centrality_score REAL,
                importance_score REAL
            )
        ''')
        
        # Edges table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS edges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                target TEXT,
                type TEXT,
                weight REAL,
                FOREIGN KEY (source) REFERENCES nodes(id),
                FOREIGN KEY (target) REFERENCES nodes(id)
            )
        ''')
        
        self.conn.commit()
    
    async def build_graph(
        self,
        repo_index: RepositoryIndex
    ) -> KnowledgeGraph:
        """
        Build knowledge graph from repository index
        
        Args:
            repo_index: Repository index
            
        Returns:
            KnowledgeGraph object
        """
        nodes = []
        edges = []
        
        # Create nodes for files
        for file in repo_index.files:
            node = GraphNode(
                id=f"file:{file.path}",
                label=file.path.split('/')[-1],
                type='file',
                properties={
                    'path': file.path,
                    'language': file.language,
                    'lines': file.lines_of_code,
                    'complexity': file.complexity_score
                }
            )
            nodes.append(node)
            
            # Create nodes for symbols in file
            for symbol in file.symbols:
                symbol_node = GraphNode(
                    id=f"{symbol.type}:{file.path}:{symbol.name}",
                    label=symbol.name,
                    type=symbol.type,
                    properties={
                        'file': file.path,
                        'line': symbol.line_number,
                        'signature': symbol.signature
                    }
                )
                nodes.append(symbol_node)
                
                # Edge: file contains symbol
                edges.append(GraphEdge(
                    source=f"file:{file.path}",
                    target=symbol_node.id,
                    type='contains'
                ))
        
        # Create edges for dependencies
        for file_path, dependencies in repo_index.dependency_tree.items():
            source_id = f"file:{file_path}"
            
            for dep in dependencies:
                # Try to find target file
                target_id = f"file:{dep}"
                if any(n.id == target_id for n in nodes):
                    edges.append(GraphEdge(
                        source=source_id,
                        target=target_id,
                        type='imports'
                    ))
        
        # Calculate metrics
        self._calculate_centrality(nodes, edges)
        self._calculate_importance(nodes, edges)
        
        # Identify clusters
        clusters = self._identify_clusters(nodes, edges)
        
        # Calculate graph metrics
        metrics = {
            'total_nodes': len(nodes),
            'total_edges': len(edges),
            'total_clusters': len(clusters),
            'avg_degree': len(edges) * 2 / len(nodes) if nodes else 0
        }
        
        # Store in database
        self._store_graph(nodes, edges)
        
        return KnowledgeGraph(
            nodes=nodes,
            edges=edges,
            clusters=clusters,
            metrics=metrics
        )
    
    def _calculate_centrality(
        self,
        nodes: List[GraphNode],
        edges: List[GraphEdge]
    ):
        """Calculate centrality scores for nodes"""
        # Build adjacency list
        adj: Dict[str, List[str]] = defaultdict(list)
        for edge in edges:
            adj[edge.source].append(edge.target)
            adj[edge.target].append(edge.source)
        
        # Simple degree centrality
        for node in nodes:
            degree = len(adj[node.id])
            node.centrality_score = degree / max(len(nodes) - 1, 1)
    
    def _calculate_importance(
        self,
        nodes: List[GraphNode],
        edges: List[GraphEdge]
    ):
        """Calculate importance scores"""
        # Count incoming edges (how many depend on this)
        incoming: Dict[str, int] = defaultdict(int)
        for edge in edges:
            incoming[edge.target] += 1
        
        # Normalize
        max_incoming = max(incoming.values()) if incoming else 1
        
        for node in nodes:
            node.importance_score = incoming[node.id] / max_incoming
    
    def _identify_clusters(
        self,
        nodes: List[GraphNode],
        edges: List[GraphEdge]
    ) -> List[CodeCluster]:
        """Identify code clusters using simple connected components"""
        # Build adjacency list
        adj: Dict[str, Set[str]] = defaultdict(set)
        for edge in edges:
            adj[edge.source].add(edge.target)
            adj[edge.target].add(edge.source)
        
        # Find connected components
        visited: Set[str] = set()
        clusters = []
        
        for node in nodes:
            if node.id not in visited:
                # BFS to find component
                component = []
                queue = [node.id]
                visited.add(node.id)
                
                while queue:
                    current = queue.pop(0)
                    component.append(current)
                    
                    for neighbor in adj[current]:
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)
                
                # Create cluster if significant size
                if len(component) > 1:
                    clusters.append(CodeCluster(
                        id=f"cluster_{len(clusters)}",
                        name=f"Module {len(clusters) + 1}",
                        nodes=component,
                        description=f"Cluster of {len(component)} related components"
                    ))
        
        return clusters
    
    def _store_graph(
        self,
        nodes: List[GraphNode],
        edges: List[GraphEdge]
    ):
        """Store graph in SQLite database"""
        import json
        
        cursor = self.conn.cursor()
        
        # Store nodes
        for node in nodes:
            cursor.execute('''
                INSERT OR REPLACE INTO nodes 
                (id, label, type, properties, centrality_score, importance_score)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                node.id,
                node.label,
                node.type,
                json.dumps(node.properties),
                node.centrality_score,
                node.importance_score
            ))
        
        # Store edges
        for edge in edges:
            cursor.execute('''
                INSERT INTO edges (source, target, type, weight)
                VALUES (?, ?, ?, ?)
            ''', (edge.source, edge.target, edge.type, edge.weight))
        
        self.conn.commit()
    
    def query_graph(
        self,
        node_type: Optional[str] = None,
        min_importance: float = 0.0
    ) -> List[GraphNode]:
        """Query nodes from graph"""
        import json
        
        cursor = self.conn.cursor()
        
        query = 'SELECT * FROM nodes WHERE importance_score >= ?'
        params: List[Any] = [min_importance]
        
        if node_type:
            query += ' AND type = ?'
            params.append(node_type)
        
        cursor.execute(query, params)
        
        nodes = []
        for row in cursor.fetchall():
            nodes.append(GraphNode(
                id=row[0],
                label=row[1],
                type=row[2],
                properties=json.loads(row[3]),
                centrality_score=row[4],
                importance_score=row[5]
            ))
        
        return nodes
    
    def get_neighbors(self, node_id: str) -> List[GraphNode]:
        """Get neighboring nodes"""
        import json
        
        cursor = self.conn.cursor()
        
        # Get connected nodes
        cursor.execute('''
            SELECT n.* FROM nodes n
            JOIN edges e ON (e.target = n.id OR e.source = n.id)
            WHERE e.source = ? OR e.target = ?
        ''', (node_id, node_id))
        
        neighbors = []
        for row in cursor.fetchall():
            neighbors.append(GraphNode(
                id=row[0],
                label=row[1],
                type=row[2],
                properties=json.loads(row[3]),
                centrality_score=row[4],
                importance_score=row[5]
            ))
        
        return neighbors
    
    def export_for_visualization(
        self,
        graph: KnowledgeGraph
    ) -> Dict[str, Any]:
        """Export graph in format for D3.js/Sigma.js"""
        return {
            'nodes': [
                {
                    'id': node.id,
                    'label': node.label,
                    'type': node.type,
                    'size': node.importance_score * 10 + 5,
                    'color': self._get_node_color(node.type),
                    'x': 0,
                    'y': 0,
                    'attributes': node.properties
                }
                for node in graph.nodes
            ],
            'edges': [
                {
                    'id': f"{edge.source}-{edge.target}",
                    'source': edge.source,
                    'target': edge.target,
                    'type': edge.type,
                    'size': edge.weight,
                    'color': '#cbd5e1'
                }
                for edge in graph.edges
            ],
            'metadata': graph.metrics
        }
    
    def _get_node_color(self, node_type: str) -> str:
        """Get color for node type"""
        colors = {
            'file': '#3b82f6',
            'class': '#8b5cf6',
            'function': '#10b981',
            'module': '#f59e0b'
        }
        return colors.get(node_type, '#6b7280')
    
    def __del__(self):
        """Close database connection"""
        if hasattr(self, 'conn'):
            self.conn.close()

# Made with Bob
