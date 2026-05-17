'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  label: string
  type: string
  metrics?: any
}

interface GraphEdge {
  source: string
  target: string
  type: string
}

interface KnowledgeGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: string
  metrics?: any
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node
  target: string | D3Node
  type: string
}

export default function KnowledgeGraph({ nodes, edges, onNodeClick }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredNodeType, setFilteredNodeType] = useState<string | null>(null)

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = 500

    // Color scheme for different node types
    const typeColors: Record<string, string> = {
      file: '#3B82F6',
      function: '#10B981',
      class: '#8B5CF6',
      module: '#F59E0B',
      import: '#EF4444',
    }

    // Filter nodes based on search and type filter
    let filteredNodes = nodes
    if (searchTerm) {
      filteredNodes = nodes.filter(n => 
        n.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filteredNodeType) {
      filteredNodes = filteredNodes.filter(n => n.type === filteredNodeType)
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = edges.filter(e => 
      filteredNodeIds.has(e.source.toString()) && filteredNodeIds.has(e.target.toString())
    )

    // Create data structures
    const d3Nodes: D3Node[] = filteredNodes.map(node => ({
      ...node,
      id: node.id,
    }))

    const d3Links: D3Link[] = filteredEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
    }))

    // Create force simulation
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))

    // Create container group
    const g = svg.append('g')

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('class', 'transition-all duration-200')

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(d3Nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    // Add circles to nodes
    const circles = node.append('circle')
      .attr('r', d => {
        if (d.type === 'file') return 10
        if (d.type === 'class') return 8
        return 6
      })
      .attr('fill', d => typeColors[d.type] || '#6B7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-200')

    // Add labels
    const labels = node.append('text')
      .text(d => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
      .attr('x', 0)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('class', 'dark:fill-gray-300 pointer-events-none select-none')
      .style('opacity', 0)

    // Add hover effects
    node
      .on('mouseenter', function(event, d) {
        // Highlight node
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.type === 'file' ? 12 : d.type === 'class' ? 10 : 8)
          .attr('stroke-width', 3)

        // Show label
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('opacity', 1)

        // Highlight connected links
        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', l => {
            const source = (l.source as D3Node).id
            const target = (l.target as D3Node).id
            return source === d.id || target === d.id ? 1 : 0.1
          })
          .attr('stroke-width', l => {
            const source = (l.source as D3Node).id
            const target = (l.target as D3Node).id
            return source === d.id || target === d.id ? 3 : 1.5
          })

        // Highlight connected nodes
        circles
          .transition()
          .duration(200)
          .style('opacity', n => {
            if (n.id === d.id) return 1
            const isConnected = d3Links.some(l => {
              const source = typeof l.source === 'object' ? l.source.id : l.source
              const target = typeof l.target === 'object' ? l.target.id : l.target
              return (source === d.id && target === n.id) || (target === d.id && source === n.id)
            })
            return isConnected ? 1 : 0.3
          })
      })
      .on('mouseleave', function(event, d) {
        // Reset node
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.type === 'file' ? 10 : d.type === 'class' ? 8 : 6)
          .attr('stroke-width', 2)

        // Hide label
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .style('opacity', 0)

        // Reset links
        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', 1.5)

        // Reset nodes
        circles
          .transition()
          .duration(200)
          .style('opacity', 1)
      })
      .on('click', (event, d) => {
        setSelectedNode(d)
        onNodeClick?.(d)
      })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x || 0)
        .attr('y1', d => (d.source as D3Node).y || 0)
        .attr('x2', d => (d.target as D3Node).x || 0)
        .attr('y2', d => (d.target as D3Node).y || 0)

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
    })

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<any, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<any, D3Node, D3Node>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<any, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [nodes, edges, onNodeClick, searchTerm, filteredNodeType])

  const nodeTypes = [
    { type: 'file', color: '#3B82F6', label: 'Files' },
    { type: 'function', color: '#10B981', label: 'Functions' },
    { type: 'class', color: '#8B5CF6', label: 'Classes' },
    { type: 'module', color: '#F59E0B', label: 'Modules' },
    { type: 'import', color: '#EF4444', label: 'Imports' },
  ]

  const nodeTypeCounts = nodeTypes.map(nt => ({
    ...nt,
    count: nodes.filter(n => n.type === nt.type).length
  }))

  return (
    <div className="relative">
      {/* Search and Filter Bar */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes..."
            className="input-field text-sm"
          />
        </div>
        <div className="flex gap-2">
          {nodeTypeCounts.map(({ type, color, label, count }) => (
            <button
              key={type}
              onClick={() => setFilteredNodeType(filteredNodeType === type ? null : type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filteredNodeType === type
                  ? 'ring-2 ring-offset-2'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={{
                backgroundColor: filteredNodeType === type ? color : 'transparent',
                color: filteredNodeType === type ? '#fff' : color,
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height: '500px' }}
      />

      {/* Legend */}
      <div className="absolute top-16 right-4 card p-3 text-xs max-w-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          Legend
        </div>
        <div className="space-y-1.5">
          {nodeTypes.map(({ type, color, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 card p-4 max-w-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {selectedNode.label}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={`inline-flex items-center badge badge-${selectedNode.type === 'file' ? 'blue' : selectedNode.type === 'class' ? 'purple' : selectedNode.type === 'function' ? 'green' : 'yellow'} text-xs capitalize mb-2`}>
            {selectedNode.type}
          </div>
          {selectedNode.metrics && (
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {Object.entries(selectedNode.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-16 left-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current)
            svg.transition().duration(750).call(
              d3.zoom<SVGSVGElement, unknown>().transform as any,
              d3.zoomIdentity
            )
          }}
          className="card p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Reset zoom"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No graph data available</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
