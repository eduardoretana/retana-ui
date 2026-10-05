"use client"

/** Clean-room scope checklist. Rows stagger in; effort is a donut of included hours. */

import * as React from "react"
import { ChevronDown, Minus } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  formatHours,
  phaseShares,
  scopeHours,
  type ScopeOrigin,
  type ScopePhase,
} from "@/registry/retana/lib/proposal"
import { DonutChart } from "@/registry/retana/ui/donut-chart"

export type ProposalScopeProps = {
  phases: readonly ScopePhase[]
  onToggle: (taskId: string) => void
  exclusions: readonly { id: string; label: string }[]
  exclusionsTitle?: string
  effortLabel?: string
  originLabels?: Partial<Record<ScopeOrigin, string>>
  locale?: string
  className?: string
}

const DEFAULT_ORIGIN: Record<ScopeOrigin, string> = {
  adapted: "Adapted",
  edited: "Edited",
  added: "Added from your answer",
}

export function ProposalScope({
  phases,
  onToggle,
  exclusions,
  exclusionsTitle = "Not included",
  effortLabel = "Effort",
  originLabels,
  locale = "en-US",
  className,
}: ProposalScopeProps) {
  const reduced = !!useReducedMotion()
  const labels = { ...DEFAULT_ORIGIN, ...originLabels }
  const shares = phaseShares(phases).filter((share) => share.value > 0)
  const total = scopeHours(phases)
  const delayOf = new Map(
    phases.flatMap((phase) => phase.tasks).map((task, index) => [task.id, reduced ? 0 : Math.min(0.1, 0.05 + index * 0.01)]),
  )

  return (
    <div data-slot="proposal-scope" className={cn("grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.7fr)]", className)}>
      <div className="grid min-w-0 gap-2">
        {phases.map((phase) => (
          <Collapsible key={phase.id} defaultOpen className="rounded-xl border border-border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm font-medium">
              <span className="min-w-0 truncate">{phase.title}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-border">
              <ul>
                {phase.tasks.map((task) => {
                  const delay = delayOf.get(task.id) ?? 0
                  return (
                    <motion.li
                      key={task.id}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduced ? 0 : 0.2, delay }}
                      className="flex min-w-0 items-center gap-3 px-3 py-2"
                    >
                      <Checkbox
                        checked={task.included}
                        onCheckedChange={() => onToggle(task.id)}
                        aria-label={task.title}
                        className="rounded-full"
                      />
                      <span className={cn("min-w-0 flex-1 text-sm wrap-break-word", !task.included && "text-muted-foreground line-through")}>
                        {task.title}
                      </span>
                      {task.origin ? (
                        <span className="hidden max-w-36 truncate rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
                          {labels[task.origin]}
                        </span>
                      ) : null}
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatHours(task.hours, locale)}h
                      </span>
                    </motion.li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      <div className="grid h-fit gap-4">
        <DonutChart
          data={shares.length ? shares : [{ key: "empty", label: effortLabel, value: 0 }]}
          label={effortLabel}
          totalLabel={formatHours(total, locale)}
          unit="h"
          size={180}
        />
        <section aria-label={exclusionsTitle}>
          <h2 className="text-sm font-medium">{exclusionsTitle}</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {exclusions.map((item) => (
              <li key={item.id} className="flex min-w-0 items-start gap-2 text-sm text-muted-foreground">
                <Minus className="mt-0.5 size-4 shrink-0" />
                <span className="wrap-break-word">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
