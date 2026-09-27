"use client"

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type PlanStep = {
  id: string
  title: string
  detail?: string
}

export type PlanStatus = "proposed" | "approved" | "rejected"

export type PlanCardProps = {
  title?: string
  summary?: string
  steps: readonly PlanStep[]
  status?: PlanStatus
  onApprove?: () => void
  onReject?: () => void
  onEdit?: (steps: PlanStep[]) => void
  approveLabel?: string
  rejectLabel?: string
  editLabel?: string
  saveLabel?: string
  cancelLabel?: string
  approvedLabel?: string
  rejectedLabel?: string
  className?: string
}

export function PlanCard({
  title = "Proposed plan",
  summary,
  steps,
  status = "proposed",
  onApprove,
  onReject,
  onEdit,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  editLabel = "Edit",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  approvedLabel = "Approved",
  rejectedLabel = "Rejected",
  className,
}: PlanCardProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(() => steps.map((step) => ({ ...step })))
  const locked = status !== "proposed"

  return (
    <section
      data-slot="plan-card"
      data-status={status}
      className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {summary ? <p className="mt-1 text-sm text-muted-foreground">{summary}</p> : null}
        </div>
        {status === "approved" ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{approvedLabel}</span>
        ) : null}
        {status === "rejected" ? (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{rejectedLabel}</span>
        ) : null}
      </header>
      <ol className="flex flex-col gap-3">
        {(editing ? draft : steps).map((step, index) => (
          <li key={step.id} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  value={draft[index]?.title ?? ""}
                  aria-label={`${editLabel} ${index + 1}`}
                  onChange={(event) => {
                    const next = draft.slice()
                    next[index] = { ...next[index], title: event.target.value }
                    setDraft(next)
                  }}
                  className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <p className="text-sm">{step.title}</p>
              )}
              {step.detail && !editing ? <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      {locked ? null : editing ? (
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onEdit?.(draft)
              setEditing(false)
            }}
          >
            {saveLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onReject}>
            <X />
            {rejectLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(steps.map((step) => ({ ...step })))
              setEditing(true)
            }}
          >
            <Pencil />
            {editLabel}
          </Button>
          <Button type="button" size="sm" onClick={onApprove}>
            <Check />
            {approveLabel}
          </Button>
        </div>
      )}
    </section>
  )
}
