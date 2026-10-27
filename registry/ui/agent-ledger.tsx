"use client"

/**
 * Changes an agent already made, and which of them can be taken back.
 * Clean-room reading of a public behavior description. No Affect source,
 * sample data, icons, or assets were copied.
 */

import * as React from "react"
import { RotateCcw, Undo2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type LedgerChange<TMeta = unknown> = {
  id: string
  summary: string
  system: string
  before?: string
  after?: string
  note?: string
  /** Epoch milliseconds. */
  at: number
  /** False when the change cannot be taken back. Defaults to reversible. */
  reversible?: boolean
  /** Earlier change ids this one builds on. */
  follows?: readonly string[]
  meta?: TMeta
}

export type LedgerImpact = {
  /** The change and later reversible changes that revert with it. */
  revert: string[]
  /** Later changes that stay, because they cannot be taken back. */
  stays: string[]
}

export type AgentLedgerLabels = {
  title: string
  undo: string
  redo: string
  undoNamed: (summary: string) => string
  redoNamed: (summary: string) => string
  also: (count: number) => string
  stays: (count: number) => string
  staysFlag: string
  empty: string
  loading: string
  to: string
  age: (minutes: number) => string
}

export type AgentLedgerClassNames = {
  root?: string
  row?: string
  change?: string
  empty?: string
}

export type AgentLedgerProps<TMeta = unknown> = {
  changes?: readonly LedgerChange<TMeta>[]
  agent?: string
  /** Epoch milliseconds for relative times. Omit it and the age stays blank. */
  now?: number
  undone?: readonly string[]
  defaultUndone?: readonly string[]
  /** Lights a row as if its undo were pointed at. */
  pointedId?: string | null
  loading?: boolean
  error?: string
  title?: string
  onUndo?: (ids: string[]) => void
  onRedo?: (ids: string[]) => void
  onPoint?: (id: string | null) => void
  className?: string
  classNames?: AgentLedgerClassNames
  labels?: Partial<AgentLedgerLabels>
}

const agentLedgerLabels: AgentLedgerLabels = {
  title: "Change log",
  undo: "Undo",
  redo: "Redo",
  undoNamed: (summary) => `Undo ${summary}`,
  redoNamed: (summary) => `Redo ${summary}`,
  also: (count) => (count === 1 ? "Also reverts 1 later change" : `Also reverts ${count} later changes`),
  stays: (count) => (count === 1 ? "1 later change stays" : `${count} later changes stay`),
  staysFlag: "Stays",
  empty: "No changes yet.",
  loading: "Loading the change log",
  to: "to",
  age: (minutes) => {
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  },
}

export function ledgerAgeMinutes(at: number, now: number) {
  if (!Number.isFinite(at) || !Number.isFinite(now)) return 0
  return Math.max(0, Math.round((now - at) / 60000))
}

export function ledgerImpact(
  changes: readonly Pick<LedgerChange, "id" | "reversible" | "follows">[],
  rootId: string,
): LedgerImpact {
  const known = new Set(changes.map((change) => change.id))
  const children = new Map<string, string[]>()
  for (const change of changes) {
    for (const parent of change.follows ?? []) {
      const list = children.get(parent) ?? []
      list.push(change.id)
      children.set(parent, list)
    }
  }
  const reversible = new Map(changes.map((change) => [change.id, change.reversible !== false]))
  const revert: string[] = []
  const stays: string[] = []
  const seen = new Set<string>()

  const visit = (id: string, blocked: boolean) => {
    if (seen.has(id) || !known.has(id)) return
    seen.add(id)
    const canRevert = reversible.get(id) !== false
    if (id === rootId) {
      if (canRevert) revert.push(id)
    } else if (blocked || !canRevert) {
      stays.push(id)
    } else {
      revert.push(id)
    }
    const nextBlocked = id === rootId ? !canRevert : blocked || !canRevert
    for (const child of children.get(id) ?? []) visit(child, nextBlocked)
  }

  visit(rootId, false)
  return { revert, stays }
}

function resolveLabels(partial?: Partial<AgentLedgerLabels>): AgentLedgerLabels {
  return { ...agentLedgerLabels, ...partial }
}

export function AgentLedger<TMeta = unknown>({
  changes = [],
  agent,
  now,
  undone: undoneProp,
  defaultUndone = [],
  pointedId,
  loading = false,
  error,
  title,
  onUndo,
  onRedo,
  onPoint,
  className,
  classNames,
  labels: labelOverrides,
}: AgentLedgerProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [internalUndone, setInternalUndone] = React.useState<string[]>(() => [...defaultUndone])
  const [hoverId, setHoverId] = React.useState<string | null>(null)
  const undone = undoneProp ?? internalUndone
  const undoneSet = React.useMemo(() => new Set(undone), [undone])
  const pointed = pointedId !== undefined ? pointedId : hoverId
  const impact = pointed ? ledgerImpact(changes, pointed) : null
  const ordered = React.useMemo(() => {
    return changes.map((change, index) => ({ change, index })).sort((a, b) => b.change.at - a.change.at || a.index - b.index)
  }, [changes])

  function point(id: string | null) {
    if (pointedId === undefined) setHoverId(id)
    onPoint?.(id)
  }

  function undo(ids: string[]) {
    if (undoneProp === undefined) {
      setInternalUndone((current) => [...new Set([...current, ...ids])])
    }
    onUndo?.(ids)
  }

  function redo(ids: string[]) {
    if (undoneProp === undefined) {
      const drop = new Set(ids)
      setInternalUndone((current) => current.filter((id) => !drop.has(id)))
    }
    onRedo?.(ids)
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-baseline gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        {agent ? <p className="text-xs text-muted-foreground">{agent}</p> : null}
      </header>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error && changes.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : ordered.length === 0 ? (
        <p className={cn("text-muted-foreground", classNames?.empty)}>{labels.empty}</p>
      ) : (
        <ol aria-label={heading} className="flex flex-col gap-2">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          {ordered.map(({ change }) => {
            const isUndone = undoneSet.has(change.id)
            const chain = ledgerImpact(changes, change.id)
            const lit = impact?.revert.includes(change.id)
            const stuck = impact?.stays.includes(change.id)
            const extra = Math.max(0, chain.revert.length - 1)
            const canUndo = change.reversible !== false && !isUndone
            return (
              <li
                key={change.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-lg border border-border px-2 py-2",
                  isUndone && "opacity-60",
                  lit && "bg-primary/5",
                  stuck && "bg-chart-4/10",
                  classNames?.row,
                )}
              >
                <div className={cn("min-w-0", classNames?.change)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{change.system}</Badge>
                    {now != null ? (
                      <span className="text-xs text-muted-foreground">{labels.age(ledgerAgeMinutes(change.at, now))}</span>
                    ) : null}
                    {stuck ? <Badge variant="outline">{labels.staysFlag}</Badge> : null}
                  </div>
                  <p className={cn("mt-1 font-medium", isUndone && "line-through")}>{change.summary}</p>
                  {change.before != null || change.after != null ? (
                    <p className="mt-1 text-xs">
                      {change.before != null ? <span className="text-muted-foreground line-through">{change.before}</span> : null}
                      {change.before != null && change.after != null ? (
                        <>
                          <span className="sr-only"> {labels.to} </span>
                          <span aria-hidden="true"> → </span>
                        </>
                      ) : null}
                      {change.after != null ? <span>{change.after}</span> : null}
                    </p>
                  ) : null}
                  {change.note ? <p className="mt-1 text-xs text-muted-foreground">{change.note}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {canUndo ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={labels.undoNamed(change.summary)}
                      onClick={() => undo(chain.revert)}
                      onFocus={() => point(change.id)}
                      onBlur={() => point(null)}
                      onPointerEnter={() => point(change.id)}
                      onPointerLeave={() => point(null)}
                    >
                      <Undo2 aria-hidden="true" />
                      {labels.undo}
                    </Button>
                  ) : null}
                  {isUndone ? (
                    <Button type="button" size="sm" variant="ghost" aria-label={labels.redoNamed(change.summary)} onClick={() => redo(chain.revert)}>
                      <RotateCcw aria-hidden="true" />
                      {labels.redo}
                    </Button>
                  ) : null}
                  {canUndo && extra > 0 ? <span className="max-w-36 text-end text-xs text-muted-foreground">{labels.also(extra)}</span> : null}
                  {canUndo && chain.stays.length > 0 ? (
                    <span className="max-w-36 text-end text-xs text-muted-foreground">{labels.stays(chain.stays.length)}</span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
