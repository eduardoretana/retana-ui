/**
 * Deterministic CI checks core. No React, no CSS, no network.
 * Network access is a separate module and is not re-exported here.
 */

export type {
  AgentFixEvent,
  AgentFixPort,
} from "./ci-checks/agent-port"
export { createAgentFixPort, notifyCheckFailed } from "./ci-checks/agent-port"
export type { ApprovalGate, MergeApproval, MergeApprovalRequest } from "./ci-checks/approval"
export { alwaysAskApproval } from "./ci-checks/approval"
export type { MergeDecision } from "./ci-checks/merge"
export { decideMerge, performMerge } from "./ci-checks/merge"
export {
  checkRunStatus,
  commitStatusState,
  countPassed,
  isVercelStatus,
  mergeChecks,
  normalizeCheckRun,
  normalizeCheckRunsPayload,
  normalizeCommitStatus,
  normalizePull,
  normalizeStatusesPayload,
} from "./ci-checks/normalize"
export { DEFAULT_POLL_MS, interpretPoll, isPrimaryRateLimit, isSecondaryRateLimit, pollRequestHeaders } from "./ci-checks/poll"
export { FALLBACK_DURATION_MS, estimateProgress, median } from "./ci-checks/progress"
export { stripSecrets } from "./ci-checks/secrets"
export type {
  CheckSource,
  CheckStatus,
  CiError,
  CiErrorCode,
  NormalizedCheck,
  NormalizedCommit,
  NormalizedPull,
  NormalizedSnapshot,
  PullState,
} from "./ci-checks/types"
export type { Sha256Hmac, WebhookResult } from "./ci-checks/webhook"
export { readWebhook, timingSafeEqualString, verifyGithubSignature } from "./ci-checks/webhook"
