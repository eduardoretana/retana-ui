/**
 * Routing policy for a host CRM. Pure data: no theme, no fetch.
 * Clean-room. The interaction was observed; no source or sample payload was copied.
 *
 * Per-1K blending lives in `model-router-cost.ts`. That module is the candidate
 * call site for the cost-waterfall pricing core. This file does not price
 * input, output, or cache rates, and it does not draw a cost-by-step chart.
 */

import { blendCostPer1k } from "@/registry/retana/lib/model-router-cost"

export const ROUTING_PRESETS = ["cost", "balanced", "quality"] as const

export type RoutingPreset = (typeof ROUTING_PRESETS)[number]

export type ModelMetrics = {
  /** Milliseconds. */
  p95Ms: number
  /** Milliseconds. */
  p99Ms: number
  /**
   * Amount per 1,000 tokens in the policy currency.
   * The host fills this. Pricing per 1M (input, output, cache read, cache write)
   * belongs to the cost-waterfall core; see `blendCostPer1k`.
   */
  amountPer1k: number
  /** Fraction from 0 to 1. */
  errorRate: number
}

export type ModelRoute = {
  id: string
  name: string
  vendor: string
  /** Integer percent. A normalized policy sums to 100. */
  share: number
  metrics?: ModelMetrics
}

export type FallbackChain = {
  enabled: boolean
  /** Ordered model ids. The first id is tried first. */
  modelIds: readonly string[]
}

export type RouterEnvironment = {
  id: string
  label: string
}

export type RouterPolicy = {
  id: string
  name: string
  environmentId: string
  preset: RoutingPreset
  routes: readonly ModelRoute[]
  fallback: FallbackChain
}

export type PolicyIssueCode =
  | "shares"
  | "fallback-duplicate"
  | "fallback-cycle"
  | "fallback-unknown"
  | "missing-metrics"

export type PolicyIssue = {
  code: PolicyIssueCode
  modelId?: string
}

export type PolicyChange =
  | { kind: "preset"; from: RoutingPreset; to: RoutingPreset }
  | { kind: "environment"; from: string; to: string }
  | { kind: "share"; modelId: string; from: number; to: number }
  | { kind: "fallback-enabled"; from: boolean; to: boolean }
  | { kind: "fallback-order"; from: readonly string[]; to: readonly string[] }
  | { kind: "route-added"; modelId: string }
  | { kind: "route-removed"; modelId: string }

export type BlendedCost = {
  /** Amount per 1K tokens across the shares that have a price, in the policy currency. */
  amountPer1k: number
  /** Percent points included in the blend. */
  coveredShare: number
  /** True when every percent point has a price. */
  complete: boolean
}

const PRICE_FLOOR = 0.000001

function cloneRoute(route: ModelRoute, share: number): ModelRoute {
  if (route.metrics) return { ...route, share, metrics: { ...route.metrics } }
  return { ...route, share }
}

/** Largest remainder. Ties go to the earlier index. */
export function allocateInteger(total: number, weights: readonly number[]): number[] {
  const count = weights.length
  if (count === 0 || total <= 0) return weights.map(() => 0)
  const safe = weights.map((weight) => (Number.isFinite(weight) && weight > 0 ? weight : 0))
  const sum = safe.reduce((acc, weight) => acc + weight, 0)
  const raw =
    sum > 0
      ? safe.map((weight) => (total * weight) / sum)
      : safe.map(() => total / count)
  const floors = raw.map((value) => Math.floor(value))
  let left = total - floors.reduce((acc, value) => acc + value, 0)
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  for (const entry of order) {
    if (left <= 0) break
    const current = floors[entry.index]
    if (current == null) continue
    floors[entry.index] = current + 1
    left -= 1
  }
  return floors
}

function weightsFor(routes: readonly ModelRoute[], preset: RoutingPreset): number[] {
  if (preset === "balanced") return routes.map(() => 1)
  return routes.map((route) => {
    const metrics = route.metrics
    if (!metrics) return 0
    if (preset === "cost") return 1 / Math.max(metrics.amountPer1k, PRICE_FLOOR)
    return 1 / (metrics.errorRate * 1000 + Math.max(metrics.p95Ms, 1))
  })
}

export function applyPreset(routes: readonly ModelRoute[], preset: RoutingPreset): ModelRoute[] {
  if (routes.length === 0) return []
  if (routes.length === 1) {
    const only = routes[0]
    return only ? [cloneRoute(only, 100)] : []
  }
  const shares = allocateInteger(100, weightsFor(routes, preset))
  return routes.map((route, index) => cloneRoute(route, shares[index] ?? 0))
}

/**
 * Sets one share and redistributes the rest.
 * The edited share is kept (clamped to an integer 0–100). The other shares
 * keep their ratios. An all-zero remainder is split evenly, earliest index first.
 */
export function setRouteShare(routes: readonly ModelRoute[], routeId: string, nextShare: number): ModelRoute[] {
  if (routes.length === 0) return []
  if (routes.length === 1) {
    const only = routes[0]
    return only ? [cloneRoute(only, 100)] : []
  }
  const index = routes.findIndex((route) => route.id === routeId)
  if (index < 0) return routes.map((route) => cloneRoute(route, route.share))
  const clamped = Math.min(100, Math.max(0, Math.round(nextShare)))
  const others = routes.filter((route) => route.id !== routeId)
  const assigned = allocateInteger(
    100 - clamped,
    others.map((route) => route.share),
  )
  let cursor = 0
  return routes.map((route) => {
    if (route.id === routeId) return cloneRoute(route, clamped)
    const share = assigned[cursor] ?? 0
    cursor += 1
    return cloneRoute(route, share)
  })
}

export function blendedCost(routes: readonly ModelRoute[]): BlendedCost {
  const priced = routes.flatMap((route) =>
    route.metrics ? [{ share: route.share, amountPer1k: route.metrics.amountPer1k }] : [],
  )
  const amountPer1k = blendCostPer1k(priced)
  const coveredShare = priced.reduce((sum, slice) => sum + slice.share, 0)
  const complete = routes.length === 0 || coveredShare === 100
  return { amountPer1k, coveredShare, complete }
}

export function weightedP95(routes: readonly ModelRoute[]): number | null {
  let weight = 0
  let total = 0
  for (const route of routes) {
    if (!route.metrics || route.share <= 0) continue
    weight += route.share
    total += route.share * route.metrics.p95Ms
  }
  if (weight === 0) return null
  return total / weight
}

export function weightedErrorRate(routes: readonly ModelRoute[]): number | null {
  let weight = 0
  let total = 0
  for (const route of routes) {
    if (!route.metrics || route.share <= 0) continue
    weight += route.share
    total += route.share * route.metrics.errorRate
  }
  if (weight === 0) return null
  return total / weight
}

export function validatePolicy(policy: RouterPolicy): PolicyIssue[] {
  const issues: PolicyIssue[] = []
  const sum = policy.routes.reduce((acc, route) => acc + route.share, 0)
  const sharesBroken =
    policy.routes.some((route) => !Number.isInteger(route.share) || route.share < 0 || route.share > 100) ||
    (policy.routes.length > 0 ? sum !== 100 : sum !== 0)
  if (sharesBroken) issues.push({ code: "shares" })

  for (const route of policy.routes) {
    if (!route.metrics) issues.push({ code: "missing-metrics", modelId: route.id })
  }

  const known = new Set(policy.routes.map((route) => route.id))
  const seen = new Set<string>()
  for (const modelId of policy.fallback.modelIds) {
    if (!known.has(modelId)) issues.push({ code: "fallback-unknown", modelId })
    if (seen.has(modelId)) {
      issues.push({ code: "fallback-duplicate", modelId })
      issues.push({ code: "fallback-cycle", modelId })
    } else {
      seen.add(modelId)
    }
  }
  return issues
}

export function canDeploy(policy: RouterPolicy): boolean {
  return validatePolicy(policy).length === 0 && policy.routes.length > 0
}

function sameIds(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

export function diffPolicy(deployed: RouterPolicy, draft: RouterPolicy): PolicyChange[] {
  const changes: PolicyChange[] = []
  if (deployed.preset !== draft.preset) changes.push({ kind: "preset", from: deployed.preset, to: draft.preset })
  if (deployed.environmentId !== draft.environmentId) {
    changes.push({ kind: "environment", from: deployed.environmentId, to: draft.environmentId })
  }
  const deployedRoutes = new Map(deployed.routes.map((route) => [route.id, route]))
  const draftRoutes = new Map(draft.routes.map((route) => [route.id, route]))
  for (const route of draft.routes) {
    const previous = deployedRoutes.get(route.id)
    if (!previous) changes.push({ kind: "route-added", modelId: route.id })
    else if (previous.share !== route.share) {
      changes.push({ kind: "share", modelId: route.id, from: previous.share, to: route.share })
    }
  }
  for (const route of deployed.routes) {
    if (!draftRoutes.has(route.id)) changes.push({ kind: "route-removed", modelId: route.id })
  }
  if (deployed.fallback.enabled !== draft.fallback.enabled) {
    changes.push({ kind: "fallback-enabled", from: deployed.fallback.enabled, to: draft.fallback.enabled })
  }
  if (!sameIds(deployed.fallback.modelIds, draft.fallback.modelIds)) {
    changes.push({ kind: "fallback-order", from: deployed.fallback.modelIds, to: draft.fallback.modelIds })
  }
  return changes
}

export function withPreset(policy: RouterPolicy, preset: RoutingPreset): RouterPolicy {
  return { ...policy, preset, routes: applyPreset(policy.routes, preset) }
}

export function withShare(policy: RouterPolicy, routeId: string, share: number): RouterPolicy {
  return { ...policy, routes: setRouteShare(policy.routes, routeId, share) }
}

export function withFallbackEnabled(policy: RouterPolicy, enabled: boolean): RouterPolicy {
  return { ...policy, fallback: { ...policy.fallback, enabled } }
}

export function moveFallback(policy: RouterPolicy, index: number, direction: -1 | 1): RouterPolicy {
  const ids = [...policy.fallback.modelIds]
  const next = index + direction
  const current = ids[index]
  const swap = ids[next]
  if (current == null || swap == null) return policy
  ids[index] = swap
  ids[next] = current
  return { ...policy, fallback: { ...policy.fallback, modelIds: ids } }
}

export function removeFallback(policy: RouterPolicy, modelId: string): RouterPolicy {
  return {
    ...policy,
    fallback: { ...policy.fallback, modelIds: policy.fallback.modelIds.filter((id) => id !== modelId) },
  }
}

export function addFallback(policy: RouterPolicy, modelId: string): RouterPolicy {
  if (policy.fallback.modelIds.includes(modelId)) return policy
  if (!policy.routes.some((route) => route.id === modelId)) return policy
  return { ...policy, fallback: { ...policy.fallback, modelIds: [...policy.fallback.modelIds, modelId] } }
}
