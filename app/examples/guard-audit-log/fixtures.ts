import type { AuditLogItem } from "@/registry/ui/guard-audit-log"

const createdAt = Date.UTC(2026, 10, 3, 15, 0, 0)

export const filled: AuditLogItem[] = [
  {
    id: "aud_1",
    createdAt,
    kind: "whatsapp.before_send",
    decision: "block",
    summary: "Cliente Ficticio. Se bloqueó un monto no validado hacia +52 55 0000 0000.",
    ruleIds: ["block-unvalidated-offer", "log-all"],
    rulesetVersion: 1,
    accountId: "marca-sintetica",
    agentResponse: "No envié la promesa de hasta $36 mil.",
  },
  {
    id: "aud_2",
    createdAt: createdAt + 60_000,
    kind: "git.merge",
    decision: "allow",
    summary: "Merge ficticio de ejemplo/demo, pull request 0, liberado una vez.",
    ruleIds: ["merge-needs-human", "log-all"],
    rulesetVersion: 1,
    accountId: "marca-sintetica",
    approver: "revisor-ficticio",
  },
]

export const empty: AuditLogItem[] = []

export const loading = filled

export const error = filled
