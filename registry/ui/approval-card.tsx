"use client"

/**
 * A gate before something hard to undo leaves the workshop. Clean-room reading
 * of a public behavior description: a risk mark, a preview, approve and decline
 * shortcuts, and a countdown that can be paused. The clock running out does
 * not send the action. No Affect source, sample data, icons, or assets were copied.
 * This is not a tool receipt. Tool calls stay on tool-approval.
 */

import * as React from "react"
import { Check, Pause, Play, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const GATE_RISKS = ["low", "guarded", "high"] as const
export const GATE_STATUSES = ["open", "held", "approved", "declined"] as const

export type GateRisk = (typeof GATE_RISKS)[number]
export type GateStatus = (typeof GATE_STATUSES)[number]

export type ApprovalProposal<TMeta = unknown> = {
  id: string
  title: string
  preview: string
  detail?: string
  risk: GateRisk
  /** Seconds left on the warning clock. The host owns the tick. */
  secondsLeft: number
  status: GateStatus
  meta?: TMeta
}

export type ApprovalCardLabels = {
  title: string
  risk: Record<GateRisk, string>
  held: string
  approved: string
  declined: string
  expired: string
  expiredDetail: string
  approve: string
  approveAnyway: string
  decline: string
  leave: string
  hold: string
  release: string
  clock: (label: string) => string
  empty: string
  loading: string
  approvedLive: (title: string) => string
  declinedLive: (title: string) => string
  heldLive: string
  releasedLive: string
}

export type ApprovalCardClassNames = {
  root?: string
  preview?: string
  actions?: string
}

export type ApprovalCardProps<TMeta = unknown> = {
  proposal?: ApprovalProposal<TMeta> | null
  loading?: boolean
  error?: string
  title?: string
  hotkeys?: boolean
  onApprove?: (id: string) => void
  onDecline?: (id: string) => void
  onHold?: (id: string) => void
  onRelease?: (id: string) => void
  className?: string
  classNames?: ApprovalCardClassNames
  labels?: Partial<ApprovalCardLabels>
}

const approvalLabels: ApprovalCardLabels = {
  title: "Before it goes out",
  risk: {
    low: "Low stakes",
    guarded: "Worth a look",
    high: "Hard to undo",
  },
  held: "Clock paused",
  approved: "Approved",
  declined: "Declined",
  expired: "Clock ran out",
  expiredDetail: "Nothing was sent. It stays here until you approve it.",
  approve: "Approve",
  approveAnyway: "Approve anyway",
  decline: "Decline",
  leave: "Leave it",
  hold: "Pause the clock",
  release: "Resume the clock",
  clock: (label) => `${label} left`,
  empty: "Nothing is waiting to go out.",
  loading: "Loading the gate",
  approvedLive: (title) => `Approved “${title}”`,
  declinedLive: (title) => `Declined “${title}”`,
  heldLive: "Clock paused",
  releasedLive: "Clock running",
}

function resolveLabels(partial?: Partial<ApprovalCardLabels>): ApprovalCardLabels {
  return { ...approvalLabels, ...partial, risk: { ...approvalLabels.risk, ...partial?.risk } }
}

export function gateClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

export function gateExpired(proposal: Pick<ApprovalProposal, "id" | "status" | "secondsLeft"> | null | undefined) {
  return Boolean(proposal && proposal.status === "open" && proposal.secondsLeft <= 0)
}

export function ApprovalCard<TMeta = unknown>({
  proposal,
  loading = false,
  error,
  title,
  hotkeys = true,
  onApprove,
  onDecline,
  onHold,
  onRelease,
  className,
  classNames,
  labels: labelOverrides,
}: ApprovalCardProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [live, setLive] = React.useState("")
  const expired = gateExpired(proposal)
  const settled = proposal?.status === "approved" || proposal?.status === "declined"
  const open = proposal?.status === "open" || proposal?.status === "held"

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (!hotkeys || !proposal || event.target !== event.currentTarget) return
    if (event.key === "Enter" && (proposal.status === "open" || proposal.status === "held")) {
      event.preventDefault()
      onApprove?.(proposal.id)
      setLive(labels.approvedLive(proposal.title))
    }
    if (event.key === "Escape" && (proposal.status === "open" || proposal.status === "held")) {
      event.preventDefault()
      onDecline?.(proposal.id)
      setLive(labels.declinedLive(proposal.title))
    }
    if ((event.key === "h" || event.key === "H") && proposal.status === "open" && !expired) {
      event.preventDefault()
      onHold?.(proposal.id)
      setLive(labels.heldLive)
    }
    if ((event.key === "h" || event.key === "H") && proposal.status === "held") {
      event.preventDefault()
      onRelease?.(proposal.id)
      setLive(labels.releasedLive)
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      tabIndex={hotkeys && open ? 0 : undefined}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
        classNames?.root,
      )}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        {proposal && !settled ? (
          <Badge variant={proposal.risk === "high" ? "destructive" : "outline"}>{labels.risk[proposal.risk]}</Badge>
        ) : null}
        {proposal?.status === "held" ? <Badge variant="secondary">{labels.held}</Badge> : null}
        {expired ? <Badge variant="destructive">{labels.expired}</Badge> : null}
        {proposal?.status === "approved" ? <Badge variant="secondary">{labels.approved}</Badge> : null}
        {proposal?.status === "declined" ? <Badge variant="outline">{labels.declined}</Badge> : null}
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        </div>
      ) : error && !proposal ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : !proposal ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className={cn("rounded-lg border border-border px-3 py-2", classNames?.preview)}>
            <h3 className="font-medium">{proposal.title}</h3>
            <p className="mt-1">{proposal.preview}</p>
            {proposal.detail ? <p className="mt-1 text-xs text-muted-foreground">{proposal.detail}</p> : null}
            {expired ? <p className="mt-2 text-xs">{labels.expiredDetail}</p> : null}
            {open && !expired ? (
              <p className="mt-2 font-mono text-xs">
                <span aria-hidden="true">{gateClock(proposal.secondsLeft)}</span>
                <span className="sr-only">{labels.clock(gateClock(proposal.secondsLeft))}</span>
              </p>
            ) : null}
          </div>
          {proposal.status === "approved" || proposal.status === "declined" ? (
            <p>
              <Check aria-hidden="true" className={cn("me-1 inline size-4", proposal.status === "declined" && "hidden")} />
              <X aria-hidden="true" className={cn("me-1 inline size-4", proposal.status === "approved" && "hidden")} />
              {proposal.status === "approved" ? labels.approved : labels.declined}
            </p>
          ) : (
            <div className={cn("flex flex-wrap gap-2", classNames?.actions)}>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onApprove?.(proposal.id)
                  setLive(labels.approvedLive(proposal.title))
                }}
              >
                <Check aria-hidden="true" />
                {expired ? labels.approveAnyway : labels.approve}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onDecline?.(proposal.id)
                  setLive(labels.declinedLive(proposal.title))
                }}
              >
                <X aria-hidden="true" />
                {expired ? labels.leave : labels.decline}
              </Button>
              {proposal.status === "held" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onRelease?.(proposal.id)
                    setLive(labels.releasedLive)
                  }}
                >
                  <Play aria-hidden="true" />
                  {labels.release}
                </Button>
              ) : expired ? null : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onHold?.(proposal.id)
                    setLive(labels.heldLive)
                  }}
                >
                  <Pause aria-hidden="true" />
                  {labels.hold}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
