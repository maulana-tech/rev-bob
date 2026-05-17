'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import ImpactGraph from '@/components/ImpactGraph'
import { api } from '@/lib/api'

export default function CodeReviewPage() {
  const [prUrl, setPrUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (analysis?.review_comment) {
      await navigator.clipboard.writeText(analysis.review_comment)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAnalyze = async () => {
    if (!prUrl.trim()) {
      setError('Please enter a valid GitHub PR URL')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const result = await api.analyzePR({
        pr_url: prUrl,
        include_full_context: true,
      })
      setAnalysis(result)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze PR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CodeReview Copilot</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered PR reviewer with full repository context analysis
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium mb-2">
            GitHub Pull Request URL
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Analyzing...' : 'Analyze PR'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              IBM Bob is analyzing the PR with full repository context...
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.issues?.filter((i: any) => i.severity === 'critical').length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysis.issues?.filter((i: any) => i.severity === 'warning').length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.issues?.filter((i: any) => i.severity === 'info').length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Info</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.impact_graph?.nodes?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Files Affected</div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Issues Found</h2>
              <div className="space-y-3">
                {analysis.issues?.map((issue: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === 'critical'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : issue.severity === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{issue.type}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {issue.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          {issue.file}
                          {issue.line && ` (Line ${issue.line})`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Graph */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Impact Graph</h2>
              {analysis.impact_graph?.nodes?.length > 0 ? (
                <ImpactGraph
                  nodes={analysis.impact_graph.nodes}
                  edges={analysis.impact_graph.edges}
                />
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No impact data available
                  </p>
                </div>
              )}
            </div>

            {/* Review Comment */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">GitHub Review Comment</h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{analysis.review_comment}</pre>
              </div>
              <button
                onClick={handleCopy}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a GitHub PR URL above to start the AI-powered code review
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Made with Bob
