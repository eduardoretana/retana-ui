import type { GuardRule } from "@/registry/retana/lib/guard-rules"
import { mejoravitWhatsappRuleset } from "@/registry/retana/lib/guard-rules"

const draft = mejoravitWhatsappRuleset({ accountId: "marca-sintetica" })

export const filled: GuardRule = draft.rules[0]!

export const empty = null

export const loading = filled

export const error = filled

export const readonly: GuardRule = { ...filled, name: "N".repeat(60) }

export const nested: GuardRule = {
  id: "anidada",
  name: "Etapa y monto",
  enabled: true,
  kinds: ["whatsapp.before_send", "git.merge"],
  conditions: {
    op: "and",
    conditions: [
      { op: "eq", path: "topic", value: "mejoravit" },
      {
        op: "or",
        conditions: [
          { op: "eq", path: "offer.validated", value: false },
          { op: "eq", path: "checksGreen", value: true },
        ],
      },
    ],
  },
  decision: "require_approval",
  reasonKey: "approval_git_merge",
  approvalTtlMs: 900000,
}
