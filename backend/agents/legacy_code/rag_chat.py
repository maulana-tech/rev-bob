"""
RAG Chat Agent - Conversational interface for code Q&A

This agent is responsible for:
1. Processing natural language questions
2. Retrieving relevant code context
3. Generating contextual answers
4. Providing code examples
5. Linking to related components
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from backend.services.bob_client import IBMBobClient
from .knowledge_graph_builder import KnowledgeGraph, GraphNode


@dataclass
class ChatMessage:
    """Chat message"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str
    context_used: Optional[List[str]] = None


@dataclass
class ChatResponse:
    """Response to user question"""
    answer: str
    code_examples: List[str]
    related_components: List[str]
    confidence: float


class RAGChatAgent:
    """Agent for conversational code Q&A using RAG"""
    
    def __init__(self):
        """Initialize RAG Chat Agent"""
        self.agent_id = "rag_chat_001"
        self.bob_client = IBMBobClient()
        self.chat_history: List[ChatMessage] = []
    
    async def ask(
        self,
        question: str,
        knowledge_graph: KnowledgeGraph,
        max_context_nodes: int = 5
    ) -> ChatResponse:
        """
        Ask a question about the codebase
        
        Args:
            question: User's question
            knowledge_graph: Knowledge graph for context
            max_context_nodes: Maximum context nodes to retrieve
            
        Returns:
            ChatResponse with answer and examples
        """
        # Retrieve relevant context
        context_nodes = self._retrieve_context(
            question, knowledge_graph, max_context_nodes
        )
        
        # Build context string
        context_str = self._build_context_string(context_nodes)
        
        # Generate answer using IBM Bob
        answer = await self.bob_client.explain_code(
            code=context_str,
            language='text',
            question=question
        )
        
        # Extract code examples
        code_examples = self._extract_code_examples(answer)
        
        # Find related components
        related = [node.label for node in context_nodes[:3]]
        
        # Store in history
        self.chat_history.append(ChatMessage(
            role='user',
            content=question,
            timestamp='',
            context_used=[n.id for n in context_nodes]
        ))
        self.chat_history.append(ChatMessage(
            role='assistant',
            content=answer,
            timestamp=''
        ))
        
        return ChatResponse(
            answer=answer,
            code_examples=code_examples,
            related_components=related,
            confidence=0.85
        )
    
    def _retrieve_context(
        self,
        question: str,
        knowledge_graph: KnowledgeGraph,
        max_nodes: int
    ) -> List[GraphNode]:
        """Retrieve relevant context nodes"""
        # Simple keyword matching (can be improved with embeddings)
        question_lower = question.lower()
        keywords = question_lower.split()
        
        scored_nodes = []
        for node in knowledge_graph.nodes:
            score = 0
            node_text = f"{node.label} {node.type}".lower()
            
            for keyword in keywords:
                if keyword in node_text:
                    score += 1
            
            # Boost by importance
            score += node.importance_score
            
            if score > 0:
                scored_nodes.append((score, node))
        
        # Sort by score and return top nodes
        scored_nodes.sort(reverse=True, key=lambda x: x[0])
        return [node for _, node in scored_nodes[:max_nodes]]
    
    def _build_context_string(self, nodes: List[GraphNode]) -> str:
        """Build context string from nodes"""
        lines = ["Relevant code components:"]
        
        for node in nodes:
            lines.append(f"\n{node.type.upper()}: {node.label}")
            if node.properties:
                for key, value in node.properties.items():
                    lines.append(f"  {key}: {value}")
        
        return '\n'.join(lines)
    
    def _extract_code_examples(self, answer: str) -> List[str]:
        """Extract code examples from answer"""
        examples = []
        
        # Look for code blocks
        import re
        code_blocks = re.findall(r'```[\w]*\n(.*?)\n```', answer, re.DOTALL)
        examples.extend(code_blocks)
        
        return examples
    
    def get_chat_history(self) -> List[ChatMessage]:
        """Get chat history"""
        return self.chat_history
    
    def clear_history(self):
        """Clear chat history"""
        self.chat_history = []

# Made with Bob
