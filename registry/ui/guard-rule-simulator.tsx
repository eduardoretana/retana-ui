"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import {
  decisionLabel,
  evaluateRules,
  explain,
  flattenData,
  unflattenData,
  type GuardAction,
  type GuardLocale,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"
import { cn } from "@/lib/utils"

const copy = {
  es: {
    emptyTitle: "Nada que simular",
    emptyBody: "Elige un ruleset y una acción. El kind puede ser whatsapp.before_send o git.merge.",
    kind: "Kind de la acción",
    text: "Texto (señal secundaria)",
    path: "Ruta",
    value: "Valor",
    add: "Agregar dato",
    result: "Decisión",
    trace: "Traza",
    loading: "Simulando",
    remove: "Quitar dato",
  },
  en: {
    emptyTitle: "Nothing to simulate",
    emptyBody: "Choose a ruleset and an action. The kind can be whatsapp.before_send or git.merge.",
    kind: "Action kind",
    text: "Text (secondary signal)",
    path: "Path",
    value: "Value",
    add: "Add fact",
    result: "Decision",
    trace: "Trace",
    loading: "Simulating",
    remove: "Remove fact",
  },
} as const

export type GuardRuleSimulatorProps = {
  ruleset: Ruleset | null
  action: GuardAction | null
  locale?: GuardLocale
  status?: "idle" | "loading" | "error"
  errorMessage?: string
  clock?: () => number
  onActionChange?: (action: GuardAction) => void
  className?: string
}

export function GuardRuleSimulator({
  ruleset,
  action,
  locale = "en",
  status = "idle",
  errorMessage,
  clock = () => 0,
  onActionChange,
  className,
}: GuardRuleSimulatorProps) {
  const text = copy[locale]
  const [draft, setDraft] = useState<GuardAction | null>(action)
  const current = draft && action && draft.kind === action.kind && draft.accountId === action.accountId ? draft : action
  const rows = current ? flattenData(current.data) : []

  function commit(next: GuardAction) {
    setDraft(next)
    onActionChange?.(next)
  }

  const evaluation = status === "idle" && ruleset && current ? evaluateRules(ruleset, current, clock) : null

  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground", className)} aria-busy={status === "loading" || undefined}>
      {status === "error" && errorMessage ? (
        <p role="alert" className="break-words text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {status === "loading" ? (
        <div role="status" aria-label={text.loading} className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : null}
      {status !== "loading" && (!ruleset || !current) ? <EmptyState title={text.emptyTitle} description={text.emptyBody} /> : null}
      {status !== "loading" && ruleset && current ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="guard-kind">{text.kind}</Label>
            <Input
              id="guard-kind"
              value={current.kind}
              onChange={(event) => commit({ ...current, kind: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guard-text">{text.text}</Label>
            <Input
              id="guard-text"
              value={current.text ?? ""}
              onChange={(event) => commit({ ...current, text: event.target.value })}
            />
          </div>
          <ul className="flex min-w-0 flex-col gap-2">
            {rows.map((row, index) => (
              <li key={`${row.path}-${index}`} className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <Input
                  aria-label={`${text.path} ${index + 1}`}
                  value={row.path}
                  onChange={(event) => {
                    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, path: event.target.value } : item))
                    commit({ ...current, data: unflattenData(next) })
                  }}
                />
                <Input
                  aria-label={`${text.value} ${index + 1}`}
                  value={row.value}
                  className="break-words"
                  onChange={(event) => {
                    const next = rows.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item))
                    commit({ ...current, data: unflattenData(next) })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => commit({ ...current, data: unflattenData(rows.filter((_, itemIndex) => itemIndex !== index)) })}
                >
                  {text.remove}
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => commit({ ...current, data: unflattenData([...rows, { path: "extra", value: "" }]) })}>
            {text.add}
          </Button>
          {evaluation ? (
            <div className="space-y-2" role="status" aria-live="polite" aria-label={text.result}>
              <Badge variant={evaluation.decision === "block" ? "destructive" : "outline"}>{decisionLabel(evaluation.decision, locale)}</Badge>
              <p className="break-words text-sm">{explain(evaluation, locale)}</p>
              <ScrollArea className="h-64 rounded-lg border border-border">
                <ol aria-label={text.trace} className="space-y-2 p-3 text-sm">
                  {evaluation.traces.map((trace) => (
                    <li key={trace.ruleId} className="min-w-0 break-words">
                      <span className="font-medium">{trace.ruleName}</span>
                      <span className="text-muted-foreground"> · {trace.status}</span>
                      {trace.missingPaths.length ? <span className="text-muted-foreground"> · {trace.missingPaths.join(", ")}</span> : null}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
