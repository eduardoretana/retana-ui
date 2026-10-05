"use client"

/** Clean-room risk review. The chosen action grows a check; scope can be approved. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatHours, shareRatio } from "@/registry/retana/lib/proposal"

export type RiskAction = { id: string; label: string }

export type ScopeRow = {
  id: string
  asked: string
  proposed: string
  accepted: boolean
}

export type ProposalRisksProps = {
  resolvedTitle: string
  resolvedBody: string
  openTitle: string
  openBody: string
  requestedWeeks: number
  historicalWeeks: number
  requestedLabel?: string
  historicalLabel?: string
  weeksSuffix?: string
  actions: readonly RiskAction[]
  selectedAction?: string
  onSelectAction?: (id: string) => void
  rows: readonly ScopeRow[]
  askedLabel?: string
  proposedLabel?: string
  approveLabel?: string
  onApprove?: () => void
  approved?: boolean
  approvedLabel?: string
  className?: string
}

export function ProposalRisks({
  resolvedTitle,
  resolvedBody,
  openTitle,
  openBody,
  requestedWeeks,
  historicalWeeks,
  requestedLabel = "Requested",
  historicalLabel = "Historical",
  weeksSuffix = "wk",
  actions,
  selectedAction,
  onSelectAction,
  rows,
  askedLabel = "Client asked",
  proposedLabel = "Proposed",
  approveLabel = "Approve scope",
  onApprove,
  approved = false,
  approvedLabel = "Scope approved",
  className,
}: ProposalRisksProps) {
  const reduced = !!useReducedMotion()
  const max = Math.max(requestedWeeks, historicalWeeks, 1)
  return (
    <div data-slot="proposal-risks" className={cn("grid min-w-0 gap-4", className)}>
      <article className="rounded-xl border border-border bg-muted/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Check className="size-4 text-primary" />
          {resolvedTitle}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedBody}</p>
      </article>
      <article className="rounded-xl border border-border bg-card p-3">
        <h2 className="text-sm font-medium">{openTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{openBody}</p>
        <div className="mt-3 grid gap-2" aria-label={`${requestedLabel} / ${historicalLabel}`}>
          <WeekBar label={requestedLabel} weeks={requestedWeeks} width={shareRatio(requestedWeeks, max)} tone="destructive" suffix={weeksSuffix} />
          <WeekBar label={historicalLabel} weeks={historicalWeeks} width={shareRatio(historicalWeeks, max)} tone="primary" suffix={weeksSuffix} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => {
            const chosen = action.id === selectedAction
            return (
              <Button
                key={action.id}
                type="button"
                size="sm"
                variant={chosen ? "default" : "outline"}
                aria-pressed={chosen}
                onClick={() => onSelectAction?.(action.id)}
              >
                <AnimatePresence initial={false}>
                  {chosen ? (
                    <motion.span
                      key="check"
                      initial={reduced ? false : { width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.2 }}
                      className="inline-flex overflow-hidden"
                    >
                      <Check className="size-4" />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                {action.label}
              </Button>
            )
          })}
        </div>
      </article>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-medium">{askedLabel}</th>
              <th className="px-3 py-2 text-start font-medium">{proposedLabel}</th>
              <th className="px-3 py-2 text-center font-medium">
                <span className="sr-only">{approvedLabel}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2 wrap-break-word">{row.asked}</td>
                <td className="px-3 py-2 wrap-break-word">{row.proposed}</td>
                <td className="px-3 py-2 text-center">
                  {row.accepted ? <Check className="mx-auto size-4 text-primary" aria-label={approvedLabel} /> : <X className="mx-auto size-4 text-destructive" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <Button type="button" onClick={onApprove} disabled={approved}>
          {approved ? approvedLabel : approveLabel}
        </Button>
      </div>
    </div>
  )
}

function WeekBar({
  label,
  weeks,
  width,
  tone,
  suffix,
}: {
  label: string
  weeks: number
  width: number
  tone: "destructive" | "primary"
  suffix: string
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs">
      <span className="truncate text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone === "destructive" ? "bg-destructive" : "bg-primary")} style={{ width: `${width * 100}%` }} />
      </div>
      <span className="text-end tabular-nums">
        {formatHours(weeks)} {suffix}
      </span>
    </div>
  )
}
