"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import { formatGuardTime, guardMessage, type ApprovalStatus, type GuardLocale, type GuardRole } from "@/registry/retana/lib/guard-rules"
import { cn } from "@/lib/utils"

const copy = {
  es: {
    emptyTitle: "No hay aprobaciones",
    emptyBody: "Cuando una acción quede en require_approval, aparece aquí.",
    loading: "Cargando aprobaciones",
    approve: "Aprobar",
    reject: "Rechazar",
    expires: "Vence",
    decided: "Decidió",
    locked: "Solo un approver puede decidir, y una aprobación vencida no se puede aprobar.",
    kind: "Kind",
  },
  en: {
    emptyTitle: "No approvals",
    emptyBody: "When an action stays on require_approval, it shows up here.",
    loading: "Loading approvals",
    approve: "Approve",
    reject: "Reject",
    expires: "Expires",
    decided: "Decided by",
    locked: "Only an approver can decide, and an expired approval cannot be approved.",
    kind: "Kind",
  },
} as const

export type ApprovalQueueItem = {
  id: string
  kind: string
  reasonKey: string
  status: ApprovalStatus
  expiresAt: number
  createdAt: number
  summary: string
  decidedBy?: string
  decidedAt?: number
}

export type GuardApprovalQueueProps = {
  items: readonly ApprovalQueueItem[]
  now: number
  locale?: GuardLocale
  status?: "idle" | "loading" | "error"
  errorMessage?: string
  role?: GuardRole
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  className?: string
}

function shownStatus(item: ApprovalQueueItem, now: number): ApprovalStatus {
  if ((item.status === "pending" || item.status === "approved") && now >= item.expiresAt) return "expired"
  return item.status
}

export function GuardApprovalQueue({
  items,
  now,
  locale = "en",
  status = "idle",
  errorMessage,
  role = "viewer",
  onApprove,
  onReject,
  className,
}: GuardApprovalQueueProps) {
  const text = copy[locale]
  return (
    <section className={cn("flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground", className)} aria-busy={status === "loading" || undefined}>
      {status === "error" && errorMessage ? (
        <p role="alert" className="break-words text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {status === "loading" ? (
        <div role="status" aria-label={text.loading} className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}
      {status !== "loading" && items.length === 0 ? <EmptyState title={text.emptyTitle} description={text.emptyBody} /> : null}
      {status !== "loading" && items.length > 0 ? (
        <ul className="flex min-w-0 flex-col gap-3">
          {items.map((item) => {
            const state = shownStatus(item, now)
            const open = state === "pending" && role === "approver"
            const hint = `${item.id}-hint`
            return (
              <li key={item.id} className="min-w-0 space-y-2 rounded-lg border border-border p-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant={state === "expired" || state === "rejected" ? "outline" : "secondary"}>{state}</Badge>
                  <span className="break-words text-sm font-medium">
                    {text.kind}: {item.kind}
                  </span>
                </div>
                <p className="break-words text-sm">{item.summary}</p>
                <p className="break-words text-sm text-muted-foreground">{guardMessage(item.reasonKey, locale)}</p>
                <p className="text-xs text-muted-foreground">
                  {text.expires}: {formatGuardTime(item.expiresAt, locale)}
                </p>
                {item.decidedBy ? (
                  <p className="break-words text-xs text-muted-foreground">
                    {text.decided}: {item.decidedBy}
                    {item.decidedAt !== undefined ? ` · ${formatGuardTime(item.decidedAt, locale)}` : ""}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={!open || !onApprove} aria-describedby={hint} onClick={() => onApprove?.(item.id)}>
                    {text.approve}
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={!open || !onReject} aria-describedby={hint} onClick={() => onReject?.(item.id)}>
                    {text.reject}
                  </Button>
                </div>
                <p id={hint} className="text-xs text-muted-foreground">
                  {text.locked}
                </p>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
