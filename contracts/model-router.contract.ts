/**
 * Family contract for the model router.
 * A later variant must keep these types and the per-1K blend in
 * `model-router-cost.ts`. That blend is the candidate call site for the
 * cost-waterfall pricing core. This contract does not price input, output,
 * or cache rates, and it does not describe a per-step cost chart.
 */

import { blendCostPer1k, formatRouterAmount } from "@/registry/lib/model-router-cost"
import { canDeploy, setRouteShare, validatePolicy, type ModelMetrics, type ModelRoute, type RouterPolicy } from "@/registry/lib/model-router"
import type { ModelRouterProps } from "@/registry/ui/model-router"

export type ModelRouterFamily = {
  policy: RouterPolicy
  route: ModelRoute
  metrics: ModelMetrics
  props: ModelRouterProps
}

export function assertModelRouterContract() {
  const routes: ModelRoute[] = [
    { id: "a", name: "A", vendor: "Taller", share: 40, metrics: { p95Ms: 100, p99Ms: 200, amountPer1k: 1, errorRate: 0.01 } },
    { id: "b", name: "B", vendor: "Taller", share: 60, metrics: { p95Ms: 100, p99Ms: 200, amountPer1k: 3, errorRate: 0.01 } },
  ]
  const policy: RouterPolicy = {
    id: "c",
    name: "Contrato",
    environmentId: "demo",
    preset: "balanced",
    routes,
    fallback: { enabled: true, modelIds: ["a", "b"] },
  }
  const next = setRouteShare(policy.routes, "a", 100)
  if (next.reduce((sum, route) => sum + route.share, 0) !== 100) throw new Error("shares must sum to 100")
  if (blendCostPer1k([{ share: 50, amountPer1k: 2 }, { share: 50, amountPer1k: 4 }]) !== 3) {
    throw new Error("blend must stay a local per-1K weight")
  }
  if (!formatRouterAmount(1, { locale: "es-MX", currency: "MXN" })) throw new Error("Intl currency format")
  if (!canDeploy(policy)) throw new Error("valid policy should deploy")
  const broken: RouterPolicy = {
    ...policy,
    routes: [{ id: "bare", name: "Bare", vendor: "Taller", share: 100 }],
    fallback: { enabled: true, modelIds: ["bare", "bare"] },
  }
  const codes = validatePolicy(broken).map((issue) => issue.code)
  if (!codes.includes("missing-metrics") || !codes.includes("fallback-cycle") || !codes.includes("fallback-duplicate")) {
    throw new Error("contract validation drifted")
  }
}
