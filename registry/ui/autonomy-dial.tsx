"use client"

/**
 * How much an agent may do without asking. Clean-room reading of a public
 * behavior description: three stops, and each action either runs or waits,
 * with a lock that always asks. No Affect source, sample data, icons, or
 * assets were copied.
 */

import * as React from "react"
import { Lock, LockOpen } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const AUTONOMY_LEVELS = [0, 1, 2] as const
export const ACTION_RISKS = ["safe", "guarded", "destructive"] as const

export type AutonomyLevel = (typeof AUTONOMY_LEVELS)[number]
export type ActionRisk = (typeof ACTION_RISKS)[number]

export type AutonomyAction<TMeta = unknown> = {
  id: string
  label: string
  detail?: string
  risk: ActionRisk
  meta?: TMeta
}

export type AutonomyDialLabels = {
  title: string
  subtitle: string
  group: string
  level: (level: AutonomyLevel) => string
  levelDetail: (level: AutonomyLevel) => string
  runs: string
  asks: string
  lock: (label: string) => string
  unlock: (label: string) => string
  risk: (risk: ActionRisk) => string
  summary: (runs: number, asks: number) => string
  none: string
  empty: string
  loading: string
  changed: (level: AutonomyLevel, runs: number, asks: number) => string
}

export type AutonomyDialClassNames = {
  root?: string
  level?: string
  action?: string
  group?: string
}

export type AutonomyDialProps<TMeta = unknown> = {
  actions?: readonly AutonomyAction<TMeta>[]
  level?: AutonomyLevel
  defaultLevel?: AutonomyLevel
  pinned?: readonly string[]
  defaultPinned?: readonly string[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  onLevelChange?: (level: AutonomyLevel) => void
  onPinnedChange?: (pinned: string[]) => void
  className?: string
  classNames?: AutonomyDialClassNames
  labels?: Partial<AutonomyDialLabels>
}

const autonomyDialLabels: AutonomyDialLabels = {
  title: "What it may do alone",
  subtitle: "Safe work can run. Locks always stop to ask.",
  group: "Autonomy",
  level: (level) => ["Ask every time", "Ask unless it is safe", "Act, except locks"][level] ?? "Ask every time",
  levelDetail: (level) =>
    [
      "Every action waits for a person.",
      "Safe actions run. Guarded and destructive ones ask.",
      "Actions run on their own, except the ones you lock.",
    ][level] ?? "Every action waits for a person.",
  runs: "Runs on its own",
  asks: "Stops to ask",
  lock: (label) => `Always ask before ${label}`,
  unlock: (label) => `Let ${label} follow the dial`,
  risk: (risk) => ({ safe: "Safe", guarded: "Guarded", destructive: "Destructive" })[risk],
  summary: (runs, asks) => `${runs} run alone, ${asks} ask first`,
  none: "None in this group",
  empty: "This agent has no actions to govern.",
  loading: "Loading permissions",
  changed: (level, runs, asks) => `${["Ask every time", "Ask unless it is safe", "Act, except locks"][level]}. ${runs} run alone, ${asks} ask first.`,
}

export function actionAsksFirst(
  action: Pick<AutonomyAction, "id" | "risk">,
  level: AutonomyLevel,
  pinned: readonly string[],
) {
  if (pinned.includes(action.id)) return true
  if (level <= 0) return true
  if (level >= 2) return false
  return action.risk !== "safe"
}

function resolveLabels(partial?: Partial<AutonomyDialLabels>): AutonomyDialLabels {
  return { ...autonomyDialLabels, ...partial }
}

export function AutonomyDial<TMeta = unknown>({
  actions = [],
  level: levelProp,
  defaultLevel = 1,
  pinned: pinnedProp,
  defaultPinned = [],
  title,
  subtitle,
  loading = false,
  error,
  onLevelChange,
  onPinnedChange,
  className,
  classNames,
  labels: labelOverrides,
}: AutonomyDialProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const detailId = React.useId()
  const reduced = useReducedMotion()
  const levelButtons = React.useRef<Partial<Record<AutonomyLevel, HTMLButtonElement | null>>>({})
  const [internalLevel, setInternalLevel] = React.useState<AutonomyLevel>(defaultLevel)
  const [internalPinned, setInternalPinned] = React.useState<string[]>(() => [...defaultPinned])
  const [live, setLive] = React.useState("")
  const level = levelProp ?? internalLevel
  const pinned = pinnedProp ?? internalPinned
  const heading = title ?? labels.title
  const runs = actions.filter((action) => !actionAsksFirst(action, level, pinned))
  const asks = actions.filter((action) => actionAsksFirst(action, level, pinned))

  function choose(next: AutonomyLevel, focus = false) {
    if (levelProp === undefined) setInternalLevel(next)
    onLevelChange?.(next)
    const nextRuns = actions.filter((action) => !actionAsksFirst(action, next, pinned)).length
    setLive(labels.changed(next, nextRuns, actions.length - nextRuns))
    if (focus) levelButtons.current[next]?.focus()
  }

  function togglePin(id: string) {
    const next = pinned.includes(id) ? pinned.filter((item) => item !== id) : [...pinned, id]
    if (pinnedProp === undefined) setInternalPinned(next)
    onPinnedChange?.(next)
    const nextRuns = actions.filter((action) => !actionAsksFirst(action, level, next)).length
    setLive(labels.changed(level, nextRuns, actions.length - nextRuns))
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      data-reduced-motion={reduced ? "true" : "false"}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header>
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle ?? labels.subtitle}</p>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error && actions.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div role="radiogroup" aria-label={labels.group} aria-describedby={detailId} className="grid gap-1 sm:grid-cols-3">
            {AUTONOMY_LEVELS.map((option) => {
              const selected = option === level
              return (
                <button
                  key={option}
                  ref={(node) => {
                    levelButtons.current[option] = node
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-start text-xs transition-colors motion-reduce:transition-none",
                    selected ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    classNames?.level,
                  )}
                  onClick={() => choose(option)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowUp" && event.key !== "ArrowDown") return
                    event.preventDefault()
                    const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
                    const index = AUTONOMY_LEVELS.indexOf(level)
                    const next = AUTONOMY_LEVELS[(index + (forward ? 1 : AUTONOMY_LEVELS.length - 1)) % AUTONOMY_LEVELS.length]!
                    choose(next, true)
                  }}
                >
                  {labels.level(option)}
                </button>
              )
            })}
          </div>
          <p id={detailId} className="text-xs text-muted-foreground">
            {labels.levelDetail(level)} {labels.summary(runs.length, asks.length)}
          </p>
          {actions.length === 0 ? (
            <p className="text-muted-foreground">{labels.empty}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionGroup title={labels.runs} actions={runs} pinned={pinned} labels={labels} className={classNames?.group} actionClassName={classNames?.action} onToggle={togglePin} />
              <ActionGroup title={labels.asks} actions={asks} pinned={pinned} labels={labels} className={classNames?.group} actionClassName={classNames?.action} onToggle={togglePin} />
            </div>
          )}
        </>
      )}
    </section>
  )
}

function ActionGroup({
  title,
  actions,
  pinned,
  labels,
  className,
  actionClassName,
  onToggle,
}: {
  title: string
  actions: readonly AutonomyAction[]
  pinned: readonly string[]
  labels: AutonomyDialLabels
  className?: string
  actionClassName?: string
  onToggle: (id: string) => void
}) {
  const labelId = React.useId()
  return (
    <section aria-labelledby={labelId} className={cn("flex flex-col gap-2 rounded-lg bg-muted/40 p-2", className)}>
      <h3 id={labelId} className="text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      {actions.length === 0 ? <p className="text-xs text-muted-foreground">{labels.none}</p> : null}
      <ul className="flex flex-col gap-2">
        {actions.map((action) => {
          const locked = pinned.includes(action.id)
          return (
            <li key={action.id} className={cn("flex items-start gap-2 rounded-md bg-card px-2 py-2", actionClassName)}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{action.label}</p>
                {action.detail ? <p className="text-xs text-muted-foreground">{action.detail}</p> : null}
                <p className={cn("text-xs", action.risk === "destructive" ? "text-destructive" : "text-muted-foreground")}>{labels.risk(action.risk)}</p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant={locked ? "secondary" : "ghost"}
                aria-pressed={locked}
                aria-label={locked ? labels.unlock(action.label) : labels.lock(action.label)}
                onClick={() => onToggle(action.id)}
              >
                {locked ? <Lock aria-hidden="true" /> : <LockOpen aria-hidden="true" />}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
