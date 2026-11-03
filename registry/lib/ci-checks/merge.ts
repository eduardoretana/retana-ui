/**
 * Merge stays off unless the host enables it.
 * Without an explicit confirmation the send function is not called.
 */

import type { ApprovalGate, MergeApproval } from "./approval"
import type { CiError } from "./types"

export type MergeDecision = {
  callApi: boolean
  error: CiError | null
}

export function decideMerge(input: { mergeEnabled: boolean; confirmed: boolean; approval: MergeApproval }): MergeDecision {
  if (!input.mergeEnabled) {
    return {
      callApi: false,
      error: { code: "merge_disabled", message: "La fusión está apagada.", retryAfterMs: null },
    }
  }
  if (!input.confirmed) {
    return {
      callApi: false,
      error: { code: "needs_confirmation", message: "Hace falta una confirmación explícita.", retryAfterMs: null },
    }
  }
  if (input.approval.decision === "denied") {
    return {
      callApi: false,
      error: { code: "merge_denied", message: input.approval.reason, retryAfterMs: null },
    }
  }
  if (input.approval.decision !== "granted") {
    return {
      callApi: false,
      error: { code: "needs_approval", message: "La regla require_approval todavía no concedió la fusión.", retryAfterMs: null },
    }
  }
  return { callApi: true, error: null }
}

export async function performMerge<T>(input: {
  mergeEnabled: boolean
  confirmed: boolean
  gate: ApprovalGate
  request: Parameters<ApprovalGate["review"]>[0]
  send: () => Promise<T>
}): Promise<{ ok: true; value: T } | { ok: false; error: CiError }> {
  const approval = await input.gate.review({ ...input.request, confirmed: input.confirmed })
  const decision = decideMerge({ mergeEnabled: input.mergeEnabled, confirmed: input.confirmed, approval })
  if (!decision.callApi || decision.error) {
    return { ok: false, error: decision.error ?? { code: "needs_approval", message: "Sin aprobación.", retryAfterMs: null } }
  }
  return { ok: true, value: await input.send() }
}
