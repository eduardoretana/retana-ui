/**
 * Framework-agnostic handlers. The route passes the token in.
 * Nothing here reads process.env, so a test can prove the browser path never sees it.
 */

import { alwaysAskApproval, type ApprovalGate } from "./approval"
import { createGithubAdapter, type FetchLike } from "./github-adapter"
import { performMerge } from "./merge"
import { countPassed, mergeChecks } from "./normalize"
import { stripSecrets } from "./secrets"
import type { CiError, NormalizedCheck, NormalizedPull, NormalizedSnapshot } from "./types"

export type HandlerResult = {
  status: number
  body: unknown
  headers: Record<string, string>
}

const noStore = { "cache-control": "no-store" }

export async function readPullChecks(input: {
  token: string | undefined
  owner: string
  repo: string
  pull: number
  checkRunsEtag?: string | null
  statusEtag?: string | null
  pullEtag?: string | null
  fetchImpl?: FetchLike
  now?: number
}): Promise<HandlerResult> {
  if (!input.token) {
    return { status: 503, headers: noStore, body: { error: { code: "missing_token", message: "Falta el token en el servidor.", retryAfterMs: null } satisfies CiError } }
  }
  const github = createGithubAdapter({ token: input.token, fetchImpl: input.fetchImpl, now: () => input.now ?? Date.now() })
  const pullRead = await github.getPull(input.owner, input.repo, input.pull, input.pullEtag ?? null)
  if (pullRead.error) return errorResult(pullRead.error, pullRead.waitMs)
  if (!pullRead.pull && !pullRead.notModified) {
    return { status: 502, headers: noStore, body: { error: { code: "upstream", message: "GitHub no devolvió el pull request.", retryAfterMs: null } satisfies CiError } }
  }
  if (!pullRead.pull) {
    return { status: 304, headers: { ...noStore, etag: pullRead.etag ?? "" }, body: null }
  }
  const checksRead = await github.listChecks(input.owner, input.repo, pullRead.pull.sha, {
    checkRuns: input.checkRunsEtag ?? null,
    statuses: input.statusEtag ?? null,
  })
  if (checksRead.error) return errorResult(checksRead.error, checksRead.waitMs)
  const snapshot = snapshotOf(pullRead.pull, mergeChecks(
    checksRead.checks.filter((check) => check.source === "check-run"),
    checksRead.checks.filter((check) => check.source === "commit-status"),
  ))
  return {
    status: 200,
    headers: {
      ...noStore,
      etag: checksRead.checkRunsEtag ?? pullRead.etag ?? "",
      "x-ci-checks-status-etag": checksRead.statusEtag ?? "",
      "x-ci-checks-wait-ms": String(checksRead.waitMs),
    },
    body: stripSecrets({
      snapshot,
      etag: checksRead.checkRunsEtag,
      statusEtag: checksRead.statusEtag,
      waitMs: checksRead.waitMs,
      checkRunsNotModified: checksRead.checkRunsNotModified,
      statusesNotModified: checksRead.statusesNotModified,
    }),
  }
}

export async function mergePullRequest(input: {
  token: string | undefined
  mergeEnabled: boolean
  owner: string
  repo: string
  pull: number
  sha: string
  confirmed: boolean
  grantedBy?: string
  gate?: ApprovalGate
  fetchImpl?: FetchLike
}): Promise<HandlerResult> {
  const outcome = await performMerge({
    mergeEnabled: input.mergeEnabled,
    confirmed: input.confirmed,
    gate: input.gate ?? alwaysAskApproval(),
    request: {
      owner: input.owner,
      repo: input.repo,
      pullNumber: input.pull,
      sha: input.sha,
      confirmed: input.confirmed,
      grantedBy: input.grantedBy,
    },
    send: async () => {
      if (!input.token) {
        return { error: { code: "missing_token", message: "Falta el token en el servidor.", retryAfterMs: null } satisfies CiError, read: null }
      }
      const github = createGithubAdapter({ token: input.token, fetchImpl: input.fetchImpl })
      const read = await github.merge(input.owner, input.repo, input.pull, { sha: input.sha, merge_method: "merge" })
      return { error: read.error, read }
    },
  })
  if (!outcome.ok) return { status: statusFor(outcome.error.code), headers: noStore, body: { error: outcome.error } }
  const read = outcome.value.read
  if (outcome.value.error) {
    const status = read && read.status >= 400 ? read.status : statusFor(outcome.value.error.code)
    return { status, headers: noStore, body: { error: outcome.value.error } }
  }
  if (!read) return { status: 502, headers: noStore, body: { error: { code: "upstream", message: "Sin respuesta de GitHub.", retryAfterMs: null } } }
  if (read.status === 200 || read.status === 201) {
    return { status: 200, headers: noStore, body: stripSecrets({ merged: true, message: "Merged into main" }) }
  }
  return {
    status: read.status,
    headers: noStore,
    body: { error: { code: "upstream", message: read.error?.message ?? "GitHub rechazó la fusión.", retryAfterMs: null } satisfies CiError },
  }
}

function snapshotOf(pull: NormalizedPull, checks: NormalizedCheck[]): NormalizedSnapshot {
  return { pull, checks, passed: countPassed(checks), total: checks.length }
}

function errorResult(error: CiError, waitMs: number): HandlerResult {
  return { status: statusFor(error.code), headers: { ...noStore, "retry-after": String(Math.ceil(waitMs / 1000)) }, body: { error } }
}

function statusFor(code: CiError["code"]) {
  if (code === "unauthorized") return 401
  if (code === "forbidden" || code === "merge_disabled" || code === "needs_approval" || code === "merge_denied") return 403
  if (code === "not_found") return 404
  if (code === "invalid" || code === "needs_confirmation") return 422
  if (code === "rate_limited" || code === "secondary_rate_limited") return 429
  if (code === "missing_token") return 503
  return 502
}
