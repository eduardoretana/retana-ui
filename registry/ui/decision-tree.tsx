"use client"

/**
 * A fork the agent will not take alone. Clean-room reading of a public
 * behavior description: each option shows what would follow, a risky one is
 * marked, the agent's preference is marked, and a person picks the path or
 * writes another. No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type DecisionOption<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  risk?: "low" | "high"
  /** The agent would take this one. A person still decides. */
  preferred?: boolean
  /** Fork to show after this option is taken. */
  nextId?: string
  meta?: TMeta
}

export type DecisionFork<TMeta = unknown> = {
  id: string
  prompt: string
  detail?: string
  options: readonly DecisionOption<TMeta>[]
}

export type DecisionChoice = {
  forkId: string
  optionId?: string
  custom?: string
}

export type DecisionTreeLabels = {
  title: string
  waiting: (count: number) => string
  done: string
  preferred: string
  risk: Record<"low" | "high", string>
  path: string
  choose: (title: string) => string
  custom: string
  customNamed: string
  write: string
  empty: string
  loading: string
  chose: (title: string) => string
  wrote: (text: string) => string
}

export type DecisionTreeClassNames = {
  root?: string
  option?: string
}

export type DecisionTreeProps<TMeta = unknown> = {
  forks?: readonly DecisionFork<TMeta>[]
  /** Choices already on the path, in order. */
  path?: readonly DecisionChoice[]
  loading?: boolean
  error?: string
  title?: string
  onChoose?: (forkId: string, optionId: string) => void
  onCustom?: (forkId: string, text: string) => void
  className?: string
  classNames?: DecisionTreeClassNames
  labels?: Partial<DecisionTreeLabels>
}

const treeLabels: DecisionTreeLabels = {
  title: "Which way",
  waiting: (count) => (count === 1 ? "1 fork open" : `${count} forks open`),
  done: "Path chosen",
  preferred: "The agent would pick this",
  risk: { low: "Low stakes", high: "Hard to undo" },
  path: "Path so far",
  choose: (title) => `Choose “${title}”`,
  custom: "Write another way",
  customNamed: "Another way",
  write: "Use this wording",
  empty: "Nothing is waiting on a decision.",
  loading: "Loading the forks",
  chose: (title) => `Chose “${title}”`,
  wrote: (text) => `Wrote “${text}”`,
}

function resolveLabels(partial?: Partial<DecisionTreeLabels>): DecisionTreeLabels {
  return { ...treeLabels, ...partial, risk: { ...treeLabels.risk, ...partial?.risk } }
}

export function openFork(forks: readonly DecisionFork[], path: readonly DecisionChoice[]) {
  const byId = new Map(forks.map((fork) => [fork.id, fork]))
  let current: DecisionFork | undefined = forks[0]
  for (const choice of path) {
    if (!current || choice.forkId !== current.id) break
    if (choice.custom) return null
    const option = current.options.find((item) => item.id === choice.optionId)
    if (!option?.nextId) return null
    current = byId.get(option.nextId)
  }
  return current ?? null
}

export function DecisionTree<TMeta = unknown>({
  forks = [],
  path = [],
  loading = false,
  error,
  title,
  onChoose,
  onCustom,
  className,
  classNames,
  labels: labelOverrides,
}: DecisionTreeProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const current = openFork(forks, path)
  const byId = new Map(forks.map((fork) => [fork.id, fork]))
  const [draft, setDraft] = React.useState("")
  const [live, setLive] = React.useState("")

  const trail = path.flatMap((choice) => {
    const fork = byId.get(choice.forkId)
    if (!fork) return []
    if (choice.custom) return [{ id: `${choice.forkId}-custom`, title: choice.custom }]
    const option = fork.options.find((item) => item.id === choice.optionId)
    return option ? [{ id: option.id, title: option.title }] : []
  })

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
        <Badge variant="secondary">{current ? labels.waiting(1) : forks.length > 0 ? labels.done : labels.waiting(0)}</Badge>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-28 w-full motion-reduce:animate-none" />
        </div>
      ) : error && forks.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : forks.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          {trail.length > 0 ? (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">{labels.path}</h3>
              <ol className="mt-1 flex flex-col gap-1">
                {trail.map((step, index) => (
                  <li key={step.id} className="text-sm">
                    {index + 1}. {step.title}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {current ? (
            <div>
              <h3 className="font-medium">{current.prompt}</h3>
              {current.detail ? <p className="mt-1 text-xs text-muted-foreground">{current.detail}</p> : null}
              <div role="radiogroup" aria-label={current.prompt} className="mt-2 flex flex-col gap-2">
                {current.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    className={cn(
                      "rounded-lg border border-border px-3 py-2 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      classNames?.option,
                    )}
                    aria-label={labels.choose(option.title)}
                    onClick={() => {
                      onChoose?.(current.id, option.id)
                      setLive(labels.chose(option.title))
                    }}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{option.title}</span>
                      {option.preferred ? <Badge variant="secondary">{labels.preferred}</Badge> : null}
                      {option.risk ? <Badge variant={option.risk === "high" ? "destructive" : "outline"}>{labels.risk[option.risk]}</Badge> : null}
                    </span>
                    {option.detail ? <span className="mt-1 block text-xs text-muted-foreground">{option.detail}</span> : null}
                  </button>
                ))}
              </div>
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const text = draft.trim()
                  if (!text) return
                  onCustom?.(current.id, text)
                  setLive(labels.wrote(text))
                  setDraft("")
                }}
              >
                <Input aria-label={labels.customNamed} value={draft} placeholder={labels.custom} onChange={(event) => setDraft(event.target.value)} className="h-8 max-w-sm" />
                <Button type="submit" size="sm" variant="outline">
                  {labels.write}
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-muted-foreground">{labels.done}</p>
          )}
        </div>
      )}
    </section>
  )
}
