"use client"

/**
 * An agent asks for one right: who, why, and what will happen. Clean-room
 * reading of a public behavior description. No Affect source, sample data,
 * icons, or assets were copied. The host owns the grant and the clock.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const PERMISSION_SCOPES = ["once", "timed", "always"] as const
export const PERMISSION_RISKS = ["safe", "risky", "destructive"] as const

export type PermissionScope = (typeof PERMISSION_SCOPES)[number]
export type PermissionRisk = (typeof PERMISSION_RISKS)[number]

export type PermissionPreview<TMeta = unknown> = {
  id: string
  label: string
  meta?: string
  itemMeta?: TMeta
}

export type PermissionDecision = {
  allow: boolean
  scope?: PermissionScope
  left?: string
}

export type PermissionRequestLabels = {
  title: (name: string, action: string) => string
  reason: string
  preview: string
  more: (count: number) => string
  less: string
  scope: string
  scopes: Record<PermissionScope, string>
  allowNamed: (scope: PermissionScope, duration: string) => string
  deny: string
  allowed: (scope: PermissionScope, duration: string) => string
  denied: string
  left: (label: string) => string
  revoke: string
  again: string
  empty: string
  loading: string
  risk: Record<PermissionRisk, string>
}

const permissionLabels: PermissionRequestLabels = {
  title: (name, action) => `${name} wants to ${action}`,
  reason: "Why",
  preview: "What will happen",
  more: (count) => (count === 1 ? "1 more" : `${count} more`),
  less: "Show less",
  scope: "How long",
  scopes: { once: "Once", timed: "For a while", always: "Always" },
  allowNamed: (scope, duration) => (scope === "once" ? "Allow once" : scope === "always" ? "Allow always" : `Allow for ${duration}`),
  deny: "Don't allow",
  allowed: (scope, duration) => (scope === "once" ? "Allowed once" : scope === "always" ? "Allowed always" : `Allowed for ${duration}`),
  denied: "Not allowed",
  left: (label) => `${label} left`,
  revoke: "Revoke",
  again: "Ask again",
  empty: "Nothing is asking for permission.",
  loading: "Loading the request",
  risk: { safe: "Safe", risky: "Risky", destructive: "Destructive" },
}

function resolveLabels(partial?: Partial<PermissionRequestLabels>): PermissionRequestLabels {
  return {
    ...permissionLabels,
    ...partial,
    scopes: { ...permissionLabels.scopes, ...partial?.scopes },
    risk: { ...permissionLabels.risk, ...partial?.risk },
  }
}

export function permissionScopes(risk: PermissionRisk, scopes: readonly PermissionScope[] = PERMISSION_SCOPES) {
  const next = scopes.filter((scope) => risk !== "destructive" || scope !== "always")
  return next.length > 0 ? next : (["once"] as PermissionScope[])
}

export function PermissionRequest<TMeta = unknown>({
  agent,
  action,
  target,
  risk = "risky",
  reason,
  preview = [],
  previewLimit = 3,
  scopes,
  scope: scopeProp,
  defaultScope = "once",
  onScopeChange,
  duration = "1 hour",
  decision = null,
  onDecisionChange,
  loading = false,
  error,
  className,
  labels: labelOverrides,
}: {
  agent?: { name: string; meta?: TMeta }
  action?: string
  target?: string
  risk?: PermissionRisk
  reason?: string
  preview?: readonly PermissionPreview<TMeta>[]
  previewLimit?: number
  scopes?: readonly PermissionScope[]
  scope?: PermissionScope
  defaultScope?: PermissionScope
  onScopeChange?: (scope: PermissionScope) => void
  duration?: string
  decision?: PermissionDecision | null
  onDecisionChange?: (decision: PermissionDecision | null) => void
  loading?: boolean
  error?: string
  className?: string
  labels?: Partial<PermissionRequestLabels>
}) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const choices = permissionScopes(risk, scopes ?? PERMISSION_SCOPES)
  const [localScope, setLocalScope] = React.useState(choices.includes(defaultScope) ? defaultScope : (choices[0] ?? "once"))
  const scope = choices.includes(scopeProp ?? localScope) ? (scopeProp ?? localScope) : (choices[0] ?? "once")
  const [open, setOpen] = React.useState(false)
  const shown = open ? preview : preview.slice(0, previewLimit)
  const hidden = Math.max(0, preview.length - shown.length)
  const heading = agent && action ? labels.title(agent.name, action) : labels.empty

  function choose(next: PermissionScope) {
    if (!choices.includes(next)) return
    if (scopeProp == null) setLocalScope(next)
    onScopeChange?.(next)
  }

  function allow() {
    onDecisionChange?.({ allow: true, scope })
  }

  function deny() {
    onDecisionChange?.({ allow: false })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const targetNode = event.target as HTMLElement
    if (targetNode.closest("textarea, input")) return
    if (event.key === "Escape") {
      event.preventDefault()
      deny()
      return
    }
    if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && choices.length > 1) {
      event.preventDefault()
      const index = choices.indexOf(scope)
      const step = event.key === "ArrowRight" ? 1 : -1
      const next = choices[(index + step + choices.length) % choices.length]
      if (next) choose(next)
      return
    }
    if (event.key === "Enter" && !targetNode.closest("button")) {
      event.preventDefault()
      allow()
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      onKeyDown={decision ? undefined : onKeyDown}
      className={cn("flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)}
    >
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-28 w-full motion-reduce:animate-none" />
        </div>
      ) : error && !action ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : !action || !agent ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : decision ? (
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={titleId} className="font-medium">
            {heading}
          </h2>
          <p role="status" className="text-xs">
            {decision.allow ? labels.allowed(decision.scope ?? "once", duration) : labels.denied}
            {decision.allow && decision.left ? ` · ${labels.left(decision.left)}` : ""}
          </p>
          <Button type="button" size="sm" variant="outline" className="ms-auto" onClick={() => onDecisionChange?.(null)}>
            {decision.allow ? labels.revoke : labels.again}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <header className="flex flex-col gap-1">
            <h2 id={titleId} className="font-medium">
              {heading}
            </h2>
            {target ? <p className="text-xs text-muted-foreground">{target}</p> : null}
            <Badge variant={risk === "destructive" ? "destructive" : risk === "safe" ? "secondary" : "outline"} className="self-start">
              {labels.risk[risk]}
            </Badge>
          </header>
          {reason ? (
            <p>
              <span className="text-muted-foreground">{labels.reason}. </span>
              {reason}
            </p>
          ) : null}
          {preview.length > 0 ? (
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-medium text-muted-foreground">
                {labels.preview} {preview.length}
              </h3>
              <ul className="flex flex-col gap-1">
                {shown.map((row) => (
                  <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border px-2 py-1">
                    <span className="min-w-0">{row.label}</span>
                    {row.meta ? <span className="text-xs text-muted-foreground">{row.meta}</span> : null}
                  </li>
                ))}
              </ul>
              {preview.length > previewLimit ? (
                <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => setOpen((value) => !value)}>
                  {open ? labels.less : labels.more(hidden)}
                </Button>
              ) : null}
            </div>
          ) : null}
          {choices.length > 1 ? (
            <div role="radiogroup" aria-label={labels.scope} className="flex flex-wrap gap-1">
              {choices.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={scope === option}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    scope === option ? "border-ring bg-muted" : "border-border",
                  )}
                  onClick={() => choose(option)}
                >
                  {labels.scopes[option]}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={risk === "destructive" ? "destructive" : "default"} className="h-auto whitespace-normal" aria-keyshortcuts="Enter" onClick={allow}>
              {labels.allowNamed(scope, duration)}
            </Button>
            <Button type="button" size="sm" variant="outline" aria-keyshortcuts="Escape" onClick={deny}>
              {labels.deny}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
