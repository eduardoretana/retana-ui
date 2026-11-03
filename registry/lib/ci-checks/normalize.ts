/**
 * Turns GitHub check runs and commit statuses into the catalog model.
 * Shapes follow the public REST docs, anonymized by the caller.
 * https://docs.github.com/en/rest/checks/runs
 * https://docs.github.com/en/rest/commits/statuses
 */

import type { CheckSource, CheckStatus, NormalizedCheck, NormalizedCommit, NormalizedPull, PullState } from "./types"

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as UnknownRecord
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function durationBetween(startedAt: string | null, completedAt: string | null): number | null {
  if (!startedAt || !completedAt) return null
  const start = Date.parse(startedAt)
  const end = Date.parse(completedAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  return end - start
}

export function checkRunStatus(status: string | null, conclusion: string | null): CheckStatus {
  if (status === "queued") return "queued"
  if (status === "in_progress" || status === "pending" || status === "waiting" || status === "requested") return "running"
  if (status !== "completed") return "queued"
  if (conclusion === "success" || conclusion === "neutral") return "passed"
  if (conclusion === "skipped" || conclusion === "stale") return "skipped"
  if (conclusion === "cancelled") return "cancelled"
  return "failed"
}

export function commitStatusState(state: string | null): CheckStatus {
  if (state === "success") return "passed"
  if (state === "failure" || state === "error") return "failed"
  if (state === "pending") return "running"
  return "queued"
}

export function normalizeCheckRun(value: unknown): NormalizedCheck | null {
  const run = record(value)
  if (!run) return null
  const name = text(run.name)
  if (!name) return null
  const startedAt = text(run.started_at)
  const completedAt = text(run.completed_at)
  const id = numberValue(run.id)
  const output = record(run.output)
  return {
    id: id == null ? `check-run:${name}` : `check-run:${id}`,
    name,
    status: checkRunStatus(text(run.status), text(run.conclusion)),
    source: "check-run",
    startedAt,
    completedAt,
    durationMs: durationBetween(startedAt, completedAt),
    url: text(run.html_url) ?? text(run.details_url),
    description: text(output?.title) ?? text(output?.summary),
  }
}

export function normalizeCommitStatus(value: unknown): NormalizedCheck | null {
  const status = record(value)
  if (!status) return null
  const name = text(status.context)
  if (!name) return null
  const id = numberValue(status.id)
  const createdAt = text(status.created_at)
  const updatedAt = text(status.updated_at)
  return {
    id: id == null ? `status:${name}` : `status:${id}`,
    name,
    status: commitStatusState(text(status.state)),
    source: "commit-status",
    startedAt: createdAt,
    completedAt: updatedAt,
    durationMs: durationBetween(createdAt, updatedAt),
    url: text(status.target_url),
    description: text(status.description),
  }
}

/** Check runs win when the same name exists on both APIs. Status-only names stay. */
export function mergeChecks(checkRuns: readonly NormalizedCheck[], statuses: readonly NormalizedCheck[]): NormalizedCheck[] {
  const byName = new Map<string, NormalizedCheck>()
  for (const status of statuses) byName.set(status.name, status)
  for (const run of checkRuns) byName.set(run.name, run)
  return [...byName.values()]
}

export function normalizeCheckRunsPayload(payload: unknown): NormalizedCheck[] {
  const root = record(payload)
  const list = Array.isArray(payload) ? payload : root && Array.isArray(root.check_runs) ? root.check_runs : []
  return list.map(normalizeCheckRun).filter((check): check is NormalizedCheck => check != null)
}

export function normalizeStatusesPayload(payload: unknown): NormalizedCheck[] {
  const root = record(payload)
  const list = Array.isArray(payload) ? payload : root && Array.isArray(root.statuses) ? root.statuses : []
  return list.map(normalizeCommitStatus).filter((check): check is NormalizedCheck => check != null)
}

export function countPassed(checks: readonly NormalizedCheck[]) {
  return checks.filter((check) => check.status === "passed").length
}

function pullState(value: UnknownRecord): PullState {
  if (text(value.merged_at) || value.merged === true) return "merged"
  const state = text(value.state)
  if (state === "closed") return "closed"
  return "open"
}

export function normalizePull(payload: unknown): NormalizedPull | null {
  const pull = record(payload)
  if (!pull) return null
  const number = numberValue(pull.number)
  const title = text(pull.title)
  const head = record(pull.head)
  const base = record(pull.base)
  const sha = text(head?.sha)
  if (number == null || !title || !sha) return null
  const commits = Array.isArray(pull.commits) ? pull.commits.map(normalizeCommit).filter((commit): commit is NormalizedCommit => commit != null) : []
  return {
    number,
    title,
    state: pullState(pull),
    sha,
    message: text(head?.label) ?? title,
    baseRef: text(base?.ref) ?? "main",
    headRef: text(head?.ref) ?? "",
    additions: numberValue(pull.additions) ?? 0,
    deletions: numberValue(pull.deletions) ?? 0,
    commits,
  }
}

function normalizeCommit(value: unknown): NormalizedCommit | null {
  const commit = record(value)
  if (!commit) return null
  const nested = record(commit.commit)
  const sha = text(commit.sha)
  const message = text(nested?.message) ?? text(commit.message)
  if (!sha || !message) return null
  const author = record(nested?.author) ?? record(commit.author)
  const login = text(record(commit.author)?.login)
  return {
    sha,
    message: message.split("\n")[0] ?? message,
    author: login ?? text(author?.name) ?? "unknown",
    committedAt: text(author?.date) ?? text(commit.committed_at),
  }
}

export function isVercelStatus(check: NormalizedCheck) {
  return check.source === "commit-status" && /vercel/i.test(check.name)
}

export function sourceOf(check: NormalizedCheck): CheckSource {
  return check.source
}
