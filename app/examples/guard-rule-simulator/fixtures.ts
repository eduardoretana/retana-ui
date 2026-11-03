import {
  gitMergeApprovalRuleset,
  mejoravitWhatsappRuleset,
  syntheticGitMerge,
  syntheticSafeSend,
  syntheticUnvalidatedOffer,
  type GuardAction,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"

export const clock = () => Date.UTC(2026, 10, 3, 15, 0, 0)

export const filledRuleset: Ruleset = { ...mejoravitWhatsappRuleset({ accountId: "marca-sintetica" }), version: 1 }
export const filledAction: GuardAction = syntheticUnvalidatedOffer()

export const filled = { ruleset: filledRuleset, action: filledAction }

export const empty = { ruleset: null, action: null }

export const loading = { ruleset: filledRuleset, action: filledAction }

export const error = { ruleset: filledRuleset, action: syntheticSafeSend() }

export const missing: GuardAction = {
  accountId: "marca-sintetica",
  kind: "whatsapp.before_send",
  text: "Hola.",
  data: { direction: "outbound" },
}

export const mergeRuleset: Ruleset = { ...gitMergeApprovalRuleset(), version: 1 }
export const mergeAction = syntheticGitMerge()
