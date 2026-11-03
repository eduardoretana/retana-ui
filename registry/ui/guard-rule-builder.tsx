"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import {
  addChildCondition,
  blankCondition,
  describeRule,
  removeChildCondition,
  replaceCondition,
  type Condition,
  type DecisionKind,
  type GuardLocale,
  type GuardRule,
} from "@/registry/retana/lib/guard-rules"
import { cn } from "@/lib/utils"

const OPS: Condition["op"][] = ["and", "or", "not", "eq", "neq", "gt", "gte", "lt", "lte", "in", "exists", "missing", "includes", "text_includes"]
const DECISIONS: DecisionKind[] = ["allow", "require_approval", "block", "handoff_to_human", "log"]

const control =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

const copy = {
  es: {
    emptyTitle: "No hay regla",
    emptyBody: "Crea una regla con un evento, condiciones y una decisión.",
    name: "Nombre",
    kinds: "Cuando (kinds, separados por coma)",
    enabled: "Activa",
    conditions: "Condiciones",
    decision: "Entonces",
    reason: "Clave del motivo",
    ttl: "La aprobación vence a los (ms)",
    add: "Agregar condición",
    remove: "Quitar",
    summary: "Lectura",
    loading: "Cargando la regla",
  },
  en: {
    emptyTitle: "No rule",
    emptyBody: "Create a rule with an action kind, conditions, and a decision.",
    name: "Name",
    kinds: "When (kinds, comma separated)",
    enabled: "Enabled",
    conditions: "Conditions",
    decision: "Then",
    reason: "Reason key",
    ttl: "Approval expires after (ms)",
    add: "Add condition",
    remove: "Remove",
    summary: "Reading",
    loading: "Loading the rule",
  },
} as const

export type GuardRuleBuilderProps = {
  rule: GuardRule | null
  locale?: GuardLocale
  status?: "idle" | "loading" | "error"
  errorMessage?: string
  readOnly?: boolean
  onChange?: (rule: GuardRule) => void
  className?: string
  classNames?: { root?: string; section?: string; summary?: string }
}

function changeOp(current: Condition, op: Condition["op"]): Condition {
  const next = blankCondition(op)
  if ("path" in current && "path" in next && current.path) return { ...next, path: current.path }
  return next
}

function ConditionEditor({
  condition,
  locale,
  readOnly,
  path,
  onReplace,
  onRemove,
}: {
  condition: Condition
  locale: GuardLocale
  readOnly: boolean
  path: number[]
  onReplace: (path: number[], next: Condition) => void
  onRemove?: () => void
}) {
  const text = copy[locale]
  const field = `${path.join("-") || "root"}`
  return (
    <fieldset className="min-w-0 space-y-2 border-s border-border ps-3" aria-label={text.conditions}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <select
          aria-label={`${text.conditions} ${field}`}
          className={cn(control, "w-auto min-w-28")}
          value={condition.op}
          disabled={readOnly}
          onChange={(event) => onReplace(path, changeOp(condition, event.target.value as Condition["op"]))}
        >
          {OPS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        {"path" in condition ? (
          <Input
            aria-label={`path ${field}`}
            value={condition.path}
            disabled={readOnly}
            className="min-w-0 flex-1"
            onChange={(event) => onReplace(path, { ...condition, path: event.target.value })}
          />
        ) : null}
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" disabled={readOnly} onClick={onRemove}>
            {text.remove}
          </Button>
        ) : null}
      </div>
      {condition.op === "gt" || condition.op === "gte" || condition.op === "lt" || condition.op === "lte" ? (
        <Input
          aria-label={`value ${field}`}
          value={String(condition.value)}
          disabled={readOnly}
          onChange={(event) => onReplace(path, { ...condition, value: Number(event.target.value) })}
        />
      ) : null}
      {condition.op === "eq" || condition.op === "neq" ? (
        <Input
          aria-label={`value ${field}`}
          value={String(condition.value)}
          disabled={readOnly}
          onChange={(event) => {
            const raw = event.target.value
            const next = raw === "true" ? true : raw === "false" ? false : raw === "null" ? null : /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw
            onReplace(path, { ...condition, value: next })
          }}
        />
      ) : null}
      {condition.op === "includes" || condition.op === "text_includes" ? (
        <Input
          aria-label={`value ${field}`}
          value={condition.value}
          disabled={readOnly}
          onChange={(event) => onReplace(path, { ...condition, value: event.target.value })}
        />
      ) : null}
      {condition.op === "in" ? (
        <Input
          aria-label={`values ${field}`}
          value={condition.values.map(String).join(", ")}
          disabled={readOnly}
          onChange={(event) =>
            onReplace(path, {
              ...condition,
              values: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      ) : null}
      {condition.op === "and" || condition.op === "or"
        ? condition.conditions.map((child, index) => (
            <ConditionEditor
              key={`${field}-${index}`}
              condition={child}
              locale={locale}
              readOnly={readOnly}
              path={[...path, index]}
              onReplace={onReplace}
              onRemove={() => onRemoveChild(path, index)}
            />
          ))
        : null}
      {condition.op === "not" ? (
        <ConditionEditor condition={condition.condition} locale={locale} readOnly={readOnly} path={[...path, 0]} onReplace={onReplace} />
      ) : null}
      {condition.op === "and" || condition.op === "or" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={readOnly}
          onClick={() => onReplace(path, addChildCondition(condition, [], blankCondition("eq")))}
        >
          {text.add}
        </Button>
      ) : null}
    </fieldset>
  )

  function onRemoveChild(parent: number[], index: number) {
    onReplace(parent, removeChildCondition(condition, [index]))
  }
}

export function GuardRuleBuilder({
  rule,
  locale = "en",
  status = "idle",
  errorMessage,
  readOnly = false,
  onChange,
  className,
  classNames,
}: GuardRuleBuilderProps) {
  const text = copy[locale]
  const locked = readOnly || !onChange

  const edit = (next: GuardRule) => {
    if (!locked) onChange?.(next)
  }

  return (
    <section
      data-layout="stacked"
      aria-busy={status === "loading" || undefined}
      className={cn("flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground", className, classNames?.root)}
    >
      {status === "error" && errorMessage ? (
        <p role="alert" className="break-words text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {status === "loading" ? (
        <div className="space-y-2" role="status" aria-label={text.loading}>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}
      {status !== "loading" && !rule ? (
        <EmptyState title={text.emptyTitle} description={text.emptyBody} />
      ) : null}
      {status !== "loading" && rule ? (
        <div className="flex min-w-0 flex-col gap-4">
          <p className={cn("break-words text-sm text-muted-foreground", classNames?.summary)} aria-label={text.summary}>
            {describeRule(rule, locale)}
          </p>
          <div className={cn("space-y-2", classNames?.section)}>
            <Label htmlFor={`${rule.id}-name`}>{text.name}</Label>
            <Input
              id={`${rule.id}-name`}
              value={rule.name}
              disabled={locked}
              onChange={(event) => edit({ ...rule, name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${rule.id}-kinds`}>{text.kinds}</Label>
            <Input
              id={`${rule.id}-kinds`}
              value={rule.kinds.join(", ")}
              disabled={locked}
              onChange={(event) =>
                edit({
                  ...rule,
                  kinds: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={rule.enabled} disabled={locked} onCheckedChange={(value) => edit({ ...rule, enabled: value === true })} />
            {text.enabled}
          </label>
          <Separator />
          <h2 className="text-sm font-medium">{text.conditions}</h2>
          <ConditionEditor
            condition={rule.conditions}
            locale={locale}
            readOnly={locked}
            path={[]}
            onReplace={(path, next) => edit({ ...rule, conditions: path.length === 0 ? next : replaceCondition(rule.conditions, path, next) })}
          />
          <Separator />
          <div className="space-y-2">
            <Label htmlFor={`${rule.id}-decision`}>{text.decision}</Label>
            <select
              id={`${rule.id}-decision`}
              className={control}
              value={rule.decision}
              disabled={locked}
              onChange={(event) => edit({ ...rule, decision: event.target.value as DecisionKind })}
            >
              {DECISIONS.map((decision) => (
                <option key={decision} value={decision}>
                  {decision}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${rule.id}-reason`}>{text.reason}</Label>
            <Input
              id={`${rule.id}-reason`}
              value={rule.reasonKey}
              disabled={locked}
              onChange={(event) => edit({ ...rule, reasonKey: event.target.value })}
            />
          </div>
          {rule.decision === "require_approval" ? (
            <div className="space-y-2">
              <Label htmlFor={`${rule.id}-ttl`}>{text.ttl}</Label>
              <Input
                id={`${rule.id}-ttl`}
                inputMode="numeric"
                value={String(rule.approvalTtlMs ?? "")}
                disabled={locked}
                onChange={(event) => {
                  const approvalTtlMs = Number(event.target.value)
                  if (approvalTtlMs > 0) edit({ ...rule, approvalTtlMs })
                }}
              />
            </div>
          ) : null}
          <Badge variant="outline" className="w-fit max-w-full break-words">
            {rule.decision}
          </Badge>
        </div>
      ) : null}
    </section>
  )
}
