'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { api } from '@/lib/api'

export default function DevFlowPage() {
  const [repoPath, setRepoPath] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)

  const tasks = [
    { id: 'tests', label: 'Generate Unit Tests', color: 'blue' },
    { id: 'docs', label: 'Update Documentation', color: 'green' },
    { id: 'changelog', label: 'Generate Changelog', color: 'purple' },
  ]

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId]
    )
  }

  const handleRun = async () => {
    if (!repoPath.trim()) {
      setError('Please enter a repository path')
      return
    }
    if (selectedTasks.length === 0) {
      setError('Please select at least one task')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.runDevFlow({
        repo_path: repoPath,
        tasks: selectedTasks as any,
      })
      setResult(response)
      
      // Fetch updated analytics
      const analyticsData = await api.getDevFlowAnalytics()
      setAnalytics(analyticsData)
    } catch (err: any) {
      setError(err.message || 'Failed to run automation')
    } finally {
      setLoading(false)
    }
  }

  // Load analytics on mount
  useState(() => {
    api.getDevFlowAnalytics()
      .then(setAnalytics)
      .catch(console.error)
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">DevFlow Automator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automate repetitive development tasks and track productivity gains
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Repository Configuration</h2>
              
              <label className="block text-sm font-medium mb-2">
                Local Repository Path
              </label>
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="/path/to/your/repository"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 mb-4"
                disabled={loading}
              />

              <label className="block text-sm font-medium mb-3">
                Select Tasks to Automate
              </label>
              <div className="space-y-3 mb-6">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    disabled={loading}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedTasks.includes(task.id)
                        ? `border-${task.color}-500 bg-${task.color}-50 dark:bg-${task.color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{task.label}</div>
                      </div>
                      {selectedTasks.includes(task.id) && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRun}
                disabled={loading || selectedTasks.length === 0}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Running Automation...' : 'Run Automation'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Automation Results</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {result.results.tests_generated !== undefined && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.results.tests_generated}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tests Generated</div>
                    </div>
                  )}
                  {result.results.docs_updated !== undefined && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {result.results.docs_updated}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Docs Updated</div>
                    </div>
                  )}
                  {result.results.changelog_entries !== undefined && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {result.results.changelog_entries}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Changelog Entries</div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {result.time_saved_minutes} minutes
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Time Saved by Automation
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Analytics</h2>
              
              {analytics ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {Math.floor(analytics.total_time_saved / 60)}h {analytics.total_time_saved % 60}m
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Time Saved
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {analytics.tasks_completed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tasks Completed
                    </div>
                  </div>

                  {analytics.breakdown && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="text-sm font-medium mb-2">Breakdown</div>
                      <div className="space-y-2">
                        {Object.entries(analytics.breakdown).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {key}
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No analytics data yet
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="font-bold mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Run tests generation after adding new functions</li>
                <li>• Update docs before committing changes</li>
                <li>• Generate changelog before releases</li>
                <li>• Combine tasks for maximum efficiency</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Made with Bob
