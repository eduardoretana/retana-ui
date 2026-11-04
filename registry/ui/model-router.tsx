"use client"

/**
 * Clean-room routing desk. The layout and motion were observed in a public
 * post that ships no code and no license. No source, sample payload, or asset
 * was copied. The host applies the policy through onDeployRequest.
 */

import * as React from "react"
import { ArrowDown, ArrowUp, LoaderCircle, Plus, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatRouterAmount } from "@/registry/retana/lib/model-router-cost"
import {
  addFallback,
  blendedCost,
  canDeploy,
  diffPolicy,
  moveFallback,
  removeFallback,
  validatePolicy,
  weightedErrorRate,
  weightedP95,
  withFallbackEnabled,
  withPreset,
  withShare,
  type PolicyChange,
  type PolicyIssue,
  type RouterEnvironment,
  type RouterPolicy,
  type RoutingPreset,
} from "@/registry/retana/lib/model-router"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { StatusPill } from "@/registry/retana/ui/status-pill"

export type ModelRouterStatus = "ready" | "loading" | "error"

export type ModelRouterDeployPhase = "pending" | "success" | "error"

export type ModelRouterClassNames = {
  root?: string
  diagram?: string
  table?: string
}

export type ModelRouterLabels = {
  title: string
  environment: string
  blended: string
  perThousand: string
  vsLive: string
  sameAsLive: string
  incomplete: string
  preset: string
  cost: string
  balanced: string
  quality: string
  diagram: string
  gateway: string
  routes: string
  model: string
  share: string
  latency: string
  price: string
  errors: string
  fallback: string
  fallbackHint: string
  moveUp: string
  moveDown: string
  removeFallback: string
  addFallback: string
  unsaved: string
  live: string
  deploy: string
  deploying: string
  deployed: string
  deployError: string
  readOnly: string
  emptyTitle: string
  emptyDescription: string
  loading: string
  errorTitle: string
  shareInvalid: string
  noMetrics: string
  diffPreset: string
  diffEnvironment: string
  diffFallbackOn: string
  diffFallbackOff: string
  diffFallbackOrder: string
  diffRouteAdded: string
  diffRouteRemoved: string
  shareLabel: (name: string) => string
  missingMetrics: (name: string) => string
  fallbackDuplicate: (name: string) => string
  fallbackCycle: (name: string) => string
  fallbackUnknown: (name: string) => string
  diagramSummary: (parts: string) => string
  diffShare: (name: string, from: number, to: number) => string
  chainLabel: (name: string, index: number, total: number) => string
}

export type ModelRouterProps = {
  policy: RouterPolicy
  deployed: RouterPolicy
  environments: readonly RouterEnvironment[]
  onPolicyChange: (policy: RouterPolicy) => void
  onDeployRequest: (policy: RouterPolicy) => Promise<void>
  onEnvironmentChange?: (environmentId: string) => void
  status?: ModelRouterStatus
  readOnly?: boolean
  error?: string
  labels?: Partial<ModelRouterLabels>
  /** BCP 47 tag for `Intl` money and percents. */
  locale?: string
  /** ISO 4217 code. The amounts on each route are already in this currency. */
  currency?: string
  deployPhase?: ModelRouterDeployPhase
  className?: string
  classNames?: ModelRouterClassNames
}

const TONE = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"] as const

const defaultLabels: ModelRouterLabels = {
  title: "Model router",
  environment: "Environment",
  blended: "Blended cost",
  perThousand: "per 1K tokens",
  vsLive: "vs live",
  sameAsLive: "Same as live",
  incomplete: "Incomplete price",
  preset: "Routing preset",
  cost: "Cost",
  balanced: "Balanced",
  quality: "Quality",
  diagram: "Traffic split",
  gateway: "Gateway",
  routes: "Routes",
  model: "Model",
  share: "Share",
  latency: "p95 / p99",
  price: "USD / 1K",
  errors: "Errors",
  fallback: "Fallback",
  fallbackHint: "If the first model fails, try the next.",
  moveUp: "Move up",
  moveDown: "Move down",
  removeFallback: "Remove from fallback",
  addFallback: "Add to fallback",
  unsaved: "Unsaved changes",
  live: "Live",
  deploy: "Deploy policy",
  deploying: "Deploying policy",
  deployed: "Policy deployed",
  deployError: "The policy was not deployed. The editor shows this draft again.",
  readOnly: "You can view this policy. Deploy is not available for this role.",
  emptyTitle: "No models",
  emptyDescription: "The catalog has no models to route yet.",
  loading: "Loading the policy",
  errorTitle: "The policy did not load",
  shareInvalid: "Shares must add up to 100%.",
  noMetrics: "No metrics",
  diffPreset: "Preset",
  diffEnvironment: "Environment",
  diffFallbackOn: "Fallback on",
  diffFallbackOff: "Fallback off",
  diffFallbackOrder: "Fallback order",
  diffRouteAdded: "Route added",
  diffRouteRemoved: "Route removed",
  shareLabel: (name) => `Share for ${name}`,
  missingMetrics: (name) => `${name} has no metrics`,
  fallbackDuplicate: (name) => `${name} is listed twice in the fallback`,
  fallbackCycle: (name) => `The fallback returns to ${name}`,
  fallbackUnknown: (name) => `${name} is not a route`,
  diagramSummary: (parts) => `Traffic split. ${parts}`,
  diffShare: (name, from, to) => `${name} share ${from}% to ${to}%`,
  chainLabel: (name, index, total) => `${name}, step ${index} of ${total}`,
}

function labelsFrom(partial?: Partial<ModelRouterLabels>): ModelRouterLabels {
  return { ...defaultLabels, ...partial }
}

function percent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(value)
}

function seconds(ms: number) {
  return (ms / 1000).toFixed(2)
}

function shortName(name: string) {
  return name.length > 22 ? `${name.slice(0, 21)}…` : name
}

function issueText(issue: PolicyIssue, policy: RouterPolicy, labels: ModelRouterLabels) {
  const name = policy.routes.find((route) => route.id === issue.modelId)?.name ?? issue.modelId ?? ""
  if (issue.code === "shares") return labels.shareInvalid
  if (issue.code === "missing-metrics") return labels.missingMetrics(name)
  if (issue.code === "fallback-duplicate") return labels.fallbackDuplicate(name)
  if (issue.code === "fallback-cycle") return labels.fallbackCycle(name)
  return labels.fallbackUnknown(name)
}

function changeText(change: PolicyChange, policy: RouterPolicy, deployed: RouterPolicy, labels: ModelRouterLabels) {
  const nameOf = (id: string) =>
    policy.routes.find((route) => route.id === id)?.name ??
    deployed.routes.find((route) => route.id === id)?.name ??
    id
  if (change.kind === "preset") return `${labels.diffPreset}: ${change.from} → ${change.to}`
  if (change.kind === "environment") return `${labels.diffEnvironment}: ${change.from} → ${change.to}`
  if (change.kind === "share") return labels.diffShare(nameOf(change.modelId), change.from, change.to)
  if (change.kind === "fallback-enabled") return change.to ? labels.diffFallbackOn : labels.diffFallbackOff
  if (change.kind === "fallback-order") return labels.diffFallbackOrder
  if (change.kind === "route-added") return `${labels.diffRouteAdded}: ${nameOf(change.modelId)}`
  return `${labels.diffRouteRemoved}: ${nameOf(change.modelId)}`
}

function useQuietMotion() {
  const fromConfig = useReducedMotion()
  const [fromMedia, setFromMedia] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setFromMedia(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return fromConfig === true || fromMedia
}

function FlowDiagram({
  policy,
  labels,
  className,
}: {
  policy: RouterPolicy
  labels: ModelRouterLabels
  className?: string
}) {
  const reduced = useQuietMotion()
  const allowParticles = !reduced
  const routes = policy.routes
  const height = Math.max(168, routes.length * 32 + 24)
  const sourceY = height / 2
  const rowHeight = routes.length ? (height - 24) / routes.length : 0
  const summary = labels.diagramSummary(
    routes.map((route) => `${route.name} ${route.share}%`).join(". "),
  )
  const summaryId = React.useId()

  return (
    <figure className={cn("min-w-0", className)} aria-labelledby={summaryId} data-particles={allowParticles ? "on" : "off"}>
      <figcaption id={summaryId} className="sr-only">
        {summary}
      </figcaption>
      <svg viewBox={`0 0 640 ${height}`} className="h-auto w-full" role="presentation" aria-hidden="true">
        <text x={16} y={sourceY} dominantBaseline="middle" className="fill-current text-xs text-muted-foreground">
          {labels.gateway}
        </text>
        {routes.map((route, index) => {
          const y = 12 + rowHeight * index + rowHeight / 2
          const tone = TONE[index % TONE.length] ?? "text-foreground"
          const width = route.share <= 0 ? 0 : Math.max(2, (route.share / 100) * 22)
          const midX = 300
          return (
            <g key={route.id}>
              {width > 0 ? (
                <path
                  d={`M 88 ${sourceY} C ${midX} ${sourceY}, ${midX} ${y}, 470 ${y}`}
                  fill="none"
                  strokeWidth={width}
                  strokeLinecap="round"
                  className={cn("stroke-current opacity-80", tone)}
                />
              ) : null}
              <text x={488} y={y} dominantBaseline="middle" className="fill-current text-xs text-foreground">
                {shortName(route.name)}
                <title>{`${route.name} ${route.share}%`}</title>
              </text>
              <text x={624} y={y} textAnchor="end" dominantBaseline="middle" className="fill-current text-xs text-muted-foreground tabular-nums">
                {route.share}%
              </text>
              {allowParticles && width > 0 && index < 6 ? (
                <motion.circle
                  r={3}
                  className={cn("fill-current", tone)}
                  data-particle="true"
                  initial={{ opacity: 0 }}
                  animate={{
                    x: [88, midX, 470],
                    y: [sourceY, (sourceY + y) / 2, y],
                    opacity: [0, 0.95, 0],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.35, ease: "linear" }}
                />
              ) : null}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function ModelRouter({
  policy,
  deployed,
  environments,
  onPolicyChange,
  onDeployRequest,
  onEnvironmentChange,
  status = "ready",
  readOnly = false,
  error,
  labels: labelOverride,
  locale = "en-US",
  currency = "USD",
  deployPhase,
  className,
  classNames,
}: ModelRouterProps) {
  const labels = labelsFrom(labelOverride)
  const fallbackLabelId = React.useId()
  const [localPhase, setLocalPhase] = React.useState<"idle" | ModelRouterDeployPhase>("idle")
  const [banner, setBanner] = React.useState<"success" | "error" | null>(null)
  const [fallbackPick, setFallbackPick] = React.useState("")
  const mounted = React.useRef(true)
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const phase = localPhase !== "idle" ? localPhase : (deployPhase ?? "idle")
  const locked = readOnly || phase === "pending" || status !== "ready"
  const changes = diffPolicy(deployed, policy)
  const issues = validatePolicy(policy)
  const valid = canDeploy(policy)
  const dirty = changes.length > 0
  const blend = blendedCost(policy.routes)
  const baseline = blendedCost(deployed.routes)
  const money = (amount: number) => formatRouterAmount(amount, { locale, currency })
  const delta = baseline.amountPer1k > 0 ? (blend.amountPer1k - baseline.amountPer1k) / baseline.amountPer1k : null
  const p95 = weightedP95(policy.routes)
  const errorRate = weightedErrorRate(policy.routes)
  const available = policy.routes.filter((route) => !policy.fallback.modelIds.includes(route.id))

  function commit(next: RouterPolicy) {
    setBanner(null)
    setLocalPhase("idle")
    onPolicyChange(next)
  }

  async function deploy() {
    if (!valid || readOnly || phase === "pending") return
    const snapshot = policy
    setBanner(null)
    setLocalPhase("pending")
    try {
      await onDeployRequest(snapshot)
      if (mounted.current) {
        setLocalPhase("idle")
        setBanner("success")
      }
    } catch {
      if (!mounted.current) return
      setLocalPhase("idle")
      setBanner("error")
      onPolicyChange(snapshot)
    }
  }

  function onEnvironment(next: string) {
    if (onEnvironmentChange) onEnvironmentChange(next)
    else commit({ ...policy, environmentId: next })
  }

  return (
    <section
      aria-busy={status === "loading" || phase === "pending"}
      data-readonly={readOnly ? "true" : "false"}
      data-deploy={phase}
      data-unsaved={dirty ? "true" : "false"}
      className={cn("flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm", className, classNames?.root)}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-medium text-balance">{labels.title}</h2>
        <Select value={policy.environmentId} onValueChange={onEnvironment} disabled={locked || environments.length === 0}>
          <SelectTrigger aria-label={labels.environment} className="w-full sm:w-44">
            <SelectValue placeholder={labels.environment}>
              {environments.find((item) => item.id === policy.environmentId)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {environments.map((environment) => (
                <SelectItem key={environment.id} value={environment.id}>
                  {environment.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </header>

      {status === "loading" ? (
        <div className="flex flex-col gap-3" aria-label={labels.loading}>
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>{labels.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "ready" && policy.routes.length === 0 ? (
        <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
      ) : null}

      {status === "ready" && policy.routes.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{labels.blended}</p>
              <p className="text-3xl font-medium tabular-nums tracking-tight">{money(blend.amountPer1k)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {labels.perThousand}
                {delta == null ? null : delta === 0 ? ` · ${labels.sameAsLive}` : ` · ${delta > 0 ? "+" : "−"}${percent(Math.abs(delta), locale)} ${labels.vsLive}`}
                {blend.complete ? null : ` · ${labels.incomplete}`}
                {p95 == null ? null : ` · p95 ${seconds(p95)}`}
                {errorRate == null ? null : ` · ${percent(errorRate, locale)}`}
              </p>
            </div>
            <SegmentedControl
              label={labels.preset}
              value={policy.preset}
              onValueChange={(value) => {
                if (value === "cost" || value === "balanced" || value === "quality") commit(withPreset(policy, value))
              }}
              options={(["cost", "balanced", "quality"] as const satisfies readonly RoutingPreset[]).map((value) => ({
                value,
                label: labels[value],
              }))}
            />
          </div>

          <div className={cn("max-h-80 overflow-auto", classNames?.diagram)}>
            <FlowDiagram policy={policy} labels={labels} />
          </div>

          <div className={cn("min-w-0 overflow-x-auto", classNames?.table)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.model}</TableHead>
                  <TableHead>{labels.share}</TableHead>
                  <TableHead>{labels.latency}</TableHead>
                  <TableHead>{labels.price}</TableHead>
                  <TableHead>{labels.errors}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policy.routes.map((route, index) => {
                  const tone = TONE[index % TONE.length]
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="max-w-40 min-w-0">
                        <span className={cn("block truncate font-medium", tone)} title={route.name}>
                          {route.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground" title={route.vendor}>
                          {route.vendor}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-36">
                        <div className="flex items-center gap-2">
                          <label className="flex min-w-0 flex-1 items-center">
                            <span className="sr-only">{labels.shareLabel(route.name)}</span>
                            <Slider
                              aria-label={labels.shareLabel(route.name)}
                              aria-valuetext={`${route.share}%`}
                              min={0}
                              max={100}
                              step={1}
                              value={[route.share]}
                              disabled={locked || policy.routes.length < 2}
                              className="w-full touch-pan-y"
                              onValueChange={(value) => {
                                const next = value[0]
                                if (next == null) return
                                commit(withShare(policy, route.id, next))
                              }}
                            />
                          </label>
                          <span className="w-10 shrink-0 text-right text-xs tabular-nums">{route.share}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {route.metrics ? `${seconds(route.metrics.p95Ms)} / ${seconds(route.metrics.p99Ms)}` : labels.noMetrics}
                      </TableCell>
                      <TableCell className="tabular-nums">{route.metrics ? money(route.metrics.amountPer1k) : labels.noMetrics}</TableCell>
                      <TableCell className="tabular-nums">{route.metrics ? percent(route.metrics.errorRate, locale) : labels.noMetrics}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {issues.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm text-destructive">
              {issues.map((issue, index) => (
                <li key={`${issue.code}-${issue.modelId ?? index}`}>{issueText(issue, policy, labels)}</li>
              ))}
            </ul>
          ) : null}

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium" id={fallbackLabelId}>
                  {labels.fallback}
                </p>
                <p className="text-xs text-pretty text-muted-foreground">{labels.fallbackHint}</p>
              </div>
              <Switch
                checked={policy.fallback.enabled}
                onCheckedChange={(checked) => commit(withFallbackEnabled(policy, checked))}
                disabled={locked}
                aria-labelledby={fallbackLabelId}
              />
            </div>
            {policy.fallback.enabled ? (
              <ol aria-label={labels.fallback} className="flex flex-col gap-2">
                {policy.fallback.modelIds.map((modelId, index) => {
                  const name = policy.routes.find((route) => route.id === modelId)?.name ?? modelId
                  const total = policy.fallback.modelIds.length
                  return (
                    <li
                      key={`${modelId}-${index}`}
                      tabIndex={locked ? -1 : 0}
                      aria-keyshortcuts="ArrowUp ArrowDown"
                      aria-label={labels.chainLabel(name, index + 1, total)}
                      className="flex min-w-0 items-center gap-2 rounded-md border border-border px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget || locked) return
                        if (event.key === "ArrowUp") {
                          event.preventDefault()
                          commit(moveFallback(policy, index, -1))
                        }
                        if (event.key === "ArrowDown") {
                          event.preventDefault()
                          commit(moveFallback(policy, index, 1))
                        }
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm" title={name}>
                        {index + 1}. {name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${labels.moveUp} ${name}`}
                        disabled={locked || index === 0}
                        onClick={() => commit(moveFallback(policy, index, -1))}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${labels.moveDown} ${name}`}
                        disabled={locked || index === total - 1}
                        onClick={() => commit(moveFallback(policy, index, 1))}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${labels.removeFallback} ${name}`}
                        disabled={locked}
                        onClick={() => commit(removeFallback(policy, modelId))}
                      >
                        <X />
                      </Button>
                    </li>
                  )
                })}
              </ol>
            ) : null}
            {policy.fallback.enabled && available.length > 0 ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={fallbackPick} onValueChange={setFallbackPick} disabled={locked}>
                  <SelectTrigger aria-label={labels.addFallback} className="w-full sm:w-56">
                    <SelectValue placeholder={labels.addFallback}>
                      {available.find((route) => route.id === fallbackPick)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {available.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  disabled={locked || fallbackPick === ""}
                  onClick={() => {
                    commit(addFallback(policy, fallbackPick))
                    setFallbackPick("")
                  }}
                >
                  <Plus data-icon="inline-start" />
                  {labels.addFallback}
                </Button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {readOnly ? <p className="text-sm text-muted-foreground">{labels.readOnly}</p> : null}
      {banner === "error" || phase === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>{labels.deployError}</AlertTitle>
          {error ? <AlertDescription>{error}</AlertDescription> : null}
        </Alert>
      ) : null}
      {banner === "success" || phase === "success" ? <StatusPill label={labels.deployed} tone="positive" /> : null}

      {status === "ready" && changes.length > 0 ? (
        <ul aria-label={labels.unsaved} className="flex flex-col gap-1 text-xs text-muted-foreground">
          {changes.map((change, index) => (
            <li key={`${change.kind}-${index}`}>{changeText(change, policy, deployed, labels)}</li>
          ))}
        </ul>
      ) : null}

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-xs text-muted-foreground" title={policy.name}>
            {policy.name}
          </span>
          {dirty ? <StatusPill label={labels.unsaved} tone="warning" /> : <StatusPill label={labels.live} tone="positive" />}
        </div>
        {readOnly ? null : (
          <Button type="button" disabled={!dirty || !valid || locked} onClick={() => void deploy()}>
            {phase === "pending" ? <LoaderCircle className="animate-spin motion-reduce:animate-none" data-icon="inline-start" /> : null}
            {phase === "pending" ? labels.deploying : labels.deploy}
          </Button>
        )}
      </footer>
    </section>
  )
}
