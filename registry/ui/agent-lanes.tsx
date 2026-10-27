"use client"

/**
 * Who is on the floor right now. Clean-room reading of a public behavior
 * description: one lane per agent, blocks on a shared clock, a hand-off to
 * the next agent, and an approval sitting on the block that needs it.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const LANE_TONES = ["work", "wait", "ask"] as const

export type LaneTone = (typeof LANE_TONES)[number]

export type LaneAgent<TMeta = unknown> = {
  id: string
  name: string
  role: string
  meta?: TMeta
}

export type LaneBlock<TMeta = unknown> = {
  id: string
  agentId: string
  title: string
  /** Minutes from midnight. */
  startMin: number
  durationMin: number
  tone: LaneTone
  handoffTo?: string
  meta?: TMeta
}

export type LaneWindow = {
  startMin: number
  endMin: number
  nowMin: number
}

export type AgentLanesLabels = {
  title: string
  working: (count: number) => string
  asking: (count: number) => string
  tone: Record<LaneTone | "idle", string>
  handoff: (name: string) => string
  open: (title: string) => string
  approve: string
  approveNamed: (title: string) => string
  now: string
  empty: string
  quiet: string
  loading: string
  clock: (minutes: number) => string
  approved: (title: string) => string
}

export type AgentLanesClassNames = {
  root?: string
  lane?: string
  block?: string
}

export type AgentLanesProps<TMeta = unknown> = {
  agents?: readonly LaneAgent<TMeta>[]
  blocks?: readonly LaneBlock<TMeta>[]
  window?: LaneWindow
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  onApprove?: (id: string) => void
  className?: string
  classNames?: AgentLanesClassNames
  labels?: Partial<AgentLanesLabels>
}

const laneLabels: AgentLanesLabels = {
  title: "Who is on the floor",
  working: (count) => (count === 1 ? "1 working" : `${count} working`),
  asking: (count) => (count === 1 ? "1 waiting on you" : `${count} waiting on you`),
  tone: {
    work: "Working",
    wait: "Waiting",
    ask: "Waiting on you",
    idle: "Free",
  },
  handoff: (name) => `Then ${name}`,
  open: (title) => `Open “${title}”`,
  approve: "Approve",
  approveNamed: (title) => `Approve “${title}”`,
  now: "Now",
  empty: "Nobody is on the floor.",
  quiet: "Everyone is free in this window.",
  loading: "Loading the floor",
  clock: (minutes) => {
    const safe = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60)
    const hour = Math.floor(safe / 60)
    const minute = safe % 60
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  },
  approved: (title) => `Approved “${title}”`,
}

function resolveLabels(partial?: Partial<AgentLanesLabels>): AgentLanesLabels {
  return { ...laneLabels, ...partial, tone: { ...laneLabels.tone, ...partial?.tone } }
}

export function laneLoad(
  agentId: string,
  blocks: readonly Pick<LaneBlock, "id" | "agentId" | "startMin" | "durationMin" | "tone">[],
  nowMin: number,
): LaneTone | "idle" {
  const hit = blocks.find((block) => block.agentId === agentId && block.startMin <= nowMin && nowMin < block.startMin + block.durationMin)
  return hit?.tone ?? "idle"
}

const TONE_BAR: Record<LaneTone, string> = {
  work: "bg-primary/70",
  wait: "bg-muted-foreground/40",
  ask: "bg-chart-4",
}

export function AgentLanes<TMeta = unknown>({
  agents = [],
  blocks = [],
  window: laneWindow = { startMin: 0, endMin: 60, nowMin: 0 },
  loading = false,
  error,
  title,
  onOpen,
  onApprove,
  className,
  classNames,
  labels: labelOverrides,
}: AgentLanesProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [live, setLive] = React.useState("")
  const span = Math.max(1, laneWindow.endMin - laneWindow.startMin)
  const working = agents.filter((agent) => laneLoad(agent.id, blocks, laneWindow.nowMin) === "work").length
  const asking = agents.filter((agent) => laneLoad(agent.id, blocks, laneWindow.nowMin) === "ask").length
  const nowLeft = Math.max(0, Math.min(100, ((laneWindow.nowMin - laneWindow.startMin) / span) * 100))
  const ticks = [laneWindow.startMin, laneWindow.startMin + span / 2, laneWindow.endMin]
  const byName = new Map(agents.map((agent) => [agent.id, agent.name]))

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
        <Badge variant="secondary">{labels.working(working)}</Badge>
        <Badge variant={asking > 0 ? "destructive" : "outline"}>{labels.asking(asking)}</Badge>
        <span className="ms-auto text-xs text-muted-foreground">
          {labels.now} {labels.clock(laneWindow.nowMin)}
        </span>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-14 w-full motion-reduce:animate-none" />
          <Skeleton className="h-14 w-full motion-reduce:animate-none" />
        </div>
      ) : error && agents.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : agents.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex justify-between ps-28 text-xs text-muted-foreground" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick}>{labels.clock(tick)}</span>
            ))}
          </div>
          <ul className="flex flex-col gap-3">
            {agents.map((agent) => {
              const load = laneLoad(agent.id, blocks, laneWindow.nowMin)
              const mine = blocks.filter((block) => block.agentId === agent.id)
              return (
                <li key={agent.id} className={cn("grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-2", classNames?.lane)}>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{agent.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{labels.tone[load]}</p>
                  </div>
                  <div className="relative h-12 rounded-lg bg-muted/60">
                    <span className="absolute inset-y-0 w-px bg-foreground/50" style={{ left: `${nowLeft}%` }} aria-hidden="true" />
                    {mine.map((block) => {
                      const left = ((block.startMin - laneWindow.startMin) / span) * 100
                      const width = (block.durationMin / span) * 100
                      return (
                        <span
                          key={block.id}
                          aria-hidden="true"
                          className={cn("absolute top-2 h-4 rounded-md", TONE_BAR[block.tone], classNames?.block)}
                          style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
                        />
                      )
                    })}
                  </div>
                  {mine.length === 0 ? <p className="col-start-2 text-xs text-muted-foreground">{labels.quiet}</p> : null}
                  {mine.length > 0 ? (
                    <ul className="col-start-2 flex flex-col gap-1">
                      {mine.map((block) => {
                        const next = block.handoffTo ? byName.get(block.handoffTo) : undefined
                        return (
                          <li key={`${block.id}-caption`} className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="rounded-md text-start text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              aria-label={labels.open(block.title)}
                              onClick={() => onOpen?.(block.id)}
                            >
                              {block.title}
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {labels.clock(block.startMin)}–{labels.clock(block.startMin + block.durationMin)}
                            </span>
                            {next ? <span className="text-xs text-muted-foreground">{labels.handoff(next)}</span> : null}
                            {block.tone === "ask" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                aria-label={labels.approveNamed(block.title)}
                                onClick={() => {
                                  onApprove?.(block.id)
                                  setLive(labels.approved(block.title))
                                }}
                              >
                                <Check aria-hidden="true" />
                                {labels.approve}
                              </Button>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
