"""
LegacyCode Agent Package

Sub-agents for legacy codebase comprehension and knowledge graph generation
"""

from .repository_indexer import (
    RepositoryIndexerAgent,
    RepositoryIndex,
    FileStructure,
    CodeSymbol
)
from .knowledge_graph_builder import (
    KnowledgeGraphBuilderAgent,
    KnowledgeGraph,
    GraphNode,
    GraphEdge,
    CodeCluster
)
from .code_comprehension import (
    CodeComprehensionAgent,
    CodeExplanation
)
from .rag_chat import (
    RAGChatAgent,
    ChatMessage,
    ChatResponse
)
from .wiki_generator import (
    WikiGeneratorAgent,
    WikiPage
)
from .danger_zone_detector import (
    DangerZoneDetectorAgent,
    DangerZone
)

__all__ = [
    # Repository Indexer
    'RepositoryIndexerAgent',
    'RepositoryIndex',
    'FileStructure',
    'CodeSymbol',
    # Knowledge Graph Builder
    'KnowledgeGraphBuilderAgent',
    'KnowledgeGraph',
    'GraphNode',
    'GraphEdge',
    'CodeCluster',
    # Code Comprehension
    'CodeComprehensionAgent',
    'CodeExplanation',
    # RAG Chat
    'RAGChatAgent',
    'ChatMessage',
    'ChatResponse',
    # Wiki Generator
    'WikiGeneratorAgent',
    'WikiPage',
    # Danger Zone Detector
    'DangerZoneDetectorAgent',
    'DangerZone',
]

# Made with Bob
