import { describe, expect, it } from "vitest"

import {
  approvalHandoff,
  bandForScore,
  bandImpact,
  bandsAreValid,
  clampThresholds,
  confidenceFromPrompt,
  decideTest,
  deniedCapabilities,
  diffVersions,
  evaluateGuardrails,
  exampleAmountPer1k,
  guardrailProblems,
  partitionBands,
  simulateTest,
  validateBands,
  type AgentVersion,
  type ExampleModel,
  type Guardrail,
  type GuardrailContext,
  type GuardrailType,
} from "@/registry/lib/agent-config"

const types: GuardrailType[] = [
  { type: "redact_pii", action: "redact", condition: { op: "eq", path: "hasPii", value: true }, params: [] },
  {
    type: "payment_approval",
    action: "require_approval",
    condition: { op: "gt", path: "amount", param: "threshold" },
    params: [{ key: "threshold", kind: "number" }],
  },
  { type: "cite_fields", action: "require_citation", condition: { op: "missing", path: "citation" }, params: [] },
  { type: "web_lookup", action: "allow", condition: { op: "eq", path: "webLookup", value: true }, params: [] },
]

const quiet: GuardrailContext = { flags: {}, numbers: {}, missing: [] }

function rule(partial: Partial<Guardrail> & Pick<Guardrail, "id" | "type" | "action" | "condition">): Guardrail {
  return {
    enabled: true,
    params: {},
    reasonKey: partial.id,
    label: partial.id,
    detail: partial.id,
    ...partial,
  }
}

const model: ExampleModel = {
  id: "norte",
  name: "Ejemplo Norte",
  vendor: "Ejemplo",
  currency: "USD",
  inputPerMillion: 3,
  outputPerMillion: 15,
  p95Ms: 1400,
  example: true,
}

function version(overrides: Partial<AgentVersion> = {}): AgentVersion {
  return {
    id: "v7",
    agentId: "leads",
    number: 7,
    state: "published",
    author: "Ada Solís",
    at: "2026-10-01T15:00:00.000Z",
    instructions: "Califica el prospecto con los campos del formulario.",
    binding: { primaryId: "norte", fallbackId: "brisa", fallback: { kind: "timeout", afterMs: 8000 } },
    bands: partitionBands(70, 92),
    guardrails: [
      rule({ id: "pii", type: "redact_pii", action: "redact", condition: { op: "eq", path: "hasPii", value: true } }),
      rule({
        id: "pay",
        type: "payment_approval",
        action: "require_approval",
        condition: { op: "gt", path: "amount", param: "threshold" },
        params: { threshold: 10000 },
        reasonKey: "approval_payment",
      }),
    ],
    evaluation: { periodDays: 30, distribution: [0, 2, 0], accuracy: 91 },
    ...overrides,
  }
}

describe("confidence bands", () => {
  it("accepts a closed partition and names each score", () => {
    const bands = partitionBands(70, 92)
    expect(bandsAreValid(bands)).toBe(true)
    expect(bandForScore(69, bands)).toBe("reject")
    expect(bandForScore(70, bands)).toBe("review")
    expect(bandForScore(92, bands)).toBe("review")
    expect(bandForScore(93, bands)).toBe("auto")
    expect(bandForScore(100, bands)).toBe("auto")
  })

  it("rejects gaps, overlaps, order, range, and narrow bands", () => {
    expect(validateBands({ reject: { min: 0, max: 60 }, review: { min: 70, max: 90 }, auto: { min: 90, max: 100 } }).map((issue) => issue.code)).toContain("gap")
    expect(validateBands({ reject: { min: 0, max: 80 }, review: { min: 70, max: 92 }, auto: { min: 92, max: 100 } }).map((issue) => issue.code)).toContain("overlap")
    expect(validateBands(partitionBands(95, 90)).map((issue) => issue.code)).toEqual(expect.arrayContaining(["order", "narrow"]))
    expect(validateBands({ reject: { min: -1, max: 70 }, review: { min: 70, max: 92 }, auto: { min: 92, max: 100 } }).some((issue) => issue.code === "range")).toBe(true)
    expect(validateBands({ reject: { min: 0, max: 70.5 }, review: { min: 70.5, max: 92 }, auto: { min: 92, max: 100 } }).some((issue) => issue.code === "range")).toBe(true)
  })

  it("clamps drag and keyboard edits so each band keeps the minimum width", () => {
    expect(clampThresholds(1, 2)).toEqual({ rejectBelow: 5, autoAbove: 10 })
    expect(clampThresholds(90, 92)).toEqual({ rejectBelow: 87, autoAbove: 92 })
    expect(bandsAreValid(partitionBands(clampThresholds(90, 92).rejectBelow, clampThresholds(90, 92).autoAbove))).toBe(true)
  })

  it("counts decisions, leaves gaps unassigned, and treats an empty series as zero", () => {
    const bands = partitionBands(70, 92)
    const distribution = Array.from({ length: 101 }, () => 0)
    distribution[10] = 4
    distribution[80] = 3
    distribution[99] = 1
    expect(bandImpact(distribution, bands)).toMatchObject({ reject: 4, review: 3, auto: 1, unassigned: 0, total: 8 })
    const gapped = { reject: { min: 0, max: 20 }, review: { min: 40, max: 60 }, auto: { min: 60, max: 100 } }
    expect(bandImpact(distribution, gapped).unassigned).toBe(3)
    expect(bandImpact([], bands).total).toBe(0)
  })
})

describe("guardrails", () => {
  const rules = version().guardrails

  it("fires only registered, enabled rules and skips free-form mismatches", () => {
    const hits = evaluateGuardrails(rules, { flags: { hasPii: true }, numbers: { amount: 12000 }, missing: [] }, types)
    expect(hits.map((hit) => hit.action)).toEqual(["redact", "require_approval"])
    expect(evaluateGuardrails(rules, quiet, types)).toEqual([])
    expect(evaluateGuardrails(rules.map((item) => ({ ...item, enabled: false })), { flags: { hasPii: true }, numbers: { amount: 1 }, missing: [] }, types)).toEqual([])
    const stranger = rule({ id: "x", type: "script", action: "block", condition: { op: "always" } })
    expect(guardrailProblems([stranger], types)).toEqual([{ id: "x", code: "unregistered" }])
    expect(evaluateGuardrails([stranger], quiet, types)).toEqual([])
    const mismatched = rule({ id: "pii", type: "redact_pii", action: "block", condition: { op: "eq", path: "hasPii", value: true } })
    expect(guardrailProblems([mismatched], types)[0]?.code).toBe("mismatch")
  })

  it("requires a citation, and refuses a web lookup when allow is off", () => {
    const cite = rule({ id: "cite", type: "cite_fields", action: "require_citation", condition: { op: "missing", path: "citation" } })
    expect(evaluateGuardrails([cite], { ...quiet, missing: ["citation"] }, types)[0]?.action).toBe("require_citation")
    const web = rule({ id: "web", type: "web_lookup", action: "allow", condition: { op: "eq", path: "webLookup", value: true }, enabled: false })
    const denied = deniedCapabilities([web], { ...quiet, flags: { webLookup: true } }, types)
    expect(denied).toEqual([expect.objectContaining({ action: "block", denied: true, reasonKey: "web" })])
    expect(decideTest("auto", denied)).toBe("blocked")
  })

  it("builds an approval handoff without opening a ticket", () => {
    const [hit] = evaluateGuardrails(rules, { ...quiet, numbers: { amount: 15000 } }, types)
    expect(hit).toBeDefined()
    expect(approvalHandoff(hit!, version(), rules)).toEqual({
      guardrailId: "pay",
      reasonKey: "approval_payment",
      rulesetVersion: 7,
      threshold: 10000,
    })
  })
})

describe("versions and the test port", () => {
  it("diffs draft against published in a stable order", () => {
    const published = version()
    const draft = version({
      state: "draft",
      instructions: "Pide una cita antes de calificar.",
      binding: { primaryId: "cumbre", fallbackId: "brisa", fallback: { kind: "timeout", afterMs: 8000 } },
      bands: partitionBands(60, 90),
    })
    expect(diffVersions(published, draft).map((change) => change.kind)).toEqual(["instructions", "primary", "bands"])
  })

  it("runs the same prompt to the same decision", () => {
    const input = {
      agentId: "leads",
      version: version(),
      prompt: "El trato de ejemplo pide un pago de 12000.",
      context: { flags: {}, numbers: { amount: 12000 }, missing: [] },
    }
    const first = simulateTest(input, types)
    const second = simulateTest(input, types)
    expect(second).toEqual(first)
    expect(first.confidence).toBe(confidenceFromPrompt(input.prompt))
    expect(first.decision).toBe("needs_approval")
    expect(first.hits.some((hit) => hit.reasonKey === "approval_payment")).toBe(true)
  })

  it("converts example per-1M rates into the per-1K figure the router stores", () => {
    expect(exampleAmountPer1k(model)).toBeCloseTo((3 * 0.75 + 15 * 0.25) / 1000)
    expect(model.example).toBe(true)
  })
})
