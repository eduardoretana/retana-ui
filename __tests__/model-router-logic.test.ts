import { describe, expect, it } from "vitest"

import { assertModelRouterContract } from "@/contracts/model-router.contract"
import { blendCostPer1k, formatRouterAmount } from "@/registry/lib/model-router-cost"
import {
  addFallback,
  allocateInteger,
  applyPreset,
  blendedCost,
  canDeploy,
  diffPolicy,
  moveFallback,
  setRouteShare,
  validatePolicy,
  withShare,
  type ModelRoute,
  type RouterPolicy,
} from "@/registry/lib/model-router"

function route(partial: Pick<ModelRoute, "id" | "share"> & { usd?: number; error?: number; p95?: number; metrics?: false }): ModelRoute {
  const base = {
    id: partial.id,
    name: partial.id,
    vendor: "Taller",
    share: partial.share,
  }
  if (partial.metrics === false) return base
  return {
    ...base,
    metrics: {
      p95Ms: partial.p95 ?? 800,
      p99Ms: 2000,
      amountPer1k: partial.usd ?? 0.01,
      errorRate: partial.error ?? 0.01,
    },
  }
}

function policy(routes: ModelRoute[], fallback: string[] = []): RouterPolicy {
  return {
    id: "pol-1",
    name: "Política v3",
    environmentId: "bandeja",
    preset: "balanced",
    routes,
    fallback: { enabled: true, modelIds: fallback },
  }
}

describe("model router policy", () => {
  it("holds the family contract", () => {
    expect(() => assertModelRouterContract()).not.toThrow()
  })

  it("splits a balanced preset into integers that sum to 100, earliest index first", () => {
    const routes = applyPreset([route({ id: "a", share: 0 }), route({ id: "b", share: 0 }), route({ id: "c", share: 0 })], "balanced")
    expect(routes.map((item) => item.share)).toEqual([34, 33, 33])
    expect(routes.reduce((sum, item) => sum + item.share, 0)).toBe(100)
  })

  it("keeps the edited share and gives the remainder to the others", () => {
    const next = setRouteShare(
      [route({ id: "a", share: 25 }), route({ id: "b", share: 25 }), route({ id: "c", share: 25 }), route({ id: "d", share: 25 })],
      "b",
      10,
    )
    expect(next.map((item) => item.share)).toEqual([30, 10, 30, 30])
    expect(next.reduce((sum, item) => sum + item.share, 0)).toBe(100)
  })

  it("puts 100 on one route and 0 on the rest", () => {
    const next = setRouteShare(
      [route({ id: "a", share: 40 }), route({ id: "b", share: 40 }), route({ id: "c", share: 20 })],
      "a",
      100,
    )
    expect(next.map((item) => item.share)).toEqual([100, 0, 0])
  })

  it("redistributes a share of 0 without negative percents", () => {
    const next = setRouteShare(
      [route({ id: "a", share: 50 }), route({ id: "b", share: 50 })],
      "a",
      0,
    )
    expect(next.map((item) => item.share)).toEqual([0, 100])
  })

  it("is deterministic for the same weights", () => {
    const weights = [1, 0, 3, 0, 2]
    expect(allocateInteger(100, weights)).toEqual(allocateInteger(100, weights))
    expect(allocateInteger(100, [0, 0, 0])).toEqual([34, 33, 33])
  })

  it("weights cost toward the cheaper model", () => {
    const routes = applyPreset(
      [route({ id: "dear", share: 0, usd: 0.04 }), route({ id: "cheap", share: 0, usd: 0.01 })],
      "cost",
    )
    const cheap = routes.find((item) => item.id === "cheap")
    const dear = routes.find((item) => item.id === "dear")
    expect(cheap && dear && cheap.share > dear.share).toBe(true)
    expect((cheap?.share ?? 0) + (dear?.share ?? 0)).toBe(100)
  })

  it("weights quality toward the lower error and latency", () => {
    const routes = applyPreset(
      [
        route({ id: "rough", share: 0, error: 0.2, p95: 4000 }),
        route({ id: "fine", share: 0, error: 0.001, p95: 400 }),
      ],
      "quality",
    )
    const fine = routes.find((item) => item.id === "fine")
    const rough = routes.find((item) => item.id === "rough")
    expect(fine && rough && fine.share > rough.share).toBe(true)
  })

  it("gives a model without metrics no preset weight", () => {
    const routes = applyPreset(
      [route({ id: "priced", share: 10, usd: 0.02 }), route({ id: "bare", share: 90, metrics: false })],
      "cost",
    )
    expect(routes.find((item) => item.id === "bare")?.share).toBe(0)
    expect(routes.find((item) => item.id === "priced")?.share).toBe(100)
  })

  it("locks a single route at 100", () => {
    expect(setRouteShare([route({ id: "only", share: 40 })], "only", 10).map((item) => item.share)).toEqual([100])
  })

  it("flags shares that do not sum to 100, a repeated fallback, and missing metrics", () => {
    const issues = validatePolicy(
      policy(
        [route({ id: "a", share: 40 }), route({ id: "bare", share: 40, metrics: false })],
        ["a", "a", "missing"],
      ),
    )
    expect(issues.map((issue) => issue.code)).toEqual([
      "shares",
      "missing-metrics",
      "fallback-duplicate",
      "fallback-cycle",
      "fallback-unknown",
    ])
    expect(canDeploy(policy([route({ id: "a", share: 100 })], ["a"]))).toBe(true)
    expect(canDeploy(policy([route({ id: "bare", share: 100, metrics: false })]))).toBe(false)
  })

  it("computes a live blended cost and leaves it incomplete without a price", () => {
    const full = blendedCost([
      route({ id: "a", share: 25, usd: 0.01 }),
      route({ id: "b", share: 75, usd: 0.02 }),
    ])
    expect(full.complete).toBe(true)
    expect(full.amountPer1k).toBeCloseTo(0.0175)
    const partial = blendedCost([route({ id: "a", share: 40, usd: 0.01 }), route({ id: "bare", share: 60, metrics: false })])
    expect(partial.complete).toBe(false)
    expect(partial.amountPer1k).toBeCloseTo(0.004)
  })

  it("blends per 1K locally and formats USD or MXN with Intl", () => {
    expect(blendCostPer1k([
      { share: 25, amountPer1k: 0.2 },
      { share: 75, amountPer1k: 0.4 },
    ])).toBeCloseTo(0.35)
    expect(blendCostPer1k([{ share: Number.NaN, amountPer1k: 9 }])).toBe(0)
    const usd = formatRouterAmount(0.35, { locale: "en-US", currency: "USD" })
    const mxn = formatRouterAmount(12.5, { locale: "es-MX", currency: "MXN" })
    expect(usd).toContain("0.35")
    expect(mxn).toMatch(/MXN|\$/)
    expect(mxn).not.toBe(usd)
  })

  it("diffs a draft against the deployed policy", () => {
    const deployed = policy([route({ id: "a", share: 60 }), route({ id: "b", share: 40 })], ["a", "b"])
    const draft = withShare({ ...deployed, preset: "cost" }, "a", 80)
    const kinds = diffPolicy(deployed, draft).map((change) => change.kind)
    expect(kinds).toContain("preset")
    expect(kinds).toContain("share")
    expect(diffPolicy(deployed, deployed)).toEqual([])
  })

  it("refuses a duplicate fallback and moves the chain by index", () => {
    const base = policy([route({ id: "a", share: 50 }), route({ id: "b", share: 50 })], ["a"])
    expect(addFallback(base, "a").fallback.modelIds).toEqual(["a"])
    expect(addFallback(base, "nope").fallback.modelIds).toEqual(["a"])
    const both = addFallback(base, "b")
    expect(moveFallback(both, 0, 1).fallback.modelIds).toEqual(["b", "a"])
    expect(moveFallback(both, 0, -1).fallback.modelIds).toEqual(["a", "b"])
  })
})
