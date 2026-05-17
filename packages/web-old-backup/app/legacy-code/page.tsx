'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import KnowledgeGraph from '@/components/KnowledgeGraph'
import { api } from '@/lib/api'

export default function LegacyCodePage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [indexData, setIndexData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'graph' | 'chat' | 'wiki' | 'danger'>('graph')
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string }>>([])
  const [chatLoading, setChatLoading] = useState(false)

  const handleIndex = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid GitHub repository URL')
      return
    }

    setLoading(true)
    setError(null)
    setIndexData(null)

    try {
      const result = await api.indexRepository({ repo_url: repoUrl })
      setIndexData(result)
    } catch (err: any) {
      setError(err.message || 'Failed to index repository')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async () => {
    if (!chatQuestion.trim() || !indexData) return

    setChatLoading(true)
    try {
      const response = await api.chatWithCode({
        index_id: indexData.index_id,
        question: chatQuestion,
      })
      
      setChatHistory(prev => [...prev, {
        question: chatQuestion,
        answer: response.answer,
      }])
      setChatQuestion('')
    } catch (err: any) {
      console.error('Chat error:', err)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">LegacyCode Explainer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive knowledge graphs for legacy codebase comprehension
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium mb-2">
            GitHub Repository URL
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              disabled={loading}
            />
            <button
              onClick={handleIndex}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Indexing...' : 'Index Repository'}
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              IBM Bob is indexing the repository and building knowledge graph...
            </p>
          </div>
        )}

        {/* Results */}
        {indexData && !loading && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {indexData.stats?.total_files || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-blue-600">
                  {indexData.stats?.total_functions || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Functions</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-green-600">
                  {indexData.stats?.total_classes || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Classes</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-orange-600">
                  {indexData.knowledge_graph?.nodes?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Graph Nodes</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'graph', label: '🕸️ Knowledge Graph', color: 'purple' },
                  { id: 'chat', label: '💬 Chat', color: 'blue' },
                  { id: 'wiki', label: '📚 Wiki', color: 'green' },
                  { id: 'danger', label: '⚠️ Danger Zones', color: 'red' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? `text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Knowledge Graph Tab */}
                {activeTab === 'graph' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Interactive Knowledge Graph</h3>
                    {indexData.knowledge_graph?.nodes?.length > 0 ? (
                      <KnowledgeGraph
                        nodes={indexData.knowledge_graph.nodes}
                        edges={indexData.knowledge_graph.edges}
                      />
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center min-h-[400px] flex items-center justify-center">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-2">
                            No graph data available
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Nodes: {indexData.knowledge_graph?.nodes?.length || 0} | 
                            Edges: {indexData.knowledge_graph?.edges?.length || 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Chat with Your Codebase</h3>
                    
                    {/* Chat History */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                      {chatHistory.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                          Ask questions about your codebase...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((chat, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 ml-12">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
                                  You
                                </div>
                                <div className="text-gray-800 dark:text-gray-200">
                                  {chat.question}
                                </div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mr-12 border border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                                  IBM Bob
                                </div>
                                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                  {chat.answer}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask about your codebase..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        disabled={chatLoading}
                      />
                      <button
                        onClick={handleChat}
                        disabled={chatLoading || !chatQuestion.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {chatLoading ? '...' : 'Send'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Wiki Tab */}
                {activeTab === 'wiki' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Auto-Generated Documentation</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                        Wiki documentation will be generated and displayed here
                      </p>
                    </div>
                  </div>
                )}

                {/* Danger Zones Tab */}
                {activeTab === 'danger' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">⚠️ Code Quality Issues</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <div className="font-medium text-red-900 dark:text-red-300 mb-2">
                          Untested Functions
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Functions without unit test coverage will be listed here
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <div className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                          Undocumented Code
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Code without proper documentation will be listed here
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="font-medium text-orange-900 dark:text-orange-300 mb-2">
                          High Complexity Areas
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Functions with high cyclomatic complexity will be listed here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!indexData && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">Ready to Explore</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a GitHub repository URL above to start building the knowledge graph
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Made with Bob
