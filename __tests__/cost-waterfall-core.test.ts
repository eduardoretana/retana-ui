import { describe, expect, it } from "vitest"

import type { CostRunFamily } from "@/contracts/cost-run.contract"
import {
  applyRunEvent,
  blendedCostPer1k,
  cacheSavings,
  consumeRunEvents,
  createRun,
  exportRun,
  formatLatency,
  formatMicro,
  formatTokenCount,
  layoutWaterfall,
  mulDiv,
  ownCost,
  pricedCost,
  reduceRunEvents,
  rollupRun,
  runFromWorkflowNodes,
  runToCsv,
  runToJson,
  type ModelPrice,
  type PricingTable,
  type Run,
  type RunEvent,
  type RunStep,
} from "@/registry/lib/cost-waterfall"

const rapid: ModelPrice = { input: 150_000n, output: 600_000n, cacheRead: 15_000n, cacheWrite: 187_500n }
const wide: ModelPrice = { input: 3_000_000n, output: 15_000_000n, cacheRead: 300_000n, cacheWrite: 3_750_000n }
const pricing: PricingTable = { currency: "USD", models: { "ejemplo-rapido": rapid, "ejemplo-amplio": wide } }

function step(partial: Partial<RunStep> & Pick<RunStep, "id" | "name">): RunStep {
  return { kind: "llm", tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheWrite: 0, status: "success", ...partial }
}

function run(steps: RunStep[], title = "Ejemplo"): Run {
  return createRun({ id: "run", title, steps })
}

describe("family contract", () => {
  it("exposes the reusable surface", () => {
    const family: CostRunFamily = {
      ownCost,
      rollup: rollupRun,
      reduce: applyRunEvent,
      stream: consumeRunEvents,
      json: runToJson,
      csv: runToCsv,
      fromWorkflowNodes: runFromWorkflowNodes,
      blendedPer1k: blendedCostPer1k,
    }
    expect(family.blendedPer1k(pricing, "ejemplo-rapido", { input: 1, output: 0, cacheRead: 0, cacheWrite: 0 })).toBeGreaterThanOrEqual(0n)
  })
})

describe("money", () => {
  it("rounds half away from zero", () => {
    expect(mulDiv(500_000n, 1n, 1_000_000n)).toBe(1n)
    expect(mulDiv(499_999n, 1n, 1_000_000n)).toBe(0n)
    expect(mulDiv(-500_000n, 1n, 1_000_000n)).toBe(-1n)
  })

  it("prices tokens from the injected table", () => {
    const row = step({ id: "a", name: "a", model: "ejemplo-amplio", tokensIn: 1_000_000, tokensOut: 1_000, cacheRead: 2_000_000, cacheWrite: 0 })
    expect(pricedCost(row, pricing)).toBe(3_000_000n + 15_000n + 600_000n)
    expect(cacheSavings(row, pricing)).toBe(mulDiv(2_000_000n, 3_000_000n - 300_000n, 1_000_000n))
  })

  it("lets an explicit cost replace the priced amount", () => {
    const row = step({ id: "a", name: "a", model: "ejemplo-amplio", tokensIn: 1_000_000, costMicro: 42n })
    expect(ownCost(row, pricing)).toBe(42n)
    expect(cacheSavings(row, pricing)).toBe(0n)
  })

  it("formats currency from integers", () => {
    const usd = { locale: "en-US", currency: "USD" }
    expect(formatMicro(0n, usd)).toBe("$0.00")
    expect(formatMicro(1_250_000n, usd)).toBe("$1.25")
    expect(formatMicro(42n, usd)).toBe("$0.000042")
    expect(formatMicro(-42n, usd)).toBe("-$0.000042")
    const formatted = formatMicro(1_000_000n, { locale: "es-MX", currency: "MXN", fx: { numerator: 1725n, denominator: 100n } })
    expect(formatted).toContain("17.25")
  })

  it("formats a huge amount without losing the integer", () => {
    const formatted = formatMicro(10n ** 20n + 500_000n, { locale: "en-US", currency: "USD" })
    expect(formatted.replace(/\D/g, "")).toContain("100000000000000")
  })

  it("compacts token counts", () => {
    expect(formatTokenCount(850, "en-US")).toBe("850")
    expect(formatTokenCount(1500, "en-US")).toBe("1.5K")
    expect(formatLatency(850, "en-US")).toBe("850 ms")
    expect(formatLatency(1500, "en-US")).toBe("1.5 s")
  })
})

describe("rollup", () => {
  it("sums children into the parent and picks the own-cost winner", () => {
    const totals = rollupRun(
      run([
        step({ id: "parent", name: "Padre", kind: "agent" }),
        step({ id: "a", parentId: "parent", name: "A", model: "ejemplo-rapido", tokensIn: 1_000_000 }),
        step({ id: "b", parentId: "parent", name: "B", costMicro: 9n, kind: "tool", destination: "ejemplo-archivo" }),
      ]),
      pricing,
    )
    const rows = new Map(totals.steps.map((row) => [row.id, row]))
    expect(rows.get("a")?.ownCost).toBe(150_000n)
    expect(rows.get("parent")?.rolledCost).toBe(150_009n)
    expect(totals.totalCost).toBe(150_009n)
    expect(totals.mostExpensiveId).toBe("a")
  })

  it("returns no winner when every own cost is zero", () => {
    expect(rollupRun(run([step({ id: "z", name: "z" })]), pricing).mostExpensiveId).toBeNull()
  })

  it("keeps a zero explicit cost and a very large one", () => {
    const totals = rollupRun(run([step({ id: "zero", name: "zero", costMicro: 0n, model: "ejemplo-amplio", tokensIn: 5_000_000 }), step({ id: "huge", name: "huge", costMicro: 10n ** 24n })]), pricing)
    expect(totals.totalCost).toBe(10n ** 24n)
    expect(totals.mostExpensiveId).toBe("huge")
  })
})

describe("waterfall layout", () => {
  it("starts each bar where the previous one ended and spans children", () => {
    const layout = layoutWaterfall(
      run([
        step({ id: "root", name: "root", kind: "agent" }),
        step({ id: "a", parentId: "root", name: "a", costMicro: 30n }),
        step({ id: "b", parentId: "root", name: "b", costMicro: 70n }),
      ]),
      pricing,
      "cost",
      [],
    )
    const byId = new Map(layout.rows.map((row) => [row.id, row]))
    expect(byId.get("a")).toMatchObject({ ownStart: 0n, ownEnd: 30n })
    expect(byId.get("b")).toMatchObject({ ownStart: 30n, ownEnd: 100n })
    expect(byId.get("root")).toMatchObject({ spanStart: 0n, spanEnd: 100n })
    expect(layout.domain).toBe(100n)
  })

  it("collapses a parent into one bar and counts hidden steps", () => {
    const layout = layoutWaterfall(
      run([
        step({ id: "root", name: "root", kind: "agent" }),
        step({ id: "a", parentId: "root", name: "a", costMicro: 10n }),
        step({ id: "a1", parentId: "a", name: "a1", costMicro: 5n }),
      ]),
      pricing,
      "cost",
      ["root"],
    )
    expect(layout.rows).toHaveLength(1)
    expect(layout.rows[0]).toMatchObject({ id: "root", collapsed: true, hiddenCount: 2, ownEnd: 15n })
  })

  it("measures tokens when asked", () => {
    const layout = layoutWaterfall(run([step({ id: "a", name: "a", tokensIn: 100, tokensOut: 25, cacheRead: 10, costMicro: 1n })]), pricing, "tokens", [])
    expect(layout.rows[0]?.ownEnd).toBe(135n)
  })
})

describe("applyRunEvent", () => {
  const empty = createRun({ id: "run", title: "Ejemplo" })

  it("folds a live run and ignores duplicates and stale events", () => {
    const started: RunEvent = { type: "step.started", eventId: "s1", at: 10, stepId: "plan", name: "Plan", kind: "llm", model: "ejemplo-rapido" }
    const progress: RunEvent = { type: "step.progress", eventId: "p1", at: 20, stepId: "plan", tokensIn: 100, tokensOut: 5 }
    const done: RunEvent = { type: "step.completed", eventId: "c1", at: 30, stepId: "plan", tokensOut: 40, output: "listo" }
    const first = reduceRunEvents(empty, [started, progress, done, done])
    expect(first.steps[0]).toMatchObject({ status: "success", tokensIn: 100, tokensOut: 40, output: "listo" })
    expect(applyRunEvent(first, progress)).toBe(first)
    expect(applyRunEvent(first, { type: "step.failed", at: 15, stepId: "plan", error: "tarde" }).steps[0]?.status).toBe("success")
    expect(applyRunEvent(first, { type: "run.completed", at: 40 }).status).toBe("done")
  })

  it("accepts progress before start and a later failure", () => {
    const next = reduceRunEvents(empty, [
      { type: "step.progress", at: 5, stepId: "tool", tokensIn: 3 },
      { type: "step.started", at: 6, stepId: "tool", name: "Buscar", kind: "tool", destination: "ejemplo-busqueda" },
      { type: "step.failed", at: 8, stepId: "tool", error: "sin red" },
      { type: "run.completed", at: 9 },
    ])
    expect(next.steps[0]).toMatchObject({ name: "Buscar", kind: "tool", tokensIn: 3, status: "error", error: "sin red" })
    expect(next.status).toBe("error")
  })

  it("does not regress a newer terminal state", () => {
    const failed = reduceRunEvents(empty, [{ type: "step.failed", at: 4, stepId: "x", error: "falló" }])
    expect(applyRunEvent(failed, { type: "step.completed", at: 3, stepId: "x" }).steps[0]?.status).toBe("error")
    expect(applyRunEvent(failed, { type: "step.completed", at: 6, stepId: "x", tokensOut: 1 }).steps[0]?.status).toBe("success")
  })

  it("reopens when a later start arrives after the run closed", () => {
    const closed = reduceRunEvents(empty, [{ type: "step.completed", at: 2, stepId: "a", tokensOut: 1 }, { type: "run.completed", at: 3 }])
    const reopened = applyRunEvent(closed, { type: "step.started", at: 4, stepId: "b", name: "Siguiente", kind: "llm" })
    expect(reopened.status).toBe("live")
    expect(reopened.closedAt).toBeUndefined()
  })

  it("consumes an async iterable", async () => {
    async function* events(): AsyncGenerator<RunEvent> {
      yield { type: "step.started", at: 1, stepId: "a", name: "A", kind: "save" }
      yield { type: "step.completed", at: 2, stepId: "a", costMicro: 4n }
    }
    const done = await consumeRunEvents(empty, events())
    expect(done.steps[0]).toMatchObject({ kind: "save", status: "success", costMicro: 4n })
  })

  it("builds 300 disordered steps without double counting", () => {
    const events: RunEvent[] = []
    for (let index = 0; index < 300; index += 1) {
      const parentId = index === 0 ? undefined : `s${Math.max(0, index - (index % 8) - 1)}`
      events.push({ type: "step.completed", at: 1_000 + index, stepId: `s${index}`, tokensIn: index, costMicro: index === 10 ? 0n : BigInt(index + 1) })
      events.push({
        type: "step.started",
        at: index,
        stepId: `s${index}`,
        name: index === 4 ? "N".repeat(60) : `Paso ${index}`,
        kind: index % 3 === 0 ? "llm" : "tool",
        ...(parentId ? { parentId } : {}),
      })
    }
    events.push({ type: "run.completed", at: 50 })
    events.push({ type: "run.completed", at: 2_000 })
    const next = reduceRunEvents(empty, events)
    expect(next.steps).toHaveLength(300)
    expect(next.status).toBe("done")
    expect(rollupRun(next, pricing).totalCost).toBe(next.steps.reduce((sum, row) => sum + (row.costMicro ?? 0n), 0n))
  })
})

describe("export and adapters", () => {
  it("exports json and csv with micro-units as strings", () => {
    const ready = run([step({ id: "a", name: "=cmd", kind: "tool", costMicro: 7n, destination: "ejemplo-archivo" })])
    expect(exportRun(ready, pricing).totalCostMicro).toBe("7")
    expect(runToJson(ready, pricing)).toContain('"totalCostMicro": "7"')
    expect(runToCsv(ready, pricing)).toContain("'=cmd")
  })

  it("maps workflow nodes and a blended 1k price", () => {
    const built = runFromWorkflowNodes({
      id: "wf",
      title: "Nodo",
      nodes: [
        { nodeId: "n1", label: "Leer", kind: "llm", model: "ejemplo-rapido", tokensIn: 500, tokensOut: 500, replay: true },
        { nodeId: "n2", parentNodeId: "n1", label: "Guardar", kind: "save", destination: "ejemplo-archivo", costMicro: 3n, status: "success" },
      ],
    })
    expect(built.steps[0]?.payload).toEqual({ replay: true })
    const first = built.steps[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(rollupRun(built, pricing).totalCost).toBe(ownCost(first, pricing) + 3n)
    const direct = pricedCost(step({ id: "k", name: "k", model: "ejemplo-rapido", tokensIn: 750, tokensOut: 250 }), pricing)
    expect(blendedCostPer1k(pricing, "ejemplo-rapido", { input: 750, output: 250, cacheRead: 0, cacheWrite: 0 })).toBe(direct)
  })
})
