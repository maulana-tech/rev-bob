import Link from 'next/link'

export default function Home() {
  const features = [
    {
      id: 'code-review',
      title: 'CodeReview Copilot',
      description: 'AI-powered PR reviewer with full repository context analysis',
      href: '/code-review',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      features: [
        'Bug & security detection',
        'Visual impact graphs',
        'GitHub-ready reviews',
        'Full context analysis'
      ],
      color: 'blue',
      badge: 'Most Popular'
    },
    {
      id: 'devflow',
      title: 'DevFlow Automator',
      description: 'Automate repetitive tasks and track productivity gains',
      href: '/devflow',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      features: [
        'Auto-generate tests',
        'Auto-generate docs',
        'Time savings analytics',
        'Workflow automation'
      ],
      color: 'green',
      badge: 'Time Saver'
    },
    {
      id: 'legacy-code',
      title: 'LegacyCode Explainer',
      description: 'Interactive knowledge graphs for legacy codebase comprehension',
      href: '/legacy-code',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: [
        'Knowledge graphs',
        'RAG-powered Q&A',
        'Auto-generated wiki',
        'Danger zone detection'
      ],
      color: 'purple',
      badge: 'Explorer'
    },
  ]

  const stats = [
    { value: '15', label: 'AI Agents', color: 'blue' },
    { value: '3', label: 'Features', color: 'green' },
    { value: '100%', label: 'IBM Bob Powered', color: 'purple' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl mb-6 shadow-lg">
            D
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            DevTools AI Suite
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Powered by IBM Bob
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            AI-powered developer tools for smarter, faster development with full repository context analysis
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Link 
              key={feature.id} 
              href={feature.href} 
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`card card-hover h-full p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
                {/* Badge */}
                <div className={`absolute top-4 right-4 badge badge-${feature.color} text-xs`}>
                  {feature.badge}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 dark:text-${feature.color}-400 mb-4 transition-transform group-hover:scale-110`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`flex items-center gap-2 text-${feature.color}-600 dark:text-${feature.color}-400 font-semibold text-sm group-hover:gap-3 transition-all`}>
                  <span>Launch Tool</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center gap-8 card px-8 py-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
                {index < stats.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-300 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Why Choose DevTools AI Suite?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Full Context Analysis',
                description: 'Analyzes entire repository structure for comprehensive insights',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: 'Multi-Agent Architecture',
                description: 'Specialized AI agents working together for optimal results',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: 'Real-time Insights',
                description: 'Get instant feedback and actionable recommendations',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: 'Enterprise Ready',
                description: 'Built for teams with security and scalability in mind',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
            ].map((item, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">Built for IBM Bob Hackathon 2026</p>
          <p>Multi-agent architecture with full repository context analysis</p>
        </div>
      </div>
    </main>
  )
}

// Made with Bob
