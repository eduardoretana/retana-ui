"use client"

/**
 * Where two agents rewrote the same thing. Clean-room reading of a public
 * behavior description: each clash shows both wordings, a person keeps one,
 * and the file can close only when every clash is settled. No Affect source,
 * sample data, icons, or assets were copied.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type RadarAgent<TMeta = unknown> = {
  id: string
  name: string
  detail?: string
  working?: boolean
  meta?: TMeta
}

export type RadarClaim = {
  agentId: string
  text: string
}

export type RadarClash<TMeta = unknown> = {
  id: string
  topic: string
  left: RadarClaim
  right: RadarClaim
  /** Which wording was kept. */
  kept?: "left" | "right" | null
  meta?: TMeta
}

export type ConflictRadarLabels = {
  title: string
  open: (count: number) => string
  settled: string
  working: string
  quiet: string
  keep: (name: string) => string
  kept: (name: string) => string
  file: string
  fileNamed: string
  empty: string
  loading: string
  keptLive: (topic: string, name: string) => string
  filedLive: string
}

export type ConflictRadarClassNames = {
  root?: string
  clash?: string
}

export type ConflictRadarProps<TMeta = unknown> = {
  agents?: readonly RadarAgent<TMeta>[]
  clashes?: readonly RadarClash<TMeta>[]
  loading?: boolean
  error?: string
  title?: string
  onKeep?: (id: string, side: "left" | "right") => void
  onFile?: () => void
  className?: string
  classNames?: ConflictRadarClassNames
  labels?: Partial<ConflictRadarLabels>
}

const radarLabels: ConflictRadarLabels = {
  title: "Where they overlap",
  open: (count) => (count === 1 ? "1 clash open" : `${count} clashes open`),
  settled: "Settled",
  working: "Still writing",
  quiet: "Done writing",
  keep: (name) => `Keep ${name}`,
  kept: (name) => `Kept ${name}`,
  file: "File the order",
  fileNamed: "File the order once every clash is settled",
  empty: "No overlap on this order.",
  loading: "Loading the overlaps",
  keptLive: (topic, name) => `Kept ${name} on “${topic}”`,
  filedLive: "Order filed",
}

function resolveLabels(partial?: Partial<ConflictRadarLabels>): ConflictRadarLabels {
  return { ...radarLabels, ...partial }
}

export function openClashes(clashes: readonly Pick<RadarClash, "id" | "kept">[]) {
  return clashes.filter((clash) => clash.kept !== "left" && clash.kept !== "right").length
}

export function ConflictRadar<TMeta = unknown>({
  agents = [],
  clashes = [],
  loading = false,
  error,
  title,
  onKeep,
  onFile,
  className,
  classNames,
  labels: labelOverrides,
}: ConflictRadarProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const names = new Map(agents.map((agent) => [agent.id, agent.name]))
  const open = openClashes(clashes)
  const [live, setLive] = React.useState("")
  const nameOf = (id: string) => names.get(id) ?? id

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
        <Badge variant={open > 0 ? "destructive" : "secondary"}>{open > 0 ? labels.open(open) : labels.settled}</Badge>
      </header>
      {agents.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {agents.map((agent) => (
            <li key={agent.id}>
              <Badge variant="outline">
                {agent.name}
                {agent.detail ? ` · ${agent.detail}` : ""}
                {` · ${agent.working ? labels.working : labels.quiet}`}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-20 w-full motion-reduce:animate-none" />
          <Skeleton className="h-20 w-full motion-reduce:animate-none" />
        </div>
      ) : error && clashes.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : clashes.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {clashes.map((clash) => {
              const leftName = nameOf(clash.left.agentId)
              const rightName = nameOf(clash.right.agentId)
              const keptSide = clash.kept === "left" || clash.kept === "right" ? clash.kept : null
              return (
                <li key={clash.id} className={cn("rounded-lg border border-border px-3 py-2", classNames?.clash)}>
                  <h3 className="font-medium">{clash.topic}</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(["left", "right"] as const).map((side) => {
                      const claim = clash[side]
                      const name = side === "left" ? leftName : rightName
                      const kept = keptSide === side
                      const hidden = keptSide != null && !kept
                      if (hidden) return null
                      return (
                        <div key={side} className={cn("rounded-md border border-border px-2 py-2", kept && "border-primary bg-primary/5")}>
                          <p className="text-xs text-muted-foreground">{name}</p>
                          <p className="mt-1">{claim.text}</p>
                          {kept ? (
                            <Badge variant="secondary" className="mt-2">
                              {labels.kept(name)}
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => {
                                onKeep?.(clash.id, side)
                                setLive(labels.keptLive(clash.topic, name))
                              }}
                            >
                              {labels.keep(name)}
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
          <Button
            type="button"
            size="sm"
            className="self-start"
            disabled={open > 0}
            aria-label={labels.fileNamed}
            onClick={() => {
              onFile?.()
              setLive(labels.filedLive)
            }}
          >
            {labels.file}
          </Button>
        </div>
      )}
    </section>
  )
}
