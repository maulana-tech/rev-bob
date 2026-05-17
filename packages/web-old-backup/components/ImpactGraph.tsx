'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface ImpactNode {
  id: string
  label: string
  type: string
}

interface ImpactEdge {
  source: string
  target: string
  weight: number
}

interface ImpactGraphProps {
  nodes: ImpactNode[]
  edges: ImpactEdge[]
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: string
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node
  target: string | D3Node
  weight: number
}

export default function ImpactGraph({ nodes, edges }: ImpactGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<ImpactNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = 500

    // Color scheme
    const typeColors: Record<string, string> = {
      changed: '#EF4444',
      affected: '#F59E0B',
      dependency: '#3B82F6',
    }

    // Create data structures
    const d3Nodes: D3Node[] = nodes.map(node => ({
      ...node,
      id: node.id,
    }))

    const d3Links: D3Link[] = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
    }))

    // Create force simulation
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(d => 100 / (d.weight || 1))
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create container group
    const g = svg.append('g')

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Create arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['changed', 'affected', 'dependency'])
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', d => typeColors[d])
      .attr('d', 'M0,-5L10,0L0,5')

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.weight || 1) * 2)
      .attr('marker-end', 'url(#arrow-dependency)')

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
    node.append('circle')
      .attr('r', d => d.type === 'changed' ? 12 : 8)
      .attr('fill', d => typeColors[d.type] || '#6B7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-200')

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('class', 'dark:fill-gray-300 pointer-events-none')

    // Add hover effects
    node
      .on('mouseenter', function(event, d) {
        setHoveredNode(d.id)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.type === 'changed' ? 14 : 10)
          .attr('stroke-width', 3)
      })
      .on('mouseleave', function(event, d) {
        setHoveredNode(null)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.type === 'changed' ? 12 : 8)
          .attr('stroke-width', 2)
      })
      .on('click', (event, d) => {
        setSelectedNode(d)
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
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [nodes, edges])

  const legend = [
    { type: 'changed', color: '#EF4444', label: 'Modified Files' },
    { type: 'affected', color: '#F59E0B', label: 'Affected Files' },
    { type: 'dependency', color: '#3B82F6', label: 'Dependencies' },
  ]

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height: '500px' }}
      />

      {/* Legend */}
      <div className="absolute top-4 right-4 card p-3 text-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          Impact Scope
        </div>
        <div className="space-y-1.5">
          {legend.map(({ type, color, label }) => (
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
        <div className="absolute bottom-4 left-4 card p-4 max-w-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
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
          <div className={`inline-flex items-center badge badge-${selectedNode.type === 'changed' ? 'red' : selectedNode.type === 'affected' ? 'yellow' : 'blue'} text-xs capitalize`}>
            {selectedNode.type}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
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
