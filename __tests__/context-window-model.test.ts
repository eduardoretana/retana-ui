import { describe, expect, it } from "vitest"

import {
  allocateTicks,
  applyContextEvent,
  applyContextEvents,
  contextTokenTotal,
  emptyContextModel,
  estimateContextCost,
  explainContextEvent,
  reduceContextStream,
  resolveModelLimit,
  thresholdCrossed,
  thresholdInTokens,
  type ContextEvent,
  type ContextSource,
  type PricingLike,
} from "@/registry/lib/context-window"

const pricing: PricingLike = {
  inputPerMillion: 3,
  outputPerMillion: 15,
  cacheReadPerMillion: 0.3,
  cacheWritePerMillion: 3.75,
}

function source(partial: Partial<ContextSource> & Pick<ContextSource, "id">): ContextSource {
  return {
    kind: "file",
    tokens: 100,
    status: "loaded",
    cached: false,
    cacheTokens: 0,
    pinned: false,
    label: partial.id,
    ...partial,
  }
}

describe("applyContextEvent", () => {
  it("loads a source once and ignores an identical duplicate", () => {
    const chat = source({ id: "charla", kind: "chat", tokens: 45000, label: "Charla del pedido" })
    const once = applyContextEvent(emptyContextModel(), { type: "load", source: chat })
    expect(once.sources).toHaveLength(1)
    expect(explainContextEvent(once, { type: "load", source: chat })).toBe("duplicate")
    expect(applyContextEvent(once, { type: "load", source: chat })).toBe(once)
  })

  it("treats a second load of the same id as an update", () => {
    const first = applyContextEvent(emptyContextModel(), {
      type: "load",
      source: source({ id: "charla", tokens: 10, status: "loading" }),
    })
    const next = applyContextEvent(first, {
      type: "load",
      source: source({ id: "charla", tokens: 45000, status: "loaded" }),
    })
    expect(next.sources).toHaveLength(1)
    expect(next.sources[0]?.tokens).toBe(45000)
    expect(contextTokenTotal(next.sources)).toBe(45000)
  })

  it("drops events that arrive before their source and does not throw", () => {
    const state = emptyContextModel()
    const events: ContextEvent[] = [
      { type: "compact", from: "charla", to: source({ id: "resumen" }), tokensBefore: 100, tokensAfter: 10, note: "tarde" },
      { type: "update", id: "charla", tokens: 20 },
      { type: "evict", id: "charla" },
      { type: "pin", id: "charla" },
      { type: "unpin", id: "nadie" },
      { type: "load", source: source({ id: "", label: "vacío" }) },
    ]
    const next = applyContextEvents(state, events)
    expect(next).toBe(state)
    expect(events.map((event) => explainContextEvent(state, event))).toEqual([
      "missing",
      "missing",
      "missing",
      "missing",
      "missing",
      "missing",
    ])
  })

  it("does not compact a pinned source, even if every source is pinned", () => {
    const pinned = applyContextEvents(emptyContextModel(), [
      { type: "load", source: source({ id: "sistema", kind: "system", pinned: true, tokens: 2400 }) },
      { type: "load", source: source({ id: "charla", kind: "chat", pinned: true, tokens: 45000 }) },
    ])
    const event: ContextEvent = {
      type: "compact",
      from: "charla",
      to: source({ id: "resumen", kind: "chat", label: "Resumen" }),
      tokensBefore: 45000,
      tokensAfter: 5200,
      note: "no",
    }
    expect(explainContextEvent(pinned, event)).toBe("pinned")
    expect(applyContextEvent(pinned, event)).toBe(pinned)
    expect(contextTokenTotal(pinned.sources)).toBe(47400)
  })

  it("replaces chat with a summary and ignores a second compact", () => {
    const loaded = applyContextEvent(emptyContextModel(), {
      type: "load",
      source: source({ id: "charla", kind: "chat", tokens: 45000, label: "Charla del pedido" }),
    })
    const event: ContextEvent = {
      type: "compact",
      from: "charla",
      to: source({ id: "resumen", kind: "chat", label: "Resumen del pedido", summaryOf: "charla" }),
      tokensBefore: 45000,
      tokensAfter: 5200,
      note: "Quedaron las decisiones del esmalte.",
    }
    const compacted = applyContextEvent(loaded, event)
    expect(explainContextEvent(loaded, event)).toBe("applied")
    expect(compacted.sources.map((item) => item.id)).toEqual(["resumen"])
    expect(compacted.sources[0]).toMatchObject({ status: "compacted", tokens: 5200, summaryOf: "charla" })
    expect(compacted.lastCompact).toMatchObject({ freed: 39800, tokensBefore: 45000, tokensAfter: 5200 })
    expect(explainContextEvent(compacted, event)).toBe("missing")
    expect(applyContextEvent(compacted, event)).toBe(compacted)
  })

  it("clamps bad token counts and keeps pin and evict idempotent", () => {
    const loaded = applyContextEvent(emptyContextModel(), {
      type: "load",
      source: source({ id: "foto", tokens: Number.NaN, cached: true, cacheTokens: 50 }),
    })
    expect(loaded.sources[0]).toMatchObject({ tokens: 0, cached: false, cacheTokens: 0 })
    const updated = applyContextEvent(loaded, { type: "update", id: "foto", tokens: -4, status: "loaded" })
    expect(updated.sources[0]?.tokens).toBe(0)
    const pinned = applyContextEvent(updated, { type: "pin", id: "foto" })
    expect(explainContextEvent(pinned, { type: "pin", id: "foto" })).toBe("duplicate")
    expect(applyContextEvent(pinned, { type: "pin", id: "foto" })).toBe(pinned)
    const evicted = applyContextEvent(pinned, { type: "evict", id: "foto" })
    expect(contextTokenTotal(evicted.sources)).toBe(0)
    expect(explainContextEvent(evicted, { type: "evict", id: "foto" })).toBe("duplicate")
    expect(explainContextEvent(evicted, { type: "unpin", id: "foto" })).toBe("applied")
  })

  it("plays a shuffled stream without duplicating tokens", async () => {
    const chat = source({ id: "charla", kind: "chat", tokens: 1000 })
    async function* events() {
      yield { type: "update", id: "charla", tokens: 2000 } satisfies ContextEvent
      yield { type: "load", source: chat } satisfies ContextEvent
      yield { type: "load", source: chat } satisfies ContextEvent
      yield { type: "update", id: "charla", tokens: 2000 } satisfies ContextEvent
    }
    const next = await reduceContextStream(emptyContextModel(), events())
    expect(contextTokenTotal(next.sources)).toBe(2000)
    expect(next.sources).toHaveLength(1)
  })
})

describe("thresholds and limits", () => {
  it("expresses a line in percent or tokens and only reports an upward cross", () => {
    expect(thresholdInTokens({ unit: "percent", value: 90 }, 80_000)).toBe(72_000)
    expect(thresholdInTokens({ unit: "tokens", value: 60_000 }, 80_000)).toBe(60_000)
    expect(thresholdInTokens({ unit: "percent", value: 150 }, 0)).toBe(0)
    expect(thresholdCrossed(50_000, 73_700, 80_000, { unit: "percent", value: 90 })).toBe(true)
    expect(thresholdCrossed(73_700, 73_700, 80_000, { unit: "percent", value: 90 })).toBe(false)
    expect(thresholdCrossed(73_700, 40_000, 80_000, { unit: "tokens", value: 60_000 })).toBe(false)
  })

  it("prefers an injected resolver and falls back to modelLimit", () => {
    const limits: Record<string, number> = { "taller-grande": 80_000 }
    expect(resolveModelLimit({ modelId: "taller-grande", modelLimit: 10, resolveLimit: (id) => limits[id] })).toBe(80_000)
    expect(resolveModelLimit({ modelId: "otro", modelLimit: 16_000, resolveLimit: () => null })).toBe(16_000)
    expect(resolveModelLimit({})).toBe(0)
  })
})

describe("estimateContextCost", () => {
  it("prices input and cache reads per million in USD and MXN", () => {
    const sources = [
      source({ id: "recetas", kind: "memory-long", tokens: 1_000_000, cached: true, cacheTokens: 1_000_000 }),
      source({ id: "charla", kind: "chat", tokens: 2_000_000, cached: true, cacheTokens: 1_000_000 }),
      source({ id: "fuera", tokens: 9_000_000, status: "evicted" }),
    ]
    const usd = estimateContextCost({ sources, pricing, currency: "USD", locale: "en-US" })
    expect(usd.inputTokens).toBe(1_000_000)
    expect(usd.cacheReadTokens).toBe(2_000_000)
    expect(usd.amount).toBeCloseTo(3.6)
    expect(usd.formatted).toContain("USD")
    const mxn = estimateContextCost({
      sources,
      pricing,
      currency: "MXN",
      locale: "es-MX",
      outputTokens: 1_000_000,
      cacheWriteTokens: 1_000_000,
    })
    expect(mxn.amount).toBeCloseTo(3.6 + 15 + 3.75)
    expect(mxn.formatted).toContain("MXN")
    expect(mxn.currency).toBe("MXN")
  })
})

describe("allocateTicks", () => {
  it("fits the budget, including zero and very large sources", () => {
    const sources = [
      source({ id: "cero", tokens: 0 }),
      source({ id: "grande", tokens: 2_000_000 }),
      source({ id: "chica", tokens: 1 }),
    ]
    const ticks = allocateTicks(sources, 2_000_000, 48)
    const total = ticks.empty + ticks.segments.reduce((sum, segment) => sum + segment.count, 0)
    expect(total).toBe(48)
    expect(ticks.segments.some((segment) => segment.id === "cero")).toBe(false)
    expect(ticks.segments.find((segment) => segment.id === "grande")?.count).toBeGreaterThan(0)
  })
})
