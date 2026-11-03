"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import {
  ACTION_KINDS,
  GUARD_FIELDS,
  addChildCondition,
  blankCondition,
  decisionWord,
  describeRule,
  fieldLabel,
  guardMessage,
  guardField,
  kindLabel,
  opLabel,
  optionLabel,
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
    when: "Cuando",
    enabled: "Activa",
    conditions: "Condiciones",
    field: "Campo",
    operator: "Operador",
    value: "Valor",
    custom: "Otro campo",
    customPath: "Ruta del campo",
    decision: "Entonces",
    reason: "Motivo",
    ttl: "La aprobación vence a los (ms)",
    add: "Agregar condición",
    remove: "Quitar",
    summary: "Lectura de la regla",
    loading: "Cargando la regla",
    yes: "Sí",
    no: "No",
  },
  en: {
    emptyTitle: "No rule",
    emptyBody: "Create a rule with an event, conditions, and a decision.",
    name: "Name",
    when: "When",
    enabled: "Enabled",
    conditions: "Conditions",
    field: "Field",
    operator: "Operator",
    value: "Value",
    custom: "Other field",
    customPath: "Field path",
    decision: "Then",
    reason: "Reason",
    ttl: "Approval expires after (ms)",
    add: "Add condition",
    remove: "Remove",
    summary: "Rule reading",
    loading: "Loading the rule",
    yes: "Yes",
    no: "No",
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

function retarget(condition: Condition, path: string): Condition {
  const field = guardField(path)
  if (condition.op === "eq" || condition.op === "neq") {
    if (field?.kind === "boolean") return { ...condition, path, value: false }
    if (field?.kind === "number") return { ...condition, path, value: 0 }
    if (field?.kind === "enum") return { ...condition, path, value: field.options?.[0]?.value ?? "" }
    return { ...condition, path, value: "" }
  }
  if ("path" in condition) return { ...condition, path }
  return condition
}

function valueText(condition: Condition, locale: GuardLocale, yes: string, no: string) {
  if (!("value" in condition)) return ""
  if (typeof condition.value === "boolean") return condition.value ? yes : no
  if (typeof condition.value === "string" && "path" in condition) return optionLabel(condition.path, condition.value, locale)
  return String(condition.value)
}

function ConditionSummary({ condition, locale, yes, no }: { condition: Condition; locale: GuardLocale; yes: string; no: string }) {
  if (condition.op === "and" || condition.op === "or") {
    return (
      <div className="min-w-0">
        <p className="text-sm font-medium">{opLabel(condition.op, locale)}</p>
        {condition.conditions.length === 0 ? null : (
          <ul className="ms-4 mt-1 flex list-disc flex-col gap-1">
            {condition.conditions.map((child, index) => (
              <li key={index} className="min-w-0 break-words">
                <ConditionSummary condition={child} locale={locale} yes={yes} no={no} />
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  if (condition.op === "not") {
    return (
      <div className="min-w-0">
        <p className="text-sm font-medium">{opLabel("not", locale)}</p>
        <div className="ms-4 mt-1">
          <ConditionSummary condition={condition.condition} locale={locale} yes={yes} no={no} />
        </div>
      </div>
    )
  }
  const path = "path" in condition ? fieldLabel(condition.path, locale) : ""
  const extra = condition.op === "in" ? condition.values.map((item) => optionLabel(condition.path, String(item), locale)).join(", ") : valueText(condition, locale, yes, no)
  return (
    <span className="break-words">
      {path} {opLabel(condition.op, locale)}
      {extra ? ` ${extra}` : ""}
    </span>
  )
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
  const fieldId = path.join("-") || "root"
  const currentPath = "path" in condition ? condition.path : ""
  const known = Boolean(guardField(currentPath))
  const [custom, setCustom] = useState(!known && currentPath.length > 0)
  const fieldChoices = currentPath && !known ? [{ path: currentPath, es: currentPath, en: currentPath }, ...GUARD_FIELDS] : GUARD_FIELDS

  return (
    <fieldset className="flex min-w-0 flex-col gap-2 border-s border-border ps-3" aria-label={text.conditions}>
      {"path" in condition ? (
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>{text.field}</span>
          <select
            aria-label={`${text.field} ${fieldId}`}
            className={control}
            value={custom ? "__custom__" : currentPath}
            disabled={readOnly}
            onChange={(event) => {
              if (event.target.value === "__custom__") {
                setCustom(true)
                return
              }
              setCustom(false)
              onReplace(path, retarget(condition, event.target.value))
            }}
          >
            {fieldChoices.map((field) => (
              <option key={field.path} value={field.path}>
                {locale === "es" ? field.es : field.en}
              </option>
            ))}
            <option value="__custom__">{text.custom}</option>
          </select>
        </label>
      ) : null}
      {custom && "path" in condition ? (
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>{text.customPath}</span>
          <Input
            aria-label={`${text.customPath} ${fieldId}`}
            value={currentPath}
            disabled={readOnly}
            onChange={(event) => onReplace(path, { ...condition, path: event.target.value })}
          />
        </label>
      ) : null}
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{text.operator}</span>
        <select
          aria-label={`${text.operator} ${fieldId}`}
          className={control}
          value={condition.op}
          disabled={readOnly}
          onChange={(event) => {
            const next = blankCondition(event.target.value as Condition["op"])
            onReplace(path, "path" in condition && "path" in next ? { ...next, path: condition.path } : next)
          }}
        >
          {OPS.map((op) => (
            <option key={op} value={op}>
              {opLabel(op, locale)}
            </option>
          ))}
        </select>
      </label>
      <ValueControl condition={condition} locale={locale} readOnly={readOnly} fieldId={fieldId} onReplace={(next) => onReplace(path, next)} />
      {onRemove ? (
        <Button type="button" variant="ghost" size="sm" className="w-fit" disabled={readOnly} onClick={onRemove}>
          {text.remove}
        </Button>
      ) : null}
      {condition.op === "and" || condition.op === "or"
        ? condition.conditions.map((child, index) => (
            <ConditionEditor
              key={`${fieldId}-${index}`}
              condition={child}
              locale={locale}
              readOnly={readOnly}
              path={[...path, index]}
              onReplace={onReplace}
              onRemove={() => onReplace(path, removeChildCondition(condition, [index]))}
            />
          ))
        : null}
      {condition.op === "not" ? (
        <ConditionEditor condition={condition.condition} locale={locale} readOnly={readOnly} path={[...path, 0]} onReplace={onReplace} />
      ) : null}
      {condition.op === "and" || condition.op === "or" ? (
        <Button type="button" variant="outline" size="sm" className="w-fit" disabled={readOnly} onClick={() => onReplace(path, addChildCondition(condition, [], blankCondition("eq")))}>
          {text.add}
        </Button>
      ) : null}
    </fieldset>
  )
}

function ValueControl({
  condition,
  locale,
  readOnly,
  fieldId,
  onReplace,
}: {
  condition: Condition
  locale: GuardLocale
  readOnly: boolean
  fieldId: string
  onReplace: (next: Condition) => void
}) {
  const text = copy[locale]
  if (!("value" in condition) && condition.op !== "in") return null
  const path = "path" in condition ? condition.path : ""
  const field = guardField(path)
  if (condition.op === "eq" || condition.op === "neq") {
    if (field?.kind === "boolean" || typeof condition.value === "boolean") {
      const checked = condition.value === true
      return (
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={checked} disabled={readOnly} onCheckedChange={(value) => onReplace({ ...condition, value: value === true })} aria-label={`${text.value} ${fieldId}`} />
          {checked ? text.yes : text.no}
        </label>
      )
    }
    if (field?.kind === "enum" && field.options) {
      return (
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>{text.value}</span>
          <select
            aria-label={`${text.value} ${fieldId}`}
            className={control}
            value={String(condition.value)}
            disabled={readOnly}
            onChange={(event) => onReplace({ ...condition, value: event.target.value })}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {locale === "es" ? option.es : option.en}
              </option>
            ))}
          </select>
        </label>
      )
    }
    if (field?.kind === "number" || typeof condition.value === "number") {
      return (
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>{text.value}</span>
          <Input
            aria-label={`${text.value} ${fieldId}`}
            inputMode="decimal"
            value={String(condition.value)}
            disabled={readOnly}
            onChange={(event) => onReplace({ ...condition, value: Number(event.target.value) })}
          />
        </label>
      )
    }
  }
  if (condition.op === "gt" || condition.op === "gte" || condition.op === "lt" || condition.op === "lte") {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{text.value}</span>
        <Input
          aria-label={`${text.value} ${fieldId}`}
          inputMode="decimal"
          value={String(condition.value)}
          disabled={readOnly}
          onChange={(event) => onReplace({ ...condition, value: Number(event.target.value) })}
        />
      </label>
    )
  }
  if (condition.op === "in") {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{text.value}</span>
        <Input
          aria-label={`${text.value} ${fieldId}`}
          value={condition.values.map(String).join(", ")}
          disabled={readOnly}
          onChange={(event) =>
            onReplace({
              ...condition,
              values: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </label>
    )
  }
  if (condition.op === "includes" || condition.op === "text_includes" || condition.op === "eq" || condition.op === "neq") {
    return (
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span>{text.value}</span>
        <Input
          aria-label={`${text.value} ${fieldId}`}
          value={String("value" in condition ? condition.value : "")}
          disabled={readOnly}
          onChange={(event) => onReplace({ ...condition, value: event.target.value })}
        />
      </label>
    )
  }
  return null
}

function toggleKind(kinds: string[], kind: string, on: boolean) {
  if (on) return kinds.includes(kind) ? kinds : [...kinds, kind]
  return kinds.filter((item) => item !== kind)
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
  const knownKinds = new Set(ACTION_KINDS.map((item) => item.kind))

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
      {status !== "loading" && !rule ? <EmptyState title={text.emptyTitle} description={text.emptyBody} /> : null}
      {status !== "loading" && rule ? (
        <div className="flex min-w-0 flex-col gap-4">
          <div className={cn("min-w-0 rounded-lg bg-muted/40 p-3", classNames?.summary)} aria-label={text.summary}>
            <p className="break-words text-sm">{describeRule(rule, locale)}</p>
            <div className="mt-2">
              <ConditionSummary condition={rule.conditions} locale={locale} yes={text.yes} no={text.no} />
            </div>
          </div>
          <div className={cn("space-y-2", classNames?.section)}>
            <Label htmlFor={`${rule.id}-name`}>{text.name}</Label>
            <Input id={`${rule.id}-name`} value={rule.name} disabled={locked} onChange={(event) => edit({ ...rule, name: event.target.value })} />
          </div>
          <fieldset className="flex min-w-0 flex-col gap-2" disabled={locked}>
            <legend className="text-sm font-medium">{text.when}</legend>
            {ACTION_KINDS.map((item) => (
              <label key={item.kind} className="flex min-w-0 items-start gap-2 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={rule.kinds.includes(item.kind)}
                  disabled={locked}
                  onCheckedChange={(value) => edit({ ...rule, kinds: toggleKind(rule.kinds, item.kind, value === true) })}
                />
                <span className="break-words">{kindLabel(item.kind, locale)}</span>
              </label>
            ))}
            {rule.kinds.filter((kind) => !knownKinds.has(kind)).map((kind) => (
              <label key={kind} className="flex min-w-0 items-start gap-2 text-sm">
                <Checkbox checked disabled={locked} onCheckedChange={() => edit({ ...rule, kinds: toggleKind(rule.kinds, kind, false) })} />
                <span className="break-all">{kind}</span>
              </label>
            ))}
          </fieldset>
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
            onReplace={(nextPath, next) => edit({ ...rule, conditions: nextPath.length === 0 ? next : replaceCondition(rule.conditions, nextPath, next) })}
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
                  {decisionWord(decision, locale)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${rule.id}-reason`}>{text.reason}</Label>
            <Input id={`${rule.id}-reason`} value={rule.reasonKey} disabled={locked} onChange={(event) => edit({ ...rule, reasonKey: event.target.value })} />
            <p className="break-words text-sm text-muted-foreground">{guardMessage(rule.reasonKey, locale)}</p>
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
            {decisionWord(rule.decision, locale)}
          </Badge>
        </div>
      ) : null}
    </section>
  )
}
