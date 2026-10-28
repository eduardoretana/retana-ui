"use client"

/**
 * Who is calling whom. Clean-room reading of a public behavior description:
 * agents and the tools they call sit on one map, busier links draw thicker,
 * and a node that is waiting or blocked is marked. This is not who launched
 * whom; that stays on agent-tree. No Affect source, sample data, icons, or
 * assets were copied. The map does not animate.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const GRAPH_KINDS = ["person", "agent", "tool"] as const
export const GRAPH_PULSES = ["quiet", "working", "waiting", "failed"] as const
export const GRAPH_TONES = ["call", "answer", "blocked"] as const

export type GraphKind = (typeof GRAPH_KINDS)[number]
export type GraphPulse = (typeof GRAPH_PULSES)[number]
export type GraphTone = (typeof GRAPH_TONES)[number]

export type GraphNode<TMeta = unknown> = {
  id: string
  name: string
  kind: GraphKind
  detail?: string
  pulse: GraphPulse
  /** Zero-based column on the map. */
  column: number
  /** Zero-based row on the map. */
  row: number
  meta?: TMeta
}

export type GraphLink<TMeta = unknown> = {
  id: string
  from: string
  to: string
  /** How many calls sit on this link. */
  calls: number
  tone: GraphTone
  meta?: TMeta
}

export type AgentGraphLabels = {
  title: string
  agents: (count: number) => string
  tools: (count: number) => string
  calls: (count: number) => string
  kind: Record<GraphKind, string>
  pulse: Record<GraphPulse, string>
  tone: Record<GraphTone, string>
  open: (name: string) => string
  link: (from: string, to: string, calls: number, tone: string) => string
  busiest: (from: string, to: string, calls: number) => string
  empty: string
  loading: string
}

export type AgentGraphClassNames = {
  root?: string
  node?: string
  map?: string
}

export type AgentGraphProps<TMeta = unknown> = {
  nodes?: readonly GraphNode<TMeta>[]
  links?: readonly GraphLink<TMeta>[]
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  className?: string
  classNames?: AgentGraphClassNames
  labels?: Partial<AgentGraphLabels>
}

const graphLabels: AgentGraphLabels = {
  title: "Call map",
  agents: (count) => (count === 1 ? "1 agent" : `${count} agents`),
  tools: (count) => (count === 1 ? "1 tool" : `${count} tools`),
  calls: (count) => (count === 1 ? "1 call" : `${count} calls`),
  kind: { person: "Person", agent: "Agent", tool: "Tool" },
  pulse: { quiet: "Quiet", working: "Working", waiting: "Waiting on you", failed: "Failed" },
  tone: { call: "Call", answer: "Answer", blocked: "Blocked" },
  open: (name) => `Open ${name}`,
  link: (from, to, calls, tone) => `${from} to ${to}, ${calls} ${calls === 1 ? "call" : "calls"}, ${tone}`,
  busiest: (from, to, calls) => `Busiest link: ${from} to ${to}, ${calls} ${calls === 1 ? "call" : "calls"}`,
  empty: "Nobody is on the map.",
  loading: "Loading the map",
}

function resolveLabels(partial?: Partial<AgentGraphLabels>): AgentGraphLabels {
  return {
    ...graphLabels,
    ...partial,
    kind: { ...graphLabels.kind, ...partial?.kind },
    pulse: { ...graphLabels.pulse, ...partial?.pulse },
    tone: { ...graphLabels.tone, ...partial?.tone },
  }
}

export function graphTraffic(links: readonly Pick<GraphLink, "id" | "calls">[]) {
  return links.reduce((sum, link) => sum + Math.max(0, link.calls), 0)
}

export function graphByPulse(nodes: readonly Pick<GraphNode, "id" | "pulse">[], pulse: GraphPulse) {
  return nodes.filter((node) => node.pulse === pulse).length
}

export function busiestLink<T extends Pick<GraphLink, "id" | "calls">>(links: readonly T[]) {
  return links.reduce<T | null>((best, link) => (best == null || link.calls > best.calls ? link : best), null)
}

const PULSE_BORDER: Record<GraphPulse, string> = {
  quiet: "border-border",
  working: "border-chart-2",
  waiting: "border-chart-4",
  failed: "border-destructive",
}

const TONE_STROKE: Record<GraphTone, string> = {
  call: "stroke-foreground/40",
  answer: "stroke-primary",
  blocked: "stroke-destructive",
}

export function AgentGraph<TMeta = unknown>({
  nodes = [],
  links = [],
  loading = false,
  error,
  title,
  onOpen,
  className,
  classNames,
  labels: labelOverrides,
}: AgentGraphProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const agents = nodes.filter((node) => node.kind === "agent").length
  const tools = nodes.filter((node) => node.kind === "tool").length
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const cols = Math.max(1, ...nodes.map((node) => node.column + 1))
  const rows = Math.max(1, ...nodes.map((node) => node.row + 1))
  const busiest = busiestLink(links)
  const fromName = busiest ? byId.get(busiest.from)?.name : undefined
  const toName = busiest ? byId.get(busiest.to)?.name : undefined

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <Badge variant="secondary">{labels.agents(agents)}</Badge>
        <Badge variant="outline">{labels.tools(tools)}</Badge>
        <Badge variant="outline">{labels.calls(graphTraffic(links))}</Badge>
      </header>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-48 w-full motion-reduce:animate-none" />
        </div>
      ) : error && nodes.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : nodes.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className={cn("relative", classNames?.map)} style={{ height: `${rows * 6.25}rem` }}>
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {links.map((link) => {
                const from = byId.get(link.from)
                const to = byId.get(link.to)
                if (!from || !to) return null
                const x1 = ((from.column + 0.5) / cols) * 100
                const y1 = ((from.row + 0.5) / rows) * 100
                const x2 = ((to.column + 0.5) / cols) * 100
                const y2 = ((to.row + 0.5) / rows) * 100
                return (
                  <line
                    key={link.id}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    className={TONE_STROKE[link.tone]}
                    strokeWidth={1 + Math.min(link.calls, 6)}
                  />
                )
              })}
            </svg>
            {nodes.map((node) => (
              <Button
                key={node.id}
                type="button"
                variant="outline"
                className={cn(
                  "absolute z-10 h-auto w-36 flex-col items-start gap-0.5 px-2 py-1.5 whitespace-normal",
                  PULSE_BORDER[node.pulse],
                  classNames?.node,
                )}
                style={{
                  left: `${((node.column + 0.5) / cols) * 100}%`,
                  top: `${((node.row + 0.5) / rows) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                aria-label={labels.open(node.name)}
                onClick={() => onOpen?.(node.id)}
              >
                <span className="font-medium">{node.name}</span>
                <span className="text-xs text-muted-foreground">{labels.pulse[node.pulse]}</span>
              </Button>
            ))}
          </div>
          <ul className="sr-only">
            {links.map((link) => {
              const from = byId.get(link.from)
              const to = byId.get(link.to)
              if (!from || !to) return null
              return <li key={link.id}>{labels.link(from.name, to.name, link.calls, labels.tone[link.tone])}</li>
            })}
          </ul>
          {busiest && fromName && toName ? <p className="text-xs text-muted-foreground">{labels.busiest(fromName, toName, busiest.calls)}</p> : null}
        </div>
      )}
    </section>
  )
}
