"use client"

import { decisionLabel, evaluateRules, gitMergeApprovalRuleset, mejoravitWhatsappRuleset, syntheticGitMerge, syntheticUnvalidatedOffer } from "@/registry/retana/lib/guard-rules"

const clock = () => Date.UTC(2026, 10, 3, 15, 0, 0)
const whatsapp = { ...mejoravitWhatsappRuleset({ accountId: "marca-sintetica" }), version: 1 }
const merge = { ...gitMergeApprovalRuleset(), version: 1 }

export default function Preview() {
  const blocked = evaluateRules(whatsapp, syntheticUnvalidatedOffer(), clock)
  const release = evaluateRules(merge, syntheticGitMerge(), clock)
  return (
    <div className="grid h-full content-center gap-1 bg-background p-3 text-sm">
      <p>{decisionLabel(blocked.decision, "es")}</p>
      <p>
        git.merge · {decisionLabel(release.decision, "es")}
      </p>
    </div>
  )
}
