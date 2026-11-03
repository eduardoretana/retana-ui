import { describe, expect, it } from "vitest"

import {
  GuardError,
  MemoryApprovalGate,
  MemoryAuditLog,
  MemoryRulesetStore,
  REASON,
  createIdSequence,
  evaluateRules,
  explain,
  guardAction,
  mapExampleCrmWebhook,
  mejoravitWhatsappRuleset,
  parseRuleset,
  syntheticGitMerge,
  syntheticSafeSend,
  syntheticUnvalidatedOffer,
  syntheticValidatedOffer,
  gitMergeApprovalRuleset,
  type Condition,
  type DecisionKind,
  type GuardAction,
  type GuardRule,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"
import { lintToolCoreSource } from "../scripts/tool-core-purity"

const NOW = 1_700_000_000_000
const clock = () => NOW
const account = "marca-sintetica"
const other = "otra-marca"

function rule(decision: DecisionKind, id?: string): GuardRule {
  return {
    id: id ?? decision,
    name: id ?? decision,
    enabled: true,
    kinds: ["sample.action"],
    conditions: { op: "and", conditions: [] },
    decision,
    reasonKey: decision,
  }
}

function pack(rules: GuardRule[], id = "rs"): Ruleset {
  return { id, accountId: account, version: 1, name: "Prueba", rules }
}

function action(data: Record<string, unknown> = {}, kind = "sample.action"): GuardAction {
  return { accountId: account, kind, data }
}

const terminals = ["block", "handoff_to_human", "require_approval", "allow"] as const

function winner(kinds: readonly string[]) {
  if (kinds.includes("block")) return "block"
  if (kinds.includes("handoff_to_human")) return "handoff_to_human"
  if (kinds.includes("require_approval")) return "require_approval"
  return "allow"
}

describe("evaluateRules precedence", () => {
  const masks = Array.from({ length: (1 << terminals.length) - 1 }, (_, index) => index + 1)

  it.each(masks.flatMap((mask) => [false, true].map((withLog) => ({ mask, withLog }))))(
    "mask $mask log $withLog keeps block > handoff > approval > allow",
    ({ mask, withLog }) => {
      const chosen = terminals.filter((_, index) => mask & (1 << index))
      const rules = chosen.map((decision) => rule(decision))
      if (withLog) rules.push(rule("log", "log-all"))
      const evaluation = evaluateRules(pack(rules), action(), clock)
      expect(evaluation.decision).toBe(winner(chosen))
      expect(evaluation.failClosed).toBe(false)
      expect(evaluation.logs.map((item) => item.ruleId)).toEqual(withLog ? ["log-all"] : [])
      expect(evaluation.fired.map((item) => item.decision).sort()).toEqual([...chosen, ...(withLog ? ["log" as const] : [])].sort())
    },
  )

  it("does not let rule order override precedence", () => {
    const evaluation = evaluateRules(
      pack([rule("allow", "a"), rule("block", "b"), rule("require_approval", "c")]),
      action(),
      clock,
    )
    expect(evaluation.decision).toBe("block")
    expect(evaluation.traces.map((trace) => trace.ruleId)).toEqual(["a", "b", "c"])
  })
})

describe("evaluateRules missing data", () => {
  it("fail-closes to require_approval and never allow", () => {
    const evaluation = evaluateRules(
      pack([rule("allow", "open"), { ...rule("allow", "needs"), conditions: { op: "eq", path: "needed", value: 1 } }]),
      action({}),
      clock,
    )
    expect(evaluation.decision).toBe("require_approval")
    expect(evaluation.failClosed).toBe(true)
    expect(evaluation.decision).not.toBe("allow")
    expect(evaluation.missingPaths).toEqual(["needed"])
    expect(explain(evaluation, "es")).toMatch(/Falta un dato/)
    expect(explain(evaluation, "en")).toMatch(/missing/)
  })

  it.each([
    ["and proven false ignores a missing sibling", { op: "and" as const, conditions: [{ op: "eq" as const, path: "flag", value: true }, { op: "eq" as const, path: "needed", value: 1 }] }, { flag: false }, "matched_false"],
    ["or proven true ignores a missing sibling", { op: "or" as const, conditions: [{ op: "eq" as const, path: "flag", value: true }, { op: "eq" as const, path: "needed", value: 1 }] }, { flag: true }, "fired"],
    ["and all true is true", { op: "and" as const, conditions: [{ op: "eq" as const, path: "flag", value: true }] }, { flag: true }, "fired"],
    ["or all false is false", { op: "or" as const, conditions: [{ op: "eq" as const, path: "flag", value: true }] }, { flag: false }, "matched_false"],
    ["not missing stays missing", { op: "not" as const, condition: { op: "eq" as const, path: "needed", value: 1 } }, {}, "missing"],
    ["not true is false", { op: "not" as const, condition: { op: "eq" as const, path: "flag", value: true } }, { flag: true }, "matched_false"],
    ["empty and is true", { op: "and" as const, conditions: [] }, {}, "fired"],
    ["empty or is false", { op: "or" as const, conditions: [] }, {}, "matched_false"],
    ["wrong type is missing", { op: "gte" as const, path: "stuckCount", value: 4 }, { stuckCount: "4" }, "missing"],
    ["null is present and not equal to 1", { op: "eq" as const, path: "amount", value: 1 }, { amount: null }, "matched_false"],
    ["present zero is not missing", { op: "gte" as const, path: "stuckCount", value: 4 }, { stuckCount: 0 }, "matched_false"],
  ] as const)("%s", (_title, conditions, data, status) => {
    const evaluation = evaluateRules(pack([{ ...rule("block"), conditions: conditions as Condition }]), action(data), clock)
    expect(evaluation.traces[0]?.status).toBe(status)
    if (status === "missing") {
      expect(evaluation.decision).toBe("require_approval")
      expect(evaluation.failClosed).toBe(true)
    }
    if (status === "matched_false") expect(evaluation.decision).toBe("allow")
    if (status === "fired") expect(evaluation.decision).toBe("block")
  })

  it("does not treat exists or missing as an unknown value", () => {
    const absent = evaluateRules(pack([{ ...rule("block"), conditions: { op: "missing", path: "nss" } }]), action({}), clock)
    const present = evaluateRules(pack([{ ...rule("block"), conditions: { op: "exists", path: "topic" } }]), action({ topic: "mejoravit" }), clock)
    expect(absent.decision).toBe("block")
    expect(absent.failClosed).toBe(false)
    expect(present.decision).toBe("block")
  })

  it("refuses a ruleset from another account", () => {
    expect(() => evaluateRules(pack([rule("allow")]), { ...action(), accountId: other }, clock)).toThrow(GuardError)
  })
})

describe("ApprovalGate", () => {
  const merge = syntheticGitMerge()
  const actor = { id: "revisor-ficticio", accountId: account, role: "approver" as const }
  const editor = { id: "editor-ficticio", accountId: account, role: "editor" as const }

  function request(now: number, ttlMs = 1_000) {
    return {
      accountId: account,
      action: merge,
      rulesetId: "ci-merge-ficticio",
      rulesetVersion: 1,
      reasonKey: REASON.gitMerge,
      ttlMs,
      now,
    }
  }

  it("creates, queries, expires, and rejects a late approval", () => {
    const gate = new MemoryApprovalGate(createIdSequence("apr"))
    const ticket = gate.create(request(1_000, 500))
    expect(ticket.kind).toBe("git.merge")
    expect(ticket.status).toBe("pending")
    expect(gate.get(account, ticket.id, 1_200)?.status).toBe("pending")
    expect(gate.get(other, ticket.id, 1_200)).toBeNull()
    expect(gate.list(other, { now: 1_200 })).toEqual([])
    expect(() => gate.decide({ accountId: account, actor: editor, id: ticket.id, outcome: "approved", now: 1_200 })).toThrow(GuardError)
    expect(() => gate.decide({ accountId: account, actor: { ...actor, accountId: other }, id: ticket.id, outcome: "approved", now: 1_200 })).toThrow(GuardError)
    const expired = gate.get(account, ticket.id, 1_500)
    expect(expired?.status).toBe("expired")
    expect(() => gate.decide({ accountId: account, actor, id: ticket.id, outcome: "approved", now: 1_500 })).toThrow(/expired/i)
    expect(gate.get(account, ticket.id, 1_500)?.status).toBe("expired")
  })

  it("approves once, consumes once, and blocks replay or a different payload", () => {
    const gate = new MemoryApprovalGate(createIdSequence("apr"))
    const ticket = gate.create(request(1_000))
    const approved = gate.decide({ accountId: account, actor, id: ticket.id, outcome: "approved", now: 1_100 })
    expect(approved.decidedBy).toBe("revisor-ficticio")
    expect(approved.decidedAt).toBe(1_100)
    expect(() => gate.decide({ accountId: account, actor, id: ticket.id, outcome: "rejected", now: 1_150 })).toThrow(GuardError)
    const spent = gate.consume({ accountId: account, id: ticket.id, action: merge, now: 1_200 })
    expect(spent.consumedAt).toBe(1_200)
    expect(() => gate.consume({ accountId: account, id: ticket.id, action: merge, now: 1_300 })).toThrow(GuardError)
    const again = gate.create(request(2_000))
    gate.decide({ accountId: account, actor, id: again.id, outcome: "approved", now: 2_100 })
    const tampered = { ...merge, data: { ...merge.data, pullRequest: 1 } }
    expect(() => gate.consume({ accountId: account, id: again.id, action: tampered, now: 2_200 })).toThrow(GuardError)
  })

  it("is idempotent while a pending ticket for the same payload and version exists", () => {
    const gate = new MemoryApprovalGate(createIdSequence("apr"))
    const first = gate.create(request(1_000))
    const second = gate.create(request(1_100))
    expect(second.id).toBe(first.id)
    expect(gate.list(account, { now: 1_100, kind: "git.merge" })).toHaveLength(1)
  })

  it("releases a git.merge only through guardAction and the same ruleset version", () => {
    const gate = new MemoryApprovalGate(createIdSequence("apr"))
    const audit = new MemoryAuditLog()
    let auditIds = 0
    const ruleset: Ruleset = { ...gitMergeApprovalRuleset(), version: 1 }
    const deps = { ruleset, gate, audit, clock, nextAuditId: () => `aud_${(auditIds += 1)}` }
    const first = guardAction(deps, merge)
    expect(first.decision).toBe("require_approval")
    expect(first.approval?.kind).toBe("git.merge")
    expect(evaluateRules(ruleset, merge, clock).decision).toBe("require_approval")
    gate.decide({ accountId: account, actor, id: first.approval!.id, outcome: "approved", now: NOW })
    const released = guardAction({ ...deps, clock: () => NOW + 1 }, merge)
    expect(released.decision).toBe("allow")
    expect(released.approval?.consumedAt).toBe(NOW + 1)
    const replay = guardAction({ ...deps, clock: () => NOW + 2 }, merge)
    expect(replay.decision).toBe("require_approval")
    const nextRuleset: Ruleset = { ...ruleset, version: 2 }
    gate.decide({ accountId: account, actor, id: replay.approval!.id, outcome: "approved", now: NOW + 3 })
    const stale = guardAction({ ...deps, ruleset: nextRuleset, clock: () => NOW + 4 }, merge)
    expect(stale.decision).toBe("require_approval")
    expect(stale.approval?.id).not.toBe(replay.approval?.id)
  })
})

describe("audit, versions, and permissions", () => {
  const editor = { id: "editor-ficticio", accountId: account, role: "editor" as const }
  const viewer = { id: "lector-ficticio", accountId: account, role: "viewer" as const }
  const approver = { id: "revisor-ficticio", accountId: account, role: "approver" as const }
  const outsider = { id: "editor-ajena", accountId: other, role: "editor" as const }

  it("appends frozen records and hides other accounts", () => {
    const log = new MemoryAuditLog()
    const input = syntheticSafeSend()
    const saved = log.append({
      id: "aud_1",
      accountId: account,
      rulesetId: "mejoravit-whatsapp",
      rulesetVersion: 1,
      ruleIds: ["log-all"],
      input,
      decision: "allow",
      failClosed: false,
      createdAt: NOW,
      agentResponse: "respuesta ficticia",
    })
    expect(Object.isFrozen(saved)).toBe(true)
    expect(Object.isFrozen(saved.input)).toBe(true)
    expect(() => {
      ;(saved as { decision: string }).decision = "block"
    }).toThrow()
    input.text = "mutado"
    expect(log.list(account)[0]?.input.text).toBe("Hola, soy la asesora demo. Seguimos con tu solicitud de Mejoravit.")
    expect(log.list(other)).toEqual([])
    expect("update" in log).toBe(false)
    expect("delete" in log).toBe(false)
  })

  it("versions rulesets without rewriting an old version", () => {
    const store = new MemoryRulesetStore()
    const draft = mejoravitWhatsappRuleset({ accountId: account, stuckMessageThreshold: 4 })
    expect(() => store.save(viewer, draft)).toThrow(GuardError)
    expect(() => store.save(approver, draft)).toThrow(GuardError)
    expect(() => store.save(outsider, draft)).toThrow(GuardError)
    const v1 = store.save(editor, draft)
    draft.name = "cambiado"
    draft.rules.pop()
    expect(store.get(editor, v1.id, 1)?.name).toBe("Mejoravit WhatsApp")
    expect(store.get(editor, v1.id, 1)?.rules.length).toBe(v1.rules.length)
    expect(store.get(outsider, v1.id, 1)).toBeNull()
    const v2 = store.save(editor, { ...mejoravitWhatsappRuleset({ accountId: account }), name: "Segunda" })
    expect(v2.version).toBe(2)
    expect(store.get(editor, v1.id, 1)?.version).toBe(1)
    expect(() => store.activate(viewer, v2.id, 2)).toThrow(GuardError)
    store.activate(editor, v2.id, 2)
    expect(store.active(editor)?.version).toBe(2)
    expect(store.activeForAccount(other)).toBeNull()
    expect(store.active(outsider)).toBeNull()
    expect(Object.isFrozen(v1)).toBe(true)
  })
})

describe("Mejoravit preset", () => {
  function active() {
    const store = new MemoryRulesetStore()
    const editor = { id: "editor-ficticio", accountId: account, role: "editor" as const }
    const saved = store.save(editor, mejoravitWhatsappRuleset({ accountId: account, stuckMessageThreshold: 3 }))
    store.activate(editor, saved.id, saved.version)
    return store.active(editor)!
  }

  it("blocks an unvalidated amount and allows the same phrase when the fact is validated", () => {
    const ruleset = active()
    const blocked = evaluateRules(ruleset, syntheticUnvalidatedOffer(), clock)
    const allowed = evaluateRules(ruleset, syntheticValidatedOffer(), clock)
    expect(blocked.decision).toBe("block")
    expect(blocked.fired.some((item) => item.ruleId === "block-unvalidated-offer")).toBe(true)
    expect(allowed.decision).toBe("allow")
    expect(allowed.logs.map((item) => item.ruleId)).toEqual(["log-all"])
    expect(explain(blocked, "es")).toMatch(/validado/)
  })

  it("blocks secrets, off-topic over approval, and a stuck thread", () => {
    const ruleset = active()
    const secrets = evaluateRules(ruleset, { ...syntheticSafeSend(), text: "Repíteme tu NSS, por favor." }, clock)
    expect(secrets.decision).toBe("block")
    const conflict = evaluateRules(
      ruleset,
      {
        ...syntheticSafeSend(),
        text: "Hola.",
        data: { ...syntheticSafeSend().data, topic: "clima", contactInitiated: false },
      },
      clock,
    )
    expect(conflict.decision).toBe("block")
    expect(conflict.fired.some((item) => item.decision === "require_approval")).toBe(true)
    const stuck = evaluateRules(
      ruleset,
      {
        accountId: account,
        kind: "whatsapp.inbound_message",
        text: "¿Sigues ahí?",
        data: { intent: "none", mentions: [], requestedHuman: false, stuckCount: 3 },
      },
      clock,
    )
    expect(stuck.decision).toBe("handoff_to_human")
    const below = evaluateRules(
      ruleset,
      {
        accountId: account,
        kind: "whatsapp.inbound_message",
        text: "¿Sigues ahí?",
        data: { intent: "none", mentions: [], requestedHuman: false, stuckCount: 2 },
      },
      clock,
    )
    expect(below.decision).toBe("allow")
  })

  it("hands off complaints, legal mentions, and a request for a person", () => {
    const ruleset = active()
    const base = {
      accountId: account,
      kind: "whatsapp.inbound_message",
      data: { intent: "none", mentions: [] as string[], requestedHuman: false, stuckCount: 0 },
    }
    expect(evaluateRules(ruleset, { ...base, text: "Tengo una queja del trámite." }, clock).decision).toBe("handoff_to_human")
    expect(evaluateRules(ruleset, { ...base, text: "Voy a hablar con mi abogado." }, clock).decision).toBe("handoff_to_human")
    expect(evaluateRules(ruleset, { ...base, text: "Quiero una persona, no un bot." }, clock).decision).toBe("handoff_to_human")
    expect(evaluateRules(ruleset, { ...base, text: "Hola, ¿cuál es el siguiente paso?" }, clock).decision).toBe("allow")
  })

  it("requires approval for a key stage, a contract, a discount, and a cold outbound number", () => {
    const ruleset = active()
    expect(evaluateRules(ruleset, { accountId: account, kind: "whatsapp.before_stage_change", data: { stage: "firma" } }, clock).decision).toBe("require_approval")
    expect(evaluateRules(ruleset, { accountId: account, kind: "whatsapp.before_stage_change", data: { stage: "contacto" } }, clock).decision).toBe("allow")
    expect(evaluateRules(ruleset, { accountId: account, kind: "whatsapp.before_document_send", data: { documentType: "contrato" } }, clock).decision).toBe("require_approval")
    expect(evaluateRules(ruleset, { accountId: account, kind: "whatsapp.before_discount", data: { discountRequested: true } }, clock).decision).toBe("require_approval")
    const cold = evaluateRules(
      ruleset,
      { ...syntheticSafeSend(), data: { ...syntheticSafeSend().data, contactInitiated: false } },
      clock,
    )
    expect(cold.decision).toBe("require_approval")
    expect(evaluateRules(ruleset, { accountId: account, kind: "whatsapp.before_stage_change", data: {} }, clock).decision).not.toBe("allow")
  })

  it("folds unicode that NFKC knows and still misses a homoglyph", () => {
    const ruleset = active()
    const folded = evaluateRules(ruleset, { ...syntheticSafeSend(), text: "n\u200bss" }, clock)
    expect(folded.decision).toBe("block")
    const homoglyph = evaluateRules(ruleset, { ...syntheticSafeSend(), text: "mi \u043d\u0441\u0441" }, clock)
    expect(homoglyph.fired.some((item) => item.ruleId === "block-secrets")).toBe(false)
  })
})

describe("example webhook and parser", () => {
  it("maps a fictional payload without inventing a topic", () => {
    const mapped = mapExampleCrmWebhook({
      accountId: account,
      kind: "whatsapp.before_send",
      message: { text: "Hola", to: "+525500000000" },
      crm: { contactInitiated: true, direction: "outbound" },
    })
    expect(mapped.data.topic).toBeUndefined()
    expect(mapped.data.destinationPhone).toBe("+525500000000")
    expect(() => mapExampleCrmWebhook({ accountId: account, kind: "https://real.example/hook" })).toThrow()
    const merge = mapExampleCrmWebhook({ accountId: account, kind: "git.merge" })
    expect(merge.data.repository).toBe("ejemplo/demo")
    expect(merge.data.pullRequest).toBe(0)
  })

  it("rejects an unconditional allow", () => {
    const parsed = parseRuleset({
      id: "x",
      accountId: account,
      version: 1,
      name: "Malo",
      rules: [{ id: "a", name: "a", enabled: true, kinds: ["git.merge"], conditions: { op: "and", conditions: [] }, decision: "allow", reasonKey: "x" }],
    })
    expect(parsed.ok).toBe(false)
  })
})

describe("tool core purity", () => {
  it("fails when a core imports react, css, next, or a component", () => {
    expect(lintToolCoreSource(`import React from "react"\nexport const x = 1\n`, "registry/lib/example/index.ts").join("\n")).toMatch(/react/)
    expect(lintToolCoreSource(`import "next/navigation"\n`, "a.ts").join("\n")).toMatch(/next/)
    expect(lintToolCoreSource(`import "./theme.css"\n`, "a.ts").join("\n")).toMatch(/css/)
    expect(lintToolCoreSource(`import { Button } from "@/components/ui/button"\n`, "a.ts").join("\n")).toMatch(/components/)
    expect(lintToolCoreSource(`export const ping = fetch("https://example.invalid")\n`, "a.ts").join("\n")).toMatch(/network/)
    expect(lintToolCoreSource(`export const value = 1\n`, "a.ts")).toEqual([])
  })
})
