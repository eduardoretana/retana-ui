/**
 * Own model for a pull request and its checks.
 * Deterministic. No React, no DOM, no network.
 */

export type CheckStatus = "queued" | "running" | "passed" | "failed" | "skipped" | "cancelled"

export type CheckSource = "check-run" | "commit-status"

export type NormalizedCheck = {
  id: string
  name: string
  status: CheckStatus
  source: CheckSource
  startedAt: string | null
  completedAt: string | null
  /** Measured from timestamps when both exist. Otherwise null. */
  durationMs: number | null
  url: string | null
  description: string | null
}

export type NormalizedCommit = {
  sha: string
  message: string
  author: string
  committedAt: string | null
}

export type PullState = "open" | "closed" | "merged"

export type NormalizedPull = {
  number: number
  title: string
  state: PullState
  sha: string
  message: string
  baseRef: string
  headRef: string
  additions: number
  deletions: number
  commits: NormalizedCommit[]
}

export type NormalizedSnapshot = {
  pull: NormalizedPull
  checks: NormalizedCheck[]
  passed: number
  total: number
}

export type CiErrorCode =
  | "missing_token"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid"
  | "rate_limited"
  | "secondary_rate_limited"
  | "merge_disabled"
  | "needs_confirmation"
  | "needs_approval"
  | "merge_denied"
  | "upstream"

export type CiError = {
  code: CiErrorCode
  message: string
  retryAfterMs: number | null
}
