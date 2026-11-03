"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import { decisionLabel, formatGuardTime, type GuardLocale, type TerminalDecision } from "@/registry/retana/lib/guard-rules"
import { cn } from "@/lib/utils"

const copy = {
  es: {
    emptyTitle: "La bitácora está vacía",
    emptyBody: "Cada decisión se agrega aquí. No se puede borrar ni editar.",
    loading: "Cargando la bitácora",
    version: "Versión",
    account: "Cuenta",
    response: "Respuesta",
    approver: "Aprobó",
  },
  en: {
    emptyTitle: "The audit log is empty",
    emptyBody: "Every decision is appended here. Nothing can be deleted or edited.",
    loading: "Loading the audit log",
    version: "Version",
    account: "Account",
    response: "Response",
    approver: "Approved by",
  },
} as const

export type AuditLogItem = {
  id: string
  createdAt: number
  kind: string
  decision: TerminalDecision
  summary: string
  ruleIds: readonly string[]
  rulesetVersion: number
  accountId: string
  agentResponse?: string
  approver?: string
}

export type GuardAuditLogProps = {
  entries: readonly AuditLogItem[]
  locale?: GuardLocale
  status?: "idle" | "loading" | "error"
  errorMessage?: string
  className?: string
}

export function GuardAuditLog({ entries, locale = "en", status = "idle", errorMessage, className }: GuardAuditLogProps) {
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
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : null}
      {status !== "loading" && entries.length === 0 ? <EmptyState title={text.emptyTitle} description={text.emptyBody} /> : null}
      {status !== "loading" && entries.length > 0 ? (
        <ScrollArea className="h-80">
          <ol className="flex min-w-0 flex-col gap-3 pe-3">
            {entries.map((entry) => (
              <li key={entry.id} className="min-w-0 space-y-1 rounded-lg border border-border p-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant={entry.decision === "block" ? "destructive" : "outline"}>{decisionLabel(entry.decision, locale)}</Badge>
                  <span className="break-all text-xs text-muted-foreground">{formatGuardTime(entry.createdAt, locale)}</span>
                </div>
                <p className="break-words text-sm font-medium">{entry.kind}</p>
                <p className="break-words text-sm">{entry.summary}</p>
                <p className="break-words text-xs text-muted-foreground">
                  {entry.ruleIds.join(", ") || "—"} · {text.version} {entry.rulesetVersion} · {text.account} {entry.accountId}
                </p>
                {entry.agentResponse ? (
                  <p className="break-words text-sm">
                    {text.response}: {entry.agentResponse}
                  </p>
                ) : null}
                {entry.approver ? (
                  <p className="break-words text-xs text-muted-foreground">
                    {text.approver}: {entry.approver}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </ScrollArea>
      ) : null}
    </section>
  )
}
