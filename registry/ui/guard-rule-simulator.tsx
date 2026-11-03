"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import {
  ACTION_KINDS,
  decisionLabel,
  evaluateRules,
  explain,
  fieldLabel,
  fieldsForKind,
  flattenData,
  guardField,
  kindLabel,
  optionLabel,
  readDataPath,
  traceStatusLabel,
  unflattenData,
  writePath,
  type GuardAction,
  type GuardField,
  type GuardLocale,
  type RuleTrace,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"
import { cn } from "@/lib/utils"

const control =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const copy = {
  es: {
    emptyTitle: "Nada que simular",
    emptyBody: "Elige un conjunto de reglas y una acción.",
    kind: "Evento",
    text: "Texto del mensaje",
    path: "Campo",
    value: "Valor",
    add: "Agregar dato",
    result: "Decisión",
    trace: "Traza",
    loading: "Simulando",
    remove: "Quitar dato",
    fields: "Campos",
    advanced: "Avanzado",
    decided: "Esta decidió",
    failClosed: "No se permitió seguir porque faltó un dato.",
    scroll: "La lista sigue. Desliza o recorre con el teclado.",
    yes: "Sí",
    no: "No",
  },
  en: {
    emptyTitle: "Nothing to simulate",
    emptyBody: "Choose a ruleset and an action.",
    kind: "Event",
    text: "Message text",
    path: "Field",
    value: "Value",
    add: "Add fact",
    result: "Decision",
    trace: "Trace",
    loading: "Simulating",
    remove: "Remove fact",
    fields: "Fields",
    advanced: "Advanced",
    decided: "This one decided",
    failClosed: "Automatic allow was refused because a fact was missing.",
    scroll: "The list continues. Scroll or move through it with the keyboard.",
    yes: "Yes",
    no: "No",
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

function Mark({ status }: { status: RuleTrace["status"] }) {
  const shared = "mt-1 inline-block size-3 shrink-0"
  if (status === "fired") return <span aria-hidden className={cn(shared, "rounded-full bg-foreground")} />
  if (status === "matched_false") return <span aria-hidden className={cn(shared, "rounded-full border-2 border-foreground")} />
  if (status === "missing") return <span aria-hidden className={cn(shared, "rotate-45 border-2 border-foreground")} />
  return <span aria-hidden className="mt-1.5 inline-block h-0.5 w-3 shrink-0 bg-foreground" />
}

function typedFields(action: GuardAction): GuardField[] {
  const seen = new Set<string>()
  const fields: GuardField[] = []
  for (const field of fieldsForKind(action.kind)) {
    if (field.path === "text") continue
    seen.add(field.path)
    fields.push(field)
  }
  for (const row of flattenData(action.data)) {
    if (seen.has(row.path)) continue
    const field = guardField(row.path)
    if (field) fields.push(field)
  }
  return fields
}

function FieldControl({
  field,
  action,
  locale,
  onChange,
}: {
  field: GuardField
  action: GuardAction
  locale: GuardLocale
  onChange: (next: GuardAction) => void
}) {
  const text = copy[locale]
  const current = readDataPath(action.data, field.path)
  const label = field[locale]
  const write = (value: unknown) => onChange({ ...action, data: writePath(action.data, field.path, value) })
  if (field.kind === "boolean") {
    const checked = current === true
    return (
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={checked} onCheckedChange={(value) => write(value === true)} aria-label={label} />
        <span className="break-words">{label}</span>
        <span className="text-muted-foreground">{checked ? text.yes : text.no}</span>
      </label>
    )
  }
  if (field.kind === "enum" && field.options) {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{label}</span>
        <select aria-label={label} className={control} value={typeof current === "string" ? current : ""} onChange={(event) => write(event.target.value)}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {locale === "es" ? option.es : option.en}
            </option>
          ))}
        </select>
      </label>
    )
  }
  if (field.kind === "number") {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{label}</span>
        <Input aria-label={label} inputMode="decimal" value={typeof current === "number" ? String(current) : ""} onChange={(event) => write(Number(event.target.value))} />
      </label>
    )
  }
  const shown = Array.isArray(current) ? current.join(", ") : current == null ? "" : String(current)
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm">
      <span>{label}</span>
      <Input
        aria-label={label}
        value={shown}
        onChange={(event) => write(field.kind === "list" ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean) : event.target.value)}
      />
    </label>
  )
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
  const [advanced, setAdvanced] = useState(false)
  const current = draft && action && draft.accountId === action.accountId ? draft : action
  const rows = current ? flattenData(current.data) : []

  function commit(next: GuardAction) {
    setDraft(next)
    onActionChange?.(next)
  }

  const evaluation = status === "idle" && ruleset && current ? evaluateRules(ruleset, current, clock) : null
  const winner = evaluation?.traces.find((trace) => trace.status === "fired" && trace.decision === evaluation.decision)
  const ordered = evaluation
    ? [...evaluation.traces].sort((left, right) => {
        if (left.ruleId === winner?.ruleId) return -1
        if (right.ruleId === winner?.ruleId) return 1
        const rank = { fired: 0, missing: 1, matched_false: 2, skipped: 3 }
        return rank[left.status] - rank[right.status]
      })
    : []

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
          <label className="flex min-w-0 flex-col gap-1 text-sm">
            <span>{text.kind}</span>
            <select
              aria-label={text.kind}
              className={control}
              value={ACTION_KINDS.some((item) => item.kind === current.kind) ? current.kind : "__custom__"}
              onChange={(event) => {
                if (event.target.value !== "__custom__") commit({ ...current, kind: event.target.value })
              }}
            >
              {ACTION_KINDS.filter((item) => item.kind !== "*").map((item) => (
                <option key={item.kind} value={item.kind}>
                  {kindLabel(item.kind, locale)}
                </option>
              ))}
              <option value="__custom__">{current.kind}</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-sm">
            <span>{text.text}</span>
            <Input aria-label={text.text} value={current.text ?? ""} onChange={(event) => commit({ ...current, text: event.target.value })} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={advanced ? "outline" : "default"} onClick={() => setAdvanced(false)}>
              {text.fields}
            </Button>
            <Button type="button" size="sm" variant={advanced ? "default" : "outline"} onClick={() => setAdvanced(true)}>
              {text.advanced}
            </Button>
          </div>
          {advanced ? (
            <ul className="flex min-w-0 flex-col gap-2">
              {rows.map((row, index) => (
                <li key={`${row.path}-${index}`} className="flex min-w-0 flex-col gap-2">
                  <Input
                    aria-label={`${text.path} ${index + 1}`}
                    value={row.path}
                    onChange={(event) => commit({ ...current, data: unflattenData(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, path: event.target.value } : item))) })}
                  />
                  <Input
                    aria-label={`${text.value} ${index + 1}`}
                    value={row.value}
                    onChange={(event) => commit({ ...current, data: unflattenData(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item))) })}
                  />
                  <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => commit({ ...current, data: unflattenData(rows.filter((_, itemIndex) => itemIndex !== index)) })}>
                    {text.remove}
                  </Button>
                </li>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => commit({ ...current, data: unflattenData([...rows, { path: "extra", value: "" }]) })}>
                {text.add}
              </Button>
            </ul>
          ) : (
            <div className="flex min-w-0 flex-col gap-3">
              {typedFields(current).map((field) => (
                <FieldControl key={field.path} field={field} action={current} locale={locale} onChange={commit} />
              ))}
            </div>
          )}
          {evaluation ? (
            <div className="space-y-2" role="status" aria-live="polite" aria-label={text.result}>
              <Badge variant={evaluation.decision === "block" ? "destructive" : "outline"}>{decisionLabel(evaluation.decision, locale)}</Badge>
              <p className="break-words text-sm">{explain(evaluation, locale)}</p>
              {evaluation.failClosed ? (
                <p className="break-words text-sm">
                  {text.failClosed}{" "}
                  {evaluation.missingPaths.map((path) => fieldLabel(path, locale)).join(", ")}
                </p>
              ) : null}
              {winner ? (
                <p className="break-words text-sm font-medium">
                  {text.decided}: {winner.ruleName}
                </p>
              ) : null}
              <div tabIndex={0} aria-label={text.trace} className="max-h-80 overflow-y-auto rounded-lg border border-border">
                {ordered.length > 4 ? <p className="sticky top-0 border-b border-border bg-card px-3 py-2 text-xs text-muted-foreground">{text.scroll}</p> : null}
                <ol className="space-y-2 p-3 text-sm">
                  {ordered.map((trace) => (
                    <li key={trace.ruleId} className="flex min-w-0 items-start gap-2 break-words">
                      <Mark status={trace.status} />
                      <span>
                        <span className="font-medium">{trace.ruleName}</span>
                        <span className="text-muted-foreground"> · {traceStatusLabel(trace.status, locale)}</span>
                        {trace.ruleId === winner?.ruleId ? <span> · {text.decided}</span> : null}
                        {trace.missingPaths.length ? (
                          <span className="text-muted-foreground"> · {trace.missingPaths.map((path) => fieldLabel(path, locale)).join(", ")}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
