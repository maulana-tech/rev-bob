"""
Analytics Agent - Track workflow metrics & time savings

This agent is responsible for:
1. Tracking automation execution time
2. Calculating time saved per task
3. Generating productivity reports
4. Visualizing workflow analytics
5. Providing recommendations
"""

import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class TaskMetric:
    """Metrics for a single task execution"""
    task_type: str  # 'test_generation', 'documentation', 'changelog', etc.
    execution_time: float  # seconds
    timestamp: datetime
    success: bool
    items_processed: int  # files, functions, commits, etc.
    time_saved_estimate: float  # estimated manual time in seconds


@dataclass
class ProductivityReport:
    """Productivity analytics report"""
    period_start: datetime
    period_end: datetime
    total_tasks: int
    total_time_saved: float  # hours
    tasks_by_type: Dict[str, int]
    avg_execution_time: Dict[str, float]
    success_rate: float
    recommendations: List[str]
    chart_data: Dict[str, Any]


class AnalyticsAgent:
    """Agent for tracking workflow analytics and time savings"""
    
    def __init__(self):
        """Initialize Analytics Agent"""
        self.agent_id = "analytics_agent_001"
        self.metrics: List[TaskMetric] = []
        
        # Estimated manual time for each task type (in minutes)
        self.manual_time_estimates = {
            'test_generation': 15,  # 15 min per function
            'documentation': 10,    # 10 min per function
            'changelog': 20,        # 20 min per release
            'code_review': 30,      # 30 min per PR
            'git_analysis': 45,     # 45 min manual analysis
        }
    
    def track_execution(
        self,
        task_type: str,
        execution_time: float,
        success: bool = True,
        items_processed: int = 1
    ) -> TaskMetric:
        """
        Track task execution
        
        Args:
            task_type: Type of task
            execution_time: Execution time in seconds
            success: Whether task succeeded
            items_processed: Number of items processed
            
        Returns:
            TaskMetric object
        """
        # Calculate time saved
        manual_time_minutes = self.manual_time_estimates.get(task_type, 10)
        time_saved = (manual_time_minutes * 60 * items_processed) - execution_time
        
        metric = TaskMetric(
            task_type=task_type,
            execution_time=execution_time,
            timestamp=datetime.now(),
            success=success,
            items_processed=items_processed,
            time_saved_estimate=max(0, time_saved)
        )
        
        self.metrics.append(metric)
        return metric
    
    def calculate_time_saved(
        self,
        since: Optional[datetime] = None
    ) -> float:
        """
        Calculate total time saved
        
        Args:
            since: Calculate from this date (None = all time)
            
        Returns:
            Time saved in hours
        """
        filtered_metrics = self.metrics
        
        if since:
            filtered_metrics = [m for m in self.metrics if m.timestamp >= since]
        
        total_seconds = sum(m.time_saved_estimate for m in filtered_metrics)
        return total_seconds / 3600  # Convert to hours
    
    def generate_report(
        self,
        period_days: int = 7
    ) -> ProductivityReport:
        """
        Generate productivity report
        
        Args:
            period_days: Number of days to include in report
            
        Returns:
            ProductivityReport object
        """
        period_end = datetime.now()
        period_start = period_end - timedelta(days=period_days)
        
        # Filter metrics for period
        period_metrics = [
            m for m in self.metrics
            if period_start <= m.timestamp <= period_end
        ]
        
        if not period_metrics:
            return self._empty_report(period_start, period_end)
        
        # Calculate statistics
        total_tasks = len(period_metrics)
        total_time_saved = sum(m.time_saved_estimate for m in period_metrics) / 3600
        
        # Group by task type
        tasks_by_type: Dict[str, int] = defaultdict(int)
        execution_times: Dict[str, List[float]] = defaultdict(list)
        
        for metric in period_metrics:
            tasks_by_type[metric.task_type] += 1
            execution_times[metric.task_type].append(metric.execution_time)
        
        # Calculate averages
        avg_execution_time = {
            task_type: sum(times) / len(times)
            for task_type, times in execution_times.items()
        }
        
        # Calculate success rate
        successful = sum(1 for m in period_metrics if m.success)
        success_rate = (successful / total_tasks * 100) if total_tasks > 0 else 0
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            period_metrics, tasks_by_type, success_rate
        )
        
        # Generate chart data
        chart_data = self._generate_chart_data(period_metrics, period_start, period_end)
        
        return ProductivityReport(
            period_start=period_start,
            period_end=period_end,
            total_tasks=total_tasks,
            total_time_saved=total_time_saved,
            tasks_by_type=dict(tasks_by_type),
            avg_execution_time=avg_execution_time,
            success_rate=success_rate,
            recommendations=recommendations,
            chart_data=chart_data
        )
    
    def _empty_report(
        self,
        period_start: datetime,
        period_end: datetime
    ) -> ProductivityReport:
        """Generate empty report when no metrics"""
        return ProductivityReport(
            period_start=period_start,
            period_end=period_end,
            total_tasks=0,
            total_time_saved=0.0,
            tasks_by_type={},
            avg_execution_time={},
            success_rate=0.0,
            recommendations=["Start using DevFlow automation to track time savings!"],
            chart_data={}
        )
    
    def _generate_recommendations(
        self,
        metrics: List[TaskMetric],
        tasks_by_type: Dict[str, int],
        success_rate: float
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Time savings recommendation
        total_hours_saved = sum(m.time_saved_estimate for m in metrics) / 3600
        if total_hours_saved > 10:
            recommendations.append(
                f"🎉 Excellent! You've saved {total_hours_saved:.1f} hours this period!"
            )
        elif total_hours_saved > 5:
            recommendations.append(
                f"👍 Good progress! {total_hours_saved:.1f} hours saved. Keep using automation!"
            )
        else:
            recommendations.append(
                "💡 Use more automation features to save time on repetitive tasks"
            )
        
        # Task-specific recommendations
        if tasks_by_type.get('test_generation', 0) < 5:
            recommendations.append(
                "🧪 Consider using test generation more frequently to improve coverage"
            )
        
        if tasks_by_type.get('documentation', 0) < 5:
            recommendations.append(
                "📝 Auto-generate documentation to keep your codebase well-documented"
            )
        
        # Success rate recommendation
        if success_rate < 90:
            recommendations.append(
                f"⚠️ Success rate is {success_rate:.1f}%. Review failed tasks for improvements"
            )
        
        return recommendations
    
    def _generate_chart_data(
        self,
        metrics: List[TaskMetric],
        period_start: datetime,
        period_end: datetime
    ) -> Dict[str, Any]:
        """Generate data for charts"""
        # Time saved over time (daily)
        daily_savings: Dict[str, float] = defaultdict(float)
        
        for metric in metrics:
            date_key = metric.timestamp.strftime('%Y-%m-%d')
            daily_savings[date_key] += metric.time_saved_estimate / 3600
        
        # Task distribution
        task_counts: Dict[str, int] = defaultdict(int)
        for metric in metrics:
            task_counts[metric.task_type] += 1
        
        return {
            'daily_time_saved': dict(daily_savings),
            'task_distribution': dict(task_counts),
            'total_metrics': len(metrics)
        }
    
    def visualize_analytics(
        self,
        report: ProductivityReport
    ) -> str:
        """
        Generate text-based visualization of analytics
        
        Args:
            report: Productivity report
            
        Returns:
            Formatted analytics string
        """
        lines = []
        
        lines.append("=" * 60)
        lines.append("📊 PRODUCTIVITY ANALYTICS REPORT")
        lines.append("=" * 60)
        lines.append("")
        
        # Period
        lines.append(f"Period: {report.period_start.strftime('%Y-%m-%d')} to {report.period_end.strftime('%Y-%m-%d')}")
        lines.append("")
        
        # Summary
        lines.append("SUMMARY")
        lines.append("-" * 60)
        lines.append(f"Total Tasks Executed: {report.total_tasks}")
        lines.append(f"Total Time Saved: {report.total_time_saved:.2f} hours")
        lines.append(f"Success Rate: {report.success_rate:.1f}%")
        lines.append("")
        
        # Tasks by type
        if report.tasks_by_type:
            lines.append("TASKS BY TYPE")
            lines.append("-" * 60)
            for task_type, count in sorted(report.tasks_by_type.items(), key=lambda x: x[1], reverse=True):
                avg_time = report.avg_execution_time.get(task_type, 0)
                lines.append(f"  {task_type:20s}: {count:3d} tasks (avg: {avg_time:.2f}s)")
            lines.append("")
        
        # Recommendations
        if report.recommendations:
            lines.append("RECOMMENDATIONS")
            lines.append("-" * 60)
            for rec in report.recommendations:
                lines.append(f"  • {rec}")
            lines.append("")
        
        lines.append("=" * 60)
        
        return '\n'.join(lines)
    
    def export_metrics(
        self,
        format: str = 'json'
    ) -> str:
        """Export metrics in specified format"""
        import json
        
        if format == 'json':
            data = [
                {
                    'task_type': m.task_type,
                    'execution_time': m.execution_time,
                    'timestamp': m.timestamp.isoformat(),
                    'success': m.success,
                    'items_processed': m.items_processed,
                    'time_saved': m.time_saved_estimate
                }
                for m in self.metrics
            ]
            return json.dumps(data, indent=2)
        
        return str(self.metrics)

# Made with Bob
