"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/tool-approval/tool-approval.tsx

import * as React from "react"
import { AlertTriangle, Check, Pencil, Plus, ShieldAlert, ShieldCheck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type ApprovalDecision = "approved" | "rejected"
export type ApprovalRisk = "low" | "medium" | "high"

export type ToolApprovalClassNames = {
  root?: string
  title?: string
  args?: string
  actions?: string
  receipt?: string
}

export type ToolApprovalProps = {
  toolName: string
  args?: Record<string, unknown>
  reason?: string
  risk?: ApprovalRisk
  decision?: ApprovalDecision | null
  defaultDecision?: ApprovalDecision | null
  onApprove?: () => void
  onDeny?: () => void
  onDecision?: (decision: ApprovalDecision) => void
  busy?: boolean
  alwaysAllow?: boolean
  onAlwaysAllowChange?: (value: boolean) => void
  hotkeys?: boolean
  title?: string
  approveLabel?: string
  denyLabel?: string
  /** Side-by-side change rows for a human gate. */
  changes?: readonly { id: string; kind: "add" | "edit"; title: string; detail?: string }[]
  versionLabel?: string
  choices?: readonly { id: string; label: string; checked: boolean; onCheckedChange?: (checked: boolean) => void; required?: boolean }[]
  hint?: string
  summary?: React.ReactNode
  className?: string
  classNames?: ToolApprovalClassNames
}

const CLAMP = 80

function ArgValue({ value }: { value: unknown }) {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  const [open, setOpen] = React.useState(false)
  const long = text.length > CLAMP
  return (
    <span className="min-w-0 font-mono text-foreground">
      {long && !open ? `${text.slice(0, CLAMP)}…` : text}
      {long ? (
        <button
          type="button"
          className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Show less" : "Show more"}
        </button>
      ) : null}
    </span>
  )
}

export function ToolApproval({
  toolName,
  args,
  reason,
  risk,
  decision: decisionProp,
  defaultDecision = null,
  onApprove,
  onDeny,
  onDecision,
  busy = false,
  alwaysAllow,
  onAlwaysAllowChange,
  hotkeys = false,
  title = "Approval needed",
  approveLabel = "Approve",
  denyLabel = "Deny",
  changes = [],
  versionLabel,
  choices = [],
  hint,
  summary,
  className,
  classNames,
}: ToolApprovalProps) {
  const titleId = React.useId()
  const liveId = React.useId()
  const receiptRef = React.useRef<HTMLParagraphElement>(null)
  const [internal, setInternal] = React.useState<ApprovalDecision | null>(defaultDecision)
  const decision = decisionProp !== undefined ? decisionProp : internal
  const entries = Object.entries(args ?? {})
  const blocked = choices.some((choice) => choice.required && !choice.checked)

  const decide = React.useCallback(
    (next: ApprovalDecision) => {
      if (busy || decision) return
      if (decisionProp === undefined) setInternal(next)
      onDecision?.(next)
      if (next === "approved") onApprove?.()
      else onDeny?.()
    },
    [busy, decision, decisionProp, onApprove, onDecision, onDeny],
  )

  React.useEffect(() => {
    if (!decision) return
    receiptRef.current?.focus()
  }, [decision])

  React.useEffect(() => {
    if (!hotkeys || decision) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        decide("rejected")
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        decide("approved")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [decide, decision, hotkeys])

  if (decision) {
    const approved = decision === "approved"
    return (
      <div
        role="group"
        aria-labelledby={titleId}
        className={cn("rounded-lg border border-border bg-card p-3 text-sm", className, classNames?.root)}
      >
        <p id={liveId} className="sr-only" aria-live="polite">
          {approved ? `${toolName} approved` : `${toolName} denied`}
        </p>
        <p
          id={titleId}
          ref={receiptRef}
          tabIndex={-1}
          className={cn("flex items-center gap-2 text-muted-foreground outline-none", classNames?.receipt)}
        >
          {approved ? <Check aria-hidden="true" className="size-4" /> : <X aria-hidden="true" className="size-4" />}
          <span>{approved ? "Approved" : "Denied"}</span>
          <span className="font-mono text-foreground">{toolName}</span>
        </p>
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-sm", className, classNames?.root)}
    >
      <div className="flex flex-col gap-1">
        <p id={titleId} className={cn("font-medium text-foreground", classNames?.title)}>
          {title}
        </p>
        <p className="truncate font-mono text-foreground">{toolName}</p>
        {reason ? <p className="text-muted-foreground">{reason}</p> : null}
        {risk ? (
          <p className={cn("flex items-center gap-1 text-xs", risk === "high" ? "text-destructive" : "text-muted-foreground")}>
            {risk === "high" ? <ShieldAlert aria-hidden="true" className="size-3.5" /> : <AlertTriangle aria-hidden="true" className="size-3.5" />}
            Risk {risk}
          </p>
        ) : null}
      </div>
      {summary}
      {changes.length > 0 ? (
        <div className="rounded-xl bg-muted p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Changes</p>
            {versionLabel ? <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px]">{versionLabel}</span> : null}
          </div>
          <ul className="flex flex-col gap-2">
            {changes.map((change) => (
              <li key={change.id} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    change.kind === "add" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
                  )}
                >
                  {change.kind === "add" ? <Plus className="size-3" /> : <Pencil className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-xs uppercase wrap-break-word">{change.title}</span>
                  {change.detail ? <span className="block text-xs text-muted-foreground wrap-break-word">{change.detail}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {entries.length > 0 ? (
        <dl className={cn("flex flex-col gap-1", classNames?.args)}>
          {entries.map(([key, value]) => (
            <div key={key} className="flex min-w-0 flex-wrap items-baseline gap-2">
              <dt className="text-xs text-muted-foreground">{key}</dt>
              <dd className="min-w-0">
                <ArgValue value={value} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {choices.map((choice) => (
        <label key={choice.id} className="flex items-start gap-2 text-sm text-foreground">
          <Checkbox checked={choice.checked} onCheckedChange={(value) => choice.onCheckedChange?.(value === true)} />
          <span className="wrap-break-word">{choice.label}</span>
        </label>
      ))}
      {onAlwaysAllowChange ? (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={alwaysAllow} onCheckedChange={(value) => onAlwaysAllowChange(value === true)} />
          Always allow this tool
        </label>
      ) : null}
      <div className={cn("flex flex-wrap items-center gap-2", classNames?.actions)}>
        {hint ? (
          <p className="me-auto flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden />
            {hint}
          </p>
        ) : null}
        <Button type="button" disabled={busy || blocked} onClick={() => decide("approved")}>
          {approveLabel}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => decide("rejected")}>
          {denyLabel}
        </Button>
      </div>
      <p id={liveId} className="sr-only" aria-live="polite">
        Waiting for a decision on {toolName}
      </p>
    </div>
  )
}
