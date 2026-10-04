"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/results/entity-relationship-graph/entity-relationship-graph.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GraphNode = { id: string; label: string; type?: string; weight?: number }
export type GraphEdge = { source: string; target: string; label?: string; weight?: number }

type SimNode = GraphNode & { x: number; y: number; vx: number; vy: number; r: number }

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number, iterations = 300): SimNode[] {
  const cx = width / 2
  const cy = height / 2
  const sim: SimNode[] = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, nodes.length)
    return {
      ...node,
      x: cx + Math.cos(angle) * Math.min(width, height) * 0.3,
      y: cy + Math.sin(angle) * Math.min(width, height) * 0.3,
      vx: 0,
      vy: 0,
      r: 10 + Math.sqrt(node.weight ?? 1) * 4,
    }
  })
  const index = new Map(sim.map((node) => [node.id, node]))
  const k = Math.sqrt((width * height) / Math.max(1, sim.length)) * 0.6
  for (let step = 0; step < iterations; step += 1) {
    const cooling = 1 - step / iterations
    for (let i = 0; i < sim.length; i += 1) {
      for (let j = i + 1; j < sim.length; j += 1) {
        const a = sim[i]
        const b = sim[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        const dist = Math.hypot(dx, dy) || 0.01
        const force = (k * k) / dist
        dx /= dist
        dy /= dist
        a.vx += dx * force * 0.001
        a.vy += dy * force * 0.001
        b.vx -= dx * force * 0.001
        b.vy -= dy * force * 0.001
      }
    }
    for (const edge of edges) {
      const a = index.get(edge.source)
      const b = index.get(edge.target)
      if (!a || !b) continue
      let dx = b.x - a.x
      let dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.01
      const force = ((dist - k) / dist) * 0.02 * (0.5 + (edge.weight ?? 0.5))
      dx *= force
      dy *= force
      a.vx += dx
      a.vy += dy
      b.vx -= dx
      b.vy -= dy
    }
    for (const node of sim) {
      node.vx += (cx - node.x) * 0.001
      node.vy += (cy - node.y) * 0.001
      node.x += node.vx * cooling
      node.y += node.vy * cooling
      node.vx *= 0.85
      node.vy *= 0.85
      node.x = Math.max(node.r, Math.min(width - node.r, node.x))
      node.y = Math.max(node.r, Math.min(height - node.r, node.y))
    }
  }
  return sim
}

function chartFor(type: string, types: string[]) {
  const index = Math.max(0, types.indexOf(type || "node"))
  return `var(--chart-${(index % 5) + 1})`
}

export type ForceGraphProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  height?: number
  onNodeClick?: (node: GraphNode) => void
  showExport?: boolean
  className?: string
}

export function ForceGraph({ nodes, edges, height = 320, onNodeClick, showExport = false, className }: ForceGraphProps) {
  const width = 640
  const svgRef = React.useRef<SVGSVGElement>(null)
  const layoutKey = `${width}x${height}:${nodes.map((node) => node.id).join(",")}:${edges.map((edge) => `${edge.source}>${edge.target}`).join(",")}`
  const settled = React.useMemo(() => layoutGraph(nodes, edges, width, height), [edges, height, nodes, width])
  const [dragged, setDragged] = React.useState<{ key: string; nodes: SimNode[] } | null>(null)
  const sim = dragged?.key === layoutKey ? dragged.nodes : settled
  const setSim = (update: SimNode[] | ((current: SimNode[]) => SimNode[])) => {
    setDragged((current) => {
      const base = current?.key === layoutKey ? current.nodes : settled
      return { key: layoutKey, nodes: typeof update === "function" ? update(base) : update }
    })
  }
  const [view, setView] = React.useState({ x: 0, y: 0, scale: 1 })
  const [hover, setHover] = React.useState<string | null>(null)
  const drag = React.useRef<{ id: string | null; pan: boolean; px: number; py: number }>({ id: null, pan: false, px: 0, py: 0 })
  const types = [...new Set(nodes.map((node) => node.type ?? "node"))]

  const index = new Map(sim.map((node) => [node.id, node]))

  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((clientX - rect.left) * (width / rect.width) - view.x) / view.scale,
      y: ((clientY - rect.top) * (height / rect.height) - view.y) / view.scale,
    }
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setView({ x: 0, y: 0, scale: 1 })}>
          Fit
        </Button>
        {showExport ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const svg = svgRef.current
              if (!svg) return
              const clone = svg.cloneNode(true) as SVGSVGElement
              clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
              const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" })
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = "graph.svg"
              link.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export SVG
          </Button>
        ) : null}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="application"
        aria-label="Relationship graph"
        tabIndex={0}
        className="w-full rounded-lg border border-border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        style={{ height }}
        onWheel={(event) => {
          event.preventDefault()
          const next = Math.min(2.5, Math.max(0.4, view.scale * (event.deltaY > 0 ? 0.9 : 1.1)))
          setView((current) => ({ ...current, scale: next }))
        }}
        onPointerDown={(event) => {
          const local = toLocal(event.clientX, event.clientY)
          const hit = sim.find((node) => Math.hypot(node.x - local.x, node.y - local.y) <= node.r + 4)
          drag.current = { id: hit?.id ?? null, pan: !hit, px: event.clientX, py: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drag.current.id && !drag.current.pan) return
          if (drag.current.pan) {
            const rect = svgRef.current?.getBoundingClientRect()
            if (!rect) return
            const dx = ((event.clientX - drag.current.px) * width) / rect.width
            const dy = ((event.clientY - drag.current.py) * height) / rect.height
            drag.current.px = event.clientX
            drag.current.py = event.clientY
            setView((current) => ({ ...current, x: current.x + dx, y: current.y + dy }))
            return
          }
          const local = toLocal(event.clientX, event.clientY)
          setSim((current) => current.map((node) => (node.id === drag.current.id ? { ...node, x: local.x, y: local.y } : node)))
        }}
        onPointerUp={() => {
          drag.current = { id: null, pan: false, px: 0, py: 0 }
        }}
        onKeyDown={(event) => {
          const step = 16
          if (event.key === "ArrowLeft") setView((current) => ({ ...current, x: current.x + step }))
          if (event.key === "ArrowRight") setView((current) => ({ ...current, x: current.x - step }))
          if (event.key === "ArrowUp") setView((current) => ({ ...current, y: current.y + step }))
          if (event.key === "ArrowDown") setView((current) => ({ ...current, y: current.y - step }))
        }}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          {edges.map((edge) => {
            const source = index.get(edge.source)
            const target = index.get(edge.target)
            if (!source || !target) return null
            const active = hover === edge.source || hover === edge.target
            return (
              <g key={`${edge.source}-${edge.target}-${edge.label ?? ""}`}>
                <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} className="stroke-border" strokeWidth={active ? 2 : 1} />
                {active && edge.label ? (
                  <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2} className="fill-muted-foreground text-[10px]">
                    {edge.label}
                  </text>
                ) : null}
              </g>
            )
          })}
          {sim.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`} onMouseEnter={() => setHover(node.id)} onMouseLeave={() => setHover(null)}>
              <circle r={node.r} style={{ fill: chartFor(node.type ?? "node", types) }} />
              <text y={node.r + 12} textAnchor="middle" className="fill-foreground text-[11px]">
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="flex flex-wrap gap-1">
        {sim.map((node) => (
          <button
            key={node.id}
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => onNodeClick?.(node)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onNodeClick?.(node)
            }}
          >
            {node.label}
          </button>
        ))}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">View as list</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th>From</th>
              <th>Relation</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge) => (
              <tr key={`${edge.source}-${edge.label}-${edge.target}`}>
                <td>{nodes.find((node) => node.id === edge.source)?.label ?? edge.source}</td>
                <td>{edge.label ?? "related"}</td>
                <td>{nodes.find((node) => node.id === edge.target)?.label ?? edge.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
