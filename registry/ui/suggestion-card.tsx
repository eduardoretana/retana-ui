"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { Check, MoreHorizontal, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { joinMeta } from "@/registry/retana/lib/dashboard-format"

export type SuggestionFact = { label: string; value: string }

export type SuggestionEvidence = {
  text: string
  href?: string
  label?: string
  onSelect?: () => void
}

export type SuggestionStep = { id: string; label: string }

export type SuggestionPerson = { name: string }

export type SuggestionCardClassNames = {
  root?: string
  title?: string
  body?: string
  facts?: string
  evidence?: string
}

export type SuggestionCardProps = {
  title: string
  suggestion: string
  status?: "suggested" | "confirmed" | "dismissed"
  variant?: "cause" | "action"
  source?: string
  confidence?: "high" | "medium" | "low"
  confidenceLabel?: string
  confirmedBy?: string
  confirmedAt?: string
  attribution?: string
  facts?: readonly SuggestionFact[]
  evidence?: SuggestionEvidence
  estimate?: string
  rationale?: string
  steps?: readonly SuggestionStep[]
  owners?: readonly SuggestionPerson[]
  /** accent fills the card with primary. default keeps the muted well. */
  surface?: "default" | "accent"
  fields?: readonly { id: string; label: string }[]
  confirmLabel?: string
  changeLabel?: string
  dismissLabel?: string
  undoLabel?: string
  actionLabel?: string
  onConfirm?: () => void
  onChange?: () => void
  onDismiss?: () => void
  onUndo?: () => void
  onAction?: () => void
  className?: string
  classNames?: SuggestionCardClassNames
}

const confidenceCopy = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" }

export function SuggestionCard({
  title,
  suggestion,
  status = "suggested",
  variant = "cause",
  source,
  confidence = "medium",
  confidenceLabel,
  confirmedBy,
  confirmedAt,
  attribution,
  facts = [],
  evidence,
  estimate,
  rationale,
  steps = [],
  owners = [],
  surface = "default",
  fields = [],
  confirmLabel = "Confirm",
  changeLabel = "Change",
  dismissLabel = "Dismiss",
  undoLabel = "Undo",
  actionLabel = "Create action",
  onConfirm,
  onChange,
  onDismiss,
  onUndo,
  onAction,
  className,
  classNames,
}: SuggestionCardProps) {
  const titleId = React.useId()
  const live = status === "confirmed" ? "Confirmed" : status === "dismissed" ? "Dismissed" : "Suggested"
  if (status === "dismissed") {
    return (
      <article data-slot="suggestion-card" data-status="dismissed" aria-labelledby={titleId} className={cn("flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2", className, classNames?.root)}>
        <p id={titleId} className="min-w-0 truncate text-sm">
          Dismissed: {suggestion}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onUndo}>
          {undoLabel}
        </Button>
        <span className="sr-only" aria-live="polite">{live}</span>
      </article>
    )
  }
  const heading = status === "confirmed" ? `Confirmed ${title}` : title
  const sub =
    status === "confirmed"
      ? joinMeta([confirmedBy ? `Confirmed by ${confirmedBy}` : null, confirmedAt])
      : source
  return (
    <article data-slot="suggestion-card" data-status={status} data-surface={surface} aria-labelledby={titleId} className={cn("@container rounded-2xl p-2 text-foreground", surface === "accent" ? "bg-primary text-primary-foreground" : "bg-muted", className, classNames?.root)}>
      <div className="flex flex-wrap items-start justify-between gap-2 px-3 pt-2 pb-3">
        <div className="min-w-0">
          <h3 id={titleId} className={cn("text-[15px] font-medium break-words", classNames?.title)}>{heading}</h3>
          {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {status === "confirmed" ? (
            <span className="inline-flex h-6 items-center rounded-full bg-chart-2/20 px-2 text-xs">Confirmed</span>
          ) : confidence ? (
            <span className="inline-flex h-6 items-center rounded-full bg-chart-3/15 px-2 text-xs">{confidenceLabel ?? confidenceCopy[confidence]}</span>
          ) : null}
          {estimate ? <span className="inline-flex h-6 items-center rounded-full bg-chart-2/20 px-2 text-xs">{estimate}</span> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${suggestion}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onChange?.()}>{changeLabel}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDismiss?.()}>{dismissLabel}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className={cn("rounded-xl bg-card p-4 text-card-foreground", classNames?.body)}>
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-chart-3/15 text-foreground" aria-hidden>
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-medium break-words">{suggestion}</p>
            <p className="text-xs text-muted-foreground">{attribution ?? "Suggested by the desk assistant. Confirm or change it."}</p>
          </div>
        </div>
        {rationale ? <p className="mt-3 text-sm text-muted-foreground">{rationale}</p> : null}
        {facts.length ? (
          <dl className={cn("mt-3 flex flex-col gap-1", classNames?.facts)}>
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">{fact.label}</dt>
                <dd className="text-end font-medium break-words">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {steps.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {steps.map((step) => (
              <li key={step.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-chart-2 text-foreground" aria-hidden>
                  <Check className="size-2.5" />
                </span>
                <span className="break-words">{step.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {evidence ? (
          <div className={cn("mt-3 flex items-start gap-2 rounded-lg bg-chart-3/15 p-3 text-sm", classNames?.evidence)}>
            <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              {evidence.text}{" "}
              {evidence.href || evidence.onSelect ? (
                <a
                  href={evidence.href ?? "#"}
                  className="font-medium underline-offset-2 hover:underline"
                  onClick={(event) => {
                    if (!evidence.onSelect) return
                    event.preventDefault()
                    evidence.onSelect()
                  }}
                >
                  {evidence.label ?? "View records"}
                </a>
              ) : null}
            </p>
          </div>
        ) : null}
        {owners.length ? <p className="mt-3 text-xs text-muted-foreground">{owners.map((owner) => owner.name).join(", ")}</p> : null}
        {fields.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((field) => (
              <span key={field.id} className="inline-flex max-w-full items-center rounded-full bg-card px-2 py-1 font-mono text-xs text-card-foreground">
                <span className="truncate">{field.label}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {variant === "action" || status === "confirmed" ? (
            <Button type="button" className="rounded-full" onClick={onAction} aria-label={`${actionLabel}: ${suggestion}`}>
              {actionLabel}
            </Button>
          ) : (
            <>
              <Button type="button" className="rounded-full" onClick={onConfirm} aria-label={`${confirmLabel}: ${suggestion}`}>
                {confirmLabel}
              </Button>
              <Button type="button" variant="secondary" className="rounded-full" onClick={onChange}>
                {changeLabel}
              </Button>
            </>
          )}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{live}: {suggestion}</span>
    </article>
  )
}
