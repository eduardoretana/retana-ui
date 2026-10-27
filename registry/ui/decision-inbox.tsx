"use client"

/**
 * Open calls that need one of two answers. Clean-room reading of a public
 * behavior description: an answered call confirms and can fold away.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type DecisionChoice = {
  id: string
  label: string
}

export type DecisionItem<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  agent?: string
  choices: readonly DecisionChoice[]
  /** Set when a person already answered. */
  answerId?: string | null
  meta?: TMeta
}

export type DecisionInboxLabels = {
  title: string
  open: (count: number) => string
  empty: string
  loading: string
  answered: (choice: string) => string
  dismiss: string
  dismissNamed: (title: string) => string
  choose: (title: string, choice: string) => string
  from: (agent: string) => string
}

export type DecisionInboxClassNames = {
  root?: string
  item?: string
  choice?: string
}

export type DecisionInboxProps<TMeta = unknown> = {
  items?: readonly DecisionItem<TMeta>[]
  title?: string
  loading?: boolean
  error?: string
  onAnswer?: (id: string, choiceId: string) => void
  onDismiss?: (id: string) => void
  className?: string
  classNames?: DecisionInboxClassNames
  labels?: Partial<DecisionInboxLabels>
}

const decisionInboxLabels: DecisionInboxLabels = {
  title: "Open calls",
  open: (count) => (count === 1 ? "1 still open" : `${count} still open`),
  empty: "Nothing is waiting on you.",
  loading: "Loading open calls",
  answered: (choice) => `Answered: ${choice}`,
  dismiss: "Dismiss",
  dismissNamed: (title) => `Dismiss “${title}”`,
  choose: (title, choice) => `${choice} for “${title}”`,
  from: (agent) => `From ${agent}`,
}

function resolveLabels(partial?: Partial<DecisionInboxLabels>): DecisionInboxLabels {
  return { ...decisionInboxLabels, ...partial }
}

export function openDecisionCount(items: readonly Pick<DecisionItem, "id" | "answerId">[]) {
  return items.filter((item) => !item.answerId).length
}

export function DecisionInbox<TMeta = unknown>({
  items = [],
  title,
  loading = false,
  error,
  onAnswer,
  onDismiss,
  className,
  classNames,
  labels: labelOverrides,
}: DecisionInboxProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const open = openDecisionCount(items)
  const [live, setLive] = React.useState("")

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
        <Badge variant="secondary">{labels.open(open)}</Badge>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error && items.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          {items.map((item) => {
            const answer = item.choices.find((choice) => choice.id === item.answerId)
            return (
              <li key={item.id} className={cn("rounded-lg border border-border px-3 py-2", classNames?.item)}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.agent ? <p className="text-xs text-muted-foreground">{labels.from(item.agent)}</p> : null}
                </div>
                {item.detail && !answer ? <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p> : null}
                {answer ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Check aria-hidden="true" className="size-4 text-primary" />
                    <p>{labels.answered(answer.label)}</p>
                    {onDismiss ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="ms-auto"
                        aria-label={labels.dismissNamed(item.title)}
                        onClick={() => onDismiss(item.id)}
                      >
                        {labels.dismiss}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.choices.map((choice) => (
                      <Button
                        key={choice.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        className={classNames?.choice}
                        aria-label={labels.choose(item.title, choice.label)}
                        onClick={() => {
                          onAnswer?.(item.id, choice.id)
                          setLive(labels.answered(choice.label))
                        }}
                      >
                        {choice.label}
                      </Button>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
