"use client"

/** Clean-room similar-work picker. Cards select; the detail compares phases. */

import { cn } from "@/lib/utils"
import { formatHours, formatMoney, shareRatio } from "@/registry/retana/lib/proposal"

export type SimilarPhase = {
  id: string
  label: string
  quoted: number
  actual: number
}

export type SimilarProject = {
  id: string
  name: string
  client: string
  revenue: number
  weeks: number
  hours: number
  /** 0–1 */
  match: number
  phases: readonly SimilarPhase[]
}

export type SimilarColumn = {
  id: string
  title: string
  items: readonly string[]
}

export type ProposalSimilarProps = {
  projects: readonly SimilarProject[]
  value?: string
  onValueChange?: (id: string) => void
  comparison: readonly SimilarColumn[]
  locale?: string
  currency?: string
  revenueLabel?: string
  weeksLabel?: string
  hoursLabel?: string
  matchLabel?: string
  quotedLabel?: string
  actualLabel?: string
  className?: string
}

export function ProposalSimilar({
  projects,
  value,
  onValueChange,
  comparison,
  locale = "en-US",
  currency = "USD",
  revenueLabel = "Revenue",
  weeksLabel = "Weeks",
  hoursLabel = "Hours",
  matchLabel = "Match",
  quotedLabel = "Quoted",
  actualLabel = "Actual",
  className,
}: ProposalSimilarProps) {
  const selected = projects.find((project) => project.id === value) ?? projects[0]
  return (
    <div data-slot="proposal-similar" className={cn("grid min-w-0 gap-4", className)}>
      <div role="radiogroup" aria-label={matchLabel} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const active = project.id === selected?.id
          return (
            <button
              key={project.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onValueChange?.(project.id)}
              className={cn(
                "min-w-0 rounded-xl border bg-card p-3 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-primary" : "border-border",
              )}
            >
              <p className="truncate text-sm font-medium">{project.name}</p>
              <p className="truncate text-xs text-muted-foreground">{project.client}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">{revenueLabel}</dt>
                  <dd className="tabular-nums">{formatMoney(project.revenue, locale, currency)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{weeksLabel}</dt>
                  <dd className="tabular-nums">{formatHours(project.weeks, locale)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{hoursLabel}</dt>
                  <dd className="tabular-nums">{formatHours(project.hours, locale)}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{matchLabel}</span>
                  <span className="tabular-nums">{Math.round(project.match * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(project.match * 100)}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {selected ? (
        <section aria-label={selected.name} className="rounded-xl border border-border p-3">
          <h2 className="text-sm font-medium">{selected.name}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {selected.phases.map((phase) => {
              const max = Math.max(phase.quoted, phase.actual, 1)
              return (
                <li key={phase.id}>
                  <p className="text-xs text-muted-foreground">{phase.label}</p>
                  <div className="mt-1 grid gap-1">
                    <Bar label={quotedLabel} value={phase.quoted} width={shareRatio(phase.quoted, max)} tone="muted" locale={locale} />
                    <Bar label={actualLabel} value={phase.actual} width={shareRatio(phase.actual, max)} tone="primary" locale={locale} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {comparison.map((column) => (
          <section key={column.id} className="min-w-0 rounded-xl border border-border p-3">
            <h2 className="text-sm font-medium">{column.title}</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
              {column.items.map((item) => (
                <li key={item} className="wrap-break-word">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function Bar({
  label,
  value,
  width,
  tone,
  locale,
}: {
  label: string
  value: number
  width: number
  tone: "muted" | "primary"
  locale: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone === "primary" ? "bg-primary" : "bg-foreground/30")}
          style={{ width: `${Math.round(width * 100)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-end tabular-nums">{formatHours(value, locale)}</span>
    </div>
  )
}
