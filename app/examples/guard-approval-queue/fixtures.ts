import type { ApprovalQueueItem } from "@/registry/ui/guard-approval-queue"

export const now = Date.UTC(2026, 10, 3, 15, 0, 0)

const base: ApprovalQueueItem = {
  id: "apr_1",
  kind: "whatsapp.before_send",
  reasonKey: "approval_unsolicited_outbound",
  status: "pending",
  createdAt: now - 60_000,
  expiresAt: now + 15 * 60_000,
  summary: "Mensaje ficticio a +52 55 0000 0000. La persona no escribió primero. Asesora Demo.",
}

export const filled: ApprovalQueueItem[] = [
  base,
  {
    id: "apr_2",
    kind: "git.merge",
    reasonKey: "approval_git_merge",
    status: "approved",
    createdAt: now - 120_000,
    expiresAt: now + 10 * 60_000,
    decidedAt: now - 30_000,
    decidedBy: "revisor-ficticio",
    summary: "Merge ficticio de ejemplo/demo, pull request 0.",
  },
]

export const empty: ApprovalQueueItem[] = []

export const loading = filled

export const error = filled

export const expired: ApprovalQueueItem[] = [{ ...base, id: "apr_3", expiresAt: now - 1_000 }]
