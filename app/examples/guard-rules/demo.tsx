"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { ExampleFrame } from "@/app/examples/example-frame"
import {
  MemoryApprovalGate,
  MemoryAuditLog,
  MemoryRulesetStore,
  createIdSequence,
  evaluateRules,
  explain,
  gitMergeApprovalRuleset,
  guardAction,
  mejoravitWhatsappRuleset,
  syntheticGitMerge,
  syntheticUnvalidatedOffer,
} from "@/registry/retana/lib/guard-rules"

const now = Date.UTC(2026, 10, 3, 15, 0, 0)

export function GuardRulesDemo() {
  const gate = useRef(new MemoryApprovalGate(createIdSequence("apr")))
  const audit = useRef(new MemoryAuditLog())
  const ids = useRef(createIdSequence("aud"))
  const [note, setNote] = useState("Todavía no se pide el merge.")

  const ruleset = { ...gitMergeApprovalRuleset(), version: 1 }
  const action = syntheticGitMerge()
  const evaluation = evaluateRules(ruleset, action, () => now)

  return (
    <ExampleFrame title="Núcleo de guardas" description="Evalúa un envío ficticio de WhatsApp y abre una aprobación de git.merge. No hay red.">
      <div className="flex min-w-0 flex-col gap-4 text-sm">
        <p className="break-words">{explain(evaluateRules({ ...mejoravitWhatsappRuleset({ accountId: "marca-sintetica" }), version: 1 }, syntheticUnvalidatedOffer(), () => now), "es")}</p>
        <p className="break-words">
          git.merge · {explain(evaluation, "es")}
        </p>
        <Button
          type="button"
          className="w-fit"
          onClick={() => {
            const outcome = guardAction(
              { ruleset, gate: gate.current, audit: audit.current, clock: () => now, nextAuditId: ids.current },
              action,
            )
            const stored = outcome.approval ? gate.current.get("marca-sintetica", outcome.approval.id, now) : null
            setNote(`${outcome.decision} · ${stored?.kind ?? "sin ticket"} · ${stored?.status ?? ""}`)
          }}
        >
          Crear aprobación de merge
        </Button>
        <p role="status" className="break-words text-muted-foreground">
          {note}
        </p>
      </div>
    </ExampleFrame>
  )
}
