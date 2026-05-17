"""
Orchestrator Agent
Main coordinator that routes requests to appropriate feature agents
"""

from typing import Dict, Any, Optional
from enum import Enum
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentType(Enum):
    """Agent types for routing"""
    CODE_REVIEW = "code_review"
    DEV_FLOW = "devflow"
    LEGACY_CODE = "legacy_code"

class OrchestratorAgent:
    """
    Orchestrator Agent - Main Coordinator
    
    Responsibilities:
    - Route user requests to appropriate feature agent
    - Manage IBM Bob session lifecycle
    - Coordinate data sharing between agents
    - Handle authentication & authorization
    - Aggregate results from multiple agents
    - Error handling & recovery
    """
    
    def __init__(self, bob_client, github_client, db_session=None):
        """
        Initialize Orchestrator Agent
        
        Args:
            bob_client: IBM Bob client instance
            github_client: GitHub API client instance
            db_session: Database session (optional)
        """
        self.bob_client = bob_client
        self.github_client = github_client
        self.db_session = db_session
        self.agents = {}
        self.active_sessions = {}
        
        logger.info("Orchestrator Agent initialized")
    
    def route_request(self, request: Dict[str, Any]) -> AgentType:
        """
        Route request to appropriate agent based on feature
        
        Args:
            request: Request dictionary with 'feature' key
            
        Returns:
            AgentType enum
            
        Raises:
            ValueError: If feature is unknown
        """
        feature = request.get("feature")
        
        routing_map = {
            "pr_review": AgentType.CODE_REVIEW,
            "code_review": AgentType.CODE_REVIEW,
            "workflow": AgentType.DEV_FLOW,
            "devflow": AgentType.DEV_FLOW,
            "automation": AgentType.DEV_FLOW,
            "explore": AgentType.LEGACY_CODE,
            "legacy_code": AgentType.LEGACY_CODE,
            "knowledge_graph": AgentType.LEGACY_CODE
        }
        
        agent_type = routing_map.get(feature)
        
        if not agent_type:
            raise ValueError(f"Unknown feature: {feature}")
        
        logger.info(f"Routing request to {agent_type.value} agent")
        return agent_type
    
    async def initialize_bob_session(self, feature: str, user_id: Optional[str] = None) -> str:
        """
        Initialize IBM Bob session for a feature
        
        Args:
            feature: Feature name
            user_id: Optional user identifier
            
        Returns:
            Session ID
        """
        session_id = await self.bob_client.initialize_session()
        
        self.active_sessions[session_id] = {
            "feature": feature,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "calls": []
        }
        
        logger.info(f"IBM Bob session initialized: {session_id}")
        return session_id
    
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute request through appropriate agent
        
        Args:
            request: Request dictionary
            
        Returns:
            Response dictionary with results
            
        Raises:
            Exception: If execution fails
        """
        try:
            # Route to appropriate agent
            agent_type = self.route_request(request)
            
            # Initialize IBM Bob session
            session_id = await self.initialize_bob_session(
                feature=request.get("feature"),
                user_id=request.get("user_id")
            )
            
            # Add session ID to request
            request["bob_session_id"] = session_id
            
            # Execute based on agent type
            if agent_type == AgentType.CODE_REVIEW:
                result = await self._execute_code_review(request)
            elif agent_type == AgentType.DEV_FLOW:
                result = await self._execute_devflow(request)
            elif agent_type == AgentType.LEGACY_CODE:
                result = await self._execute_legacy_code(request)
            else:
                raise ValueError(f"Unsupported agent type: {agent_type}")
            
            # Add session info to result
            result["bob_session_id"] = session_id
            result["agent_type"] = agent_type.value
            
            logger.info(f"Request executed successfully via {agent_type.value}")
            return result
            
        except Exception as e:
            logger.error(f"Error executing request: {str(e)}")
            return await self.handle_error(e, request)
    
    async def _execute_code_review(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute code review request
        
        Args:
            request: Request with PR URL and options
            
        Returns:
            Code review results
        """
        logger.info("Executing code review request")
        
        # TODO: Implement actual code review logic
        # 1. Fetch PR with PRFetcherAgent
        # 2. Analyze with CodeAnalyzerAgent (IBM Bob)
        # 3. Build impact graph with ImpactGraphAgent
        # 4. Generate review with ReviewGeneratorAgent
        
        return {
            "status": "success",
            "feature": "code_review",
            "result": {
                "pr_data": {},
                "analysis": {},
                "impact_graph": {},
                "comments": []
            }
        }
    
    async def _execute_devflow(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute devflow automation request
        
        Args:
            request: Request with task type and options
            
        Returns:
            Automation results
        """
        logger.info("Executing devflow request")
        
        # TODO: Implement actual devflow logic
        # Based on task_type:
        # - generate-tests: TestGeneratorAgent
        # - update-docs: DocumentationAgent
        # - generate-changelog: ChangelogAgent
        
        return {
            "status": "success",
            "feature": "devflow",
            "result": {
                "task_type": request.get("task_type"),
                "output": {}
            }
        }
    
    async def _execute_legacy_code(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute legacy code analysis request
        
        Args:
            request: Request with repo URL and options
            
        Returns:
            Legacy code analysis results
        """
        logger.info("Executing legacy code request")
        
        # TODO: Implement actual legacy code logic
        # 1. Index repo with RepositoryIndexerAgent
        # 2. Build graph with KnowledgeGraphBuilderAgent
        # 3. Analyze with CodeComprehensionAgent (IBM Bob)
        # 4. Detect danger zones with DangerZoneDetectorAgent
        
        return {
            "status": "success",
            "feature": "legacy_code",
            "result": {
                "repo_id": "",
                "graph": {},
                "architecture": {},
                "danger_zones": []
            }
        }
    
    async def coordinate_agents(self, agents: list) -> Dict[str, Any]:
        """
        Coordinate multiple agents for complex tasks
        
        Args:
            agents: List of agent instances
            
        Returns:
            Aggregated results
        """
        results = []
        
        for agent in agents:
            try:
                result = await agent.execute()
                results.append(result)
            except Exception as e:
                logger.error(f"Agent {agent.__class__.__name__} failed: {str(e)}")
                results.append({"error": str(e)})
        
        return self.aggregate_results(results)
    
    def aggregate_results(self, results: list) -> Dict[str, Any]:
        """
        Aggregate results from multiple agents
        
        Args:
            results: List of result dictionaries
            
        Returns:
            Aggregated result dictionary
        """
        aggregated = {
            "total_agents": len(results),
            "successful": sum(1 for r in results if "error" not in r),
            "failed": sum(1 for r in results if "error" in r),
            "results": results
        }
        
        return aggregated
    
    async def handle_error(self, error: Exception, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle errors with recovery strategies
        
        Args:
            error: Exception that occurred
            request: Original request
            
        Returns:
            Error response dictionary
        """
        logger.error(f"Error handling request: {str(error)}")
        
        # Determine recovery strategy
        recovery_strategy = self._determine_recovery(error)
        
        error_response = {
            "status": "error",
            "error": {
                "type": type(error).__name__,
                "message": str(error),
                "recovery_strategy": recovery_strategy
            },
            "request": request
        }
        
        # TODO: Implement actual recovery logic
        # - Retry with exponential backoff
        # - Fallback to cached results
        # - Notify user of failure
        
        return error_response
    
    def _determine_recovery(self, error: Exception) -> str:
        """
        Determine recovery strategy based on error type
        
        Args:
            error: Exception that occurred
            
        Returns:
            Recovery strategy name
        """
        error_type = type(error).__name__
        
        recovery_map = {
            "ConnectionError": "retry_with_backoff",
            "TimeoutError": "retry_with_backoff",
            "ValueError": "validate_and_retry",
            "KeyError": "use_defaults",
            "Exception": "log_and_fail"
        }
        
        return recovery_map.get(error_type, "log_and_fail")
    
    async def close_session(self, session_id: str):
        """
        Close IBM Bob session and cleanup
        
        Args:
            session_id: Session ID to close
        """
        if session_id in self.active_sessions:
            await self.bob_client.close_session()
            del self.active_sessions[session_id]
            logger.info(f"Session closed: {session_id}")
    
    async def export_session_log(self, session_id: str) -> Dict[str, Any]:
        """
        Export session log for hackathon submission
        
        Args:
            session_id: Session ID to export
            
        Returns:
            Session log dictionary
        """
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session_data = self.active_sessions[session_id]
        bob_log = await self.bob_client.export_session_log()
        
        return {
            "session_id": session_id,
            "feature": session_data["feature"],
            "user_id": session_data["user_id"],
            "created_at": session_data["created_at"].isoformat(),
            "calls": session_data["calls"],
            "bob_log": bob_log
        }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get orchestrator status
        
        Returns:
            Status dictionary
        """
        return {
            "active_sessions": len(self.active_sessions),
            "registered_agents": len(self.agents),
            "status": "healthy"
        }

# Made with Bob
