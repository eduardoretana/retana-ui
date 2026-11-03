"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { GuardApprovalQueue, type ApprovalQueueItem } from "@/registry/ui/guard-approval-queue"
import { GuardAuditLog, type AuditLogItem } from "@/registry/ui/guard-audit-log"
import { GuardRuleBuilder } from "@/registry/ui/guard-rule-builder"
import { GuardRuleSimulator } from "@/registry/ui/guard-rule-simulator"
import {
  MemoryApprovalGate,
  MemoryAuditLog,
  MemoryRulesetStore,
  createIdSequence,
  guardAction,
  gitMergeApprovalRuleset,
  mejoravitWhatsappRuleset,
  syntheticGitMerge,
  syntheticSafeSend,
  type GuardRule,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"

const NOW = Date.UTC(2026, 10, 3, 15, 0, 0)
const ACCOUNT = "marca-sintetica"

function boot() {
  const gate = new MemoryApprovalGate(createIdSequence("apr"))
  const audit = new MemoryAuditLog()
  const store = new MemoryRulesetStore()
  const editor = { id: "editor-ficticio", accountId: ACCOUNT, role: "editor" as const }
  const saved = store.save(editor, mejoravitWhatsappRuleset({ accountId: ACCOUNT, stuckMessageThreshold: 4 }))
  store.activate(editor, saved.id, saved.version)
  const ruleset = store.active(editor)
  if (!ruleset) throw new Error("Missing fictional ruleset")
  const ids = createIdSequence("aud")
  const cold = syntheticSafeSend()
  cold.data = { ...cold.data, contactInitiated: false }
  guardAction({ ruleset, gate, audit, clock: () => NOW, nextAuditId: ids }, cold)
  const merge = { ...gitMergeApprovalRuleset(ACCOUNT), version: 1 }
  guardAction({ ruleset: merge, gate, audit, clock: () => NOW, nextAuditId: ids }, syntheticGitMerge(ACCOUNT))
  return { gate, audit, ruleset, merge, ids, store, editor }
}

export function HerramientasDesk() {
  const [locale, setLocale] = useState<"es" | "en">("es")
  const [model] = useState(boot)
  const [rule, setRule] = useState<GuardRule>(model.ruleset.rules[0]!)
  const [action, setAction] = useState(syntheticSafeSend())
  const [ruleset, setRuleset] = useState<Ruleset>(model.ruleset)
  const [tick, setTick] = useState(0)

  const approvals = useMemo<ApprovalQueueItem[]>(() => {
    return model.gate.list(ACCOUNT, { now: NOW }).map((ticket) => ({
      id: ticket.id,
      kind: ticket.kind,
      reasonKey: ticket.reasonKey,
      status: ticket.status,
      expiresAt: ticket.expiresAt,
      createdAt: ticket.createdAt,
      summary: ticket.action.text ?? `${ticket.kind} · ${ticket.action.accountId}`,
      ...(ticket.decidedBy ? { decidedBy: ticket.decidedBy } : {}),
      ...(ticket.decidedAt !== undefined ? { decidedAt: ticket.decidedAt } : {}),
    }))
  }, [model.gate, tick])

  const entries = useMemo<AuditLogItem[]>(() => {
    return model.audit.list(ACCOUNT).map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      kind: record.kind,
      decision: record.decision,
      summary: record.input.text ?? record.kind,
      ruleIds: record.ruleIds,
      rulesetVersion: record.rulesetVersion,
      accountId: record.accountId,
      ...(record.agentResponse ? { agentResponse: record.agentResponse } : {}),
      ...(record.approver ? { approver: record.approver } : {}),
    }))
  }, [model.audit, tick])

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {(["es", "en"] as const).map((option) => (
          <Button key={option} type="button" size="sm" variant={locale === option ? "default" : "outline"} onClick={() => setLocale(option)}>
            {option === "es" ? "Español" : "English"}
          </Button>
        ))}
      </div>
      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-lg font-semibold">Constructor</h2>
        <GuardRuleBuilder rule={rule} locale={locale} onChange={setRule} />
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => {
            const draft = { id: ruleset.id, accountId: ACCOUNT, name: ruleset.name, rules: ruleset.rules.map((item) => (item.id === rule.id ? rule : item)) }
            const saved = model.store.save(model.editor, draft)
            model.store.activate(model.editor, saved.id, saved.version)
            const active = model.store.active(model.editor)
            if (active) setRuleset(active)
          }}
        >
          {locale === "es" ? "Publicar versión ficticia" : "Publish fictional version"}
        </Button>
        <p className="text-sm text-muted-foreground">
          {locale === "es" ? `Versión activa ${ruleset.version}.` : `Active version ${ruleset.version}.`}
        </p>
      </section>
      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-lg font-semibold">Simulador</h2>
        <GuardRuleSimulator ruleset={ruleset} action={action} locale={locale} clock={() => NOW} onActionChange={setAction} />
      </section>
      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-lg font-semibold">Aprobaciones</h2>
        <GuardApprovalQueue
          items={approvals}
          now={NOW}
          locale={locale}
          role="approver"
          onApprove={(id) => {
            model.gate.decide({ accountId: ACCOUNT, actor: { id: "revisor-ficticio", accountId: ACCOUNT, role: "approver" }, id, outcome: "approved", now: NOW })
            setTick((value) => value + 1)
          }}
          onReject={(id) => {
            model.gate.decide({ accountId: ACCOUNT, actor: { id: "revisor-ficticio", accountId: ACCOUNT, role: "approver" }, id, outcome: "rejected", now: NOW })
            setTick((value) => value + 1)
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => {
            guardAction(
              { ruleset: model.merge, gate: model.gate, audit: model.audit, clock: () => NOW, nextAuditId: model.ids },
              syntheticGitMerge(ACCOUNT),
            )
            setTick((value) => value + 1)
          }}
        >
          {locale === "es" ? "Pedir aprobación de git.merge" : "Request a git.merge approval"}
        </Button>
      </section>
      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-lg font-semibold">Bitácora</h2>
        <GuardAuditLog entries={entries} locale={locale} />
      </section>
    </div>
  )
}
