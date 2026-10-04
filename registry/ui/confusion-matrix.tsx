"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/results/evaluation-metrics-dashboard/evaluation-metrics-dashboard.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export type ConfusionMatrixProps = {
  labels: string[]
  counts: number[][]
  className?: string
}

export function ConfusionMatrix({ labels, counts, className }: ConfusionMatrixProps) {
  const [percent, setPercent] = React.useState(false)
  const [active, setActive] = React.useState<{ row: number; column: number } | null>(null)
  const total = counts.reduce((sum, row) => sum + row.reduce((inner, value) => inner + value, 0), 0)
  const max = Math.max(1, ...counts.flat())

  const move = (row: number, column: number, key: string) => {
    const last = labels.length - 1
    if (key === "ArrowRight") setActive({ row, column: Math.min(last, column + 1) })
    if (key === "ArrowLeft") setActive({ row, column: Math.max(0, column - 1) })
    if (key === "ArrowDown") setActive({ row: Math.min(last, row + 1), column })
    if (key === "ArrowUp") setActive({ row: Math.max(0, row - 1), column })
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <button
        type="button"
        className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-pressed={percent}
        onClick={() => setPercent((value) => !value)}
      >
        {percent ? "Show counts" : "Show percent"}
      </button>
      <div className="overflow-x-auto">
        <div role="grid" aria-label="Confusion matrix" className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${labels.length}, minmax(2.5rem, 1fr))` }}>
          <span />
          {labels.map((label) => (
            <span key={`col-${label}`} className="text-center text-xs text-muted-foreground">
              {label}
            </span>
          ))}
          {labels.map((label, row) => (
            <React.Fragment key={label}>
              <span className="pr-2 text-xs text-muted-foreground">{label}</span>
              {labels.map((predicted, column) => {
                const count = counts[row]?.[column] ?? 0
                const share = total > 0 ? count / total : 0
                const intensity = Math.round((count / max) * 80)
                const selected = active?.row === row && active?.column === column
                return (
                  <button
                    key={`${label}-${predicted}`}
                    type="button"
                    role="gridcell"
                    tabIndex={selected || (!active && row === 0 && column === 0) ? 0 : -1}
                    aria-selected={selected}
                    className={cn("size-10 rounded-sm text-xs tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", row === column && "ring-1 ring-foreground/30")}
                    style={{ backgroundColor: `color-mix(in oklab, var(--primary) ${intensity}%, var(--background))` }}
                    onFocus={() => setActive({ row, column })}
                    onKeyDown={(event) => move(row, column, event.key)}
                    aria-label={`Actual ${label}, predicted ${predicted}: ${count} (${Math.round(share * 100)}%)`}
                  >
                    {percent ? `${Math.round(share * 100)}%` : count}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Confusion matrix</caption>
        <thead>
          <tr>
            <th>Actual</th>
            {labels.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, row) => (
            <tr key={label}>
              <th>{label}</th>
              {labels.map((predicted, column) => (
                <td key={predicted}>{counts[row]?.[column] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
