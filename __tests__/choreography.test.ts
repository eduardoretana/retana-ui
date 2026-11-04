import { describe, expect, it } from "vitest"

import { choreography, resizeFadeDuration, staggerDelaySeconds } from "@/registry/lib/motion"

describe("choreography budgets", () => {
  it("keeps a product stagger under 300ms, with shrinking gaps and a capped tail", () => {
    const delays = Array.from({ length: 12 }, (_, index) => staggerDelaySeconds(index))
    expect(delays[0]).toBe(0)
    expect(delays[1]).toBeGreaterThanOrEqual(0.03)
    expect(delays[1]).toBeLessThanOrEqual(0.08)
    expect(delays[2] - delays[1]).toBeLessThan(delays[1] - delays[0])
    expect(delays[11]).toBe(delays[5])
    expect(Math.max(...delays)).toBeLessThan(choreography.productCeiling)
  })

  it("uses a wider marketing step and still stops growing", () => {
    const early = staggerDelaySeconds(1, { step: choreography.marketingStep })
    const last = staggerDelaySeconds(20, { step: choreography.marketingStep })
    expect(early).toBeGreaterThanOrEqual(0.1)
    expect(early).toBeLessThanOrEqual(0.15)
    expect(last).toBeLessThanOrEqual(choreography.marketingCeiling)
    expect(last).toBe(staggerDelaySeconds(5, { step: choreography.marketingStep }))
  })

  it("scales a view-swap fade with the height delta and clamps it", () => {
    expect(resizeFadeDuration(0)).toBe(0.15)
    expect(resizeFadeDuration(50)).toBe(0.15)
    expect(resizeFadeDuration(100)).toBeCloseTo(0.2)
    expect(resizeFadeDuration(200)).toBe(0.27)
    expect(resizeFadeDuration(Number.NaN)).toBe(0.15)
  })
})
