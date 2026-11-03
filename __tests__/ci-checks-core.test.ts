import { createHmac } from "node:crypto"

import { describe, expect, it, vi } from "vitest"

import { alwaysAskApproval } from "@/registry/lib/ci-checks/approval"
import { createGithubAdapter, type FetchLike } from "@/registry/lib/ci-checks/github-adapter"
import { mergePullRequest, readPullChecks } from "@/registry/lib/ci-checks/http"
import { performMerge } from "@/registry/lib/ci-checks/merge"
import {
  countPassed,
  isVercelStatus,
  mergeChecks,
  normalizeCheckRun,
  normalizeCheckRunsPayload,
  normalizeCommitStatus,
  normalizeStatusesPayload,
} from "@/registry/lib/ci-checks/normalize"
import { interpretPoll } from "@/registry/lib/ci-checks/poll"
import { estimateProgress, median } from "@/registry/lib/ci-checks/progress"
import { stripSecrets } from "@/registry/lib/ci-checks/secrets"
import { readWebhook } from "@/registry/lib/ci-checks/webhook"

/** Anonymized from https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference */
const checkRunsDoc = {
  total_count: 1,
  check_runs: [
    {
      id: 4,
      name: "mighty_readme",
      status: "completed",
      conclusion: "success",
      started_at: "2018-05-04T01:14:52Z",
      completed_at: "2018-05-04T01:14:52Z",
      html_url: "https://example.invalid/taller-ladrillo/folio/runs/4",
      output: { title: "Mighty Readme report", summary: "There are 0 failures" },
    },
  ],
}

/** Anonymized from https://docs.github.com/en/rest/commits/statuses#get-the-combined-status-for-a-specific-reference */
const statusesDoc = {
  state: "pending",
  statuses: [
    {
      id: 1,
      state: "success",
      description: "Deployment has completed",
      target_url: "https://example.invalid/preview/folio",
      context: "Vercel – taller-ladrillo",
      created_at: "2012-07-20T01:19:13Z",
      updated_at: "2012-07-20T01:19:13Z",
    },
  ],
}

const hmac = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("hex")

describe("normalize public GitHub examples", () => {
  it("maps a documented check run and a Vercel commit status", () => {
    const runs = normalizeCheckRunsPayload(checkRunsDoc)
    const statuses = normalizeStatusesPayload(statusesDoc)
    expect(runs[0]).toMatchObject({ name: "mighty_readme", status: "passed", source: "check-run", durationMs: 0 })
    expect(statuses[0]).toMatchObject({ name: "Vercel – taller-ladrillo", status: "passed", source: "commit-status" })
    expect(isVercelStatus(statuses[0]!)).toBe(true)
    const merged = mergeChecks(runs, statuses)
    expect(merged).toHaveLength(2)
    expect(countPassed(merged)).toBe(2)
  })

  it("walks queued, running, failed, rerun, and passed", () => {
    const steps = [
      { id: 1, name: "e2e", status: "queued", conclusion: null },
      { id: 1, name: "e2e", status: "in_progress", conclusion: null, started_at: "2026-11-02T15:00:00Z" },
      { id: 1, name: "e2e", status: "completed", conclusion: "failure", started_at: "2026-11-02T15:00:00Z", completed_at: "2026-11-02T15:00:29Z" },
      { id: 2, name: "e2e", status: "queued", conclusion: null },
      { id: 2, name: "e2e", status: "completed", conclusion: "success", started_at: "2026-11-02T15:04:00Z", completed_at: "2026-11-02T15:04:41Z" },
    ].map((run) => normalizeCheckRun(run)?.status)
    expect(steps).toEqual(["queued", "running", "failed", "queued", "passed"])
  })

  it("keeps the check run when a status reuses the name", () => {
    const run = normalizeCheckRun({ id: 9, name: "lint", status: "completed", conclusion: "success" })
    const status = normalizeCommitStatus({ id: 3, context: "lint", state: "pending" })
    expect(mergeChecks(run ? [run] : [], status ? [status] : [])[0]?.source).toBe("check-run")
  })
})

describe("progress estimates", () => {
  it("uses the median history and caps a running check", () => {
    expect(median([10, 30, 20, 40])).toBe(25)
    const estimate = estimateProgress({
      status: "running",
      startedAt: "2026-11-02T15:00:00Z",
      now: Date.parse("2026-11-02T15:00:10Z"),
      historyMs: [20_000, 40_000],
    })
    expect(estimate.estimated).toBe(true)
    expect(estimate.progress).toBeCloseTo(10_000 / 30_000)
  })
})

describe("poll errors", () => {
  const now = Date.parse("2026-11-02T15:00:00Z")

  it("keeps the etag on 304", () => {
    const decision = interpretPoll({ status: 304, headers: { etag: '"abc"' }, now })
    expect(decision.kind).toBe("not_modified")
    expect(decision.etag).toBe('"abc"')
  })

  it("classifies 401, 403, 404, and 422", () => {
    expect(interpretPoll({ status: 401, body: '{"message":"Bad credentials"}', now }).error?.code).toBe("unauthorized")
    expect(interpretPoll({ status: 403, body: '{"message":"Resource not accessible by integration"}', now }).error?.code).toBe("forbidden")
    expect(interpretPoll({ status: 404, body: '{"message":"Not Found"}', now }).error?.code).toBe("not_found")
    expect(interpretPoll({ status: 422, body: '{"message":"Validation Failed","errors":[{"message":"Required status check \\"lint\\" is expected."}]}', now }).error?.message).toMatch(/lint/)
  })

  it("waits on a secondary rate limit", () => {
    const decision = interpretPoll({
      status: 403,
      headers: { "retry-after": "30", "x-ratelimit-remaining": "40" },
      body: "You have exceeded a secondary rate limit.",
      now,
    })
    expect(decision.error?.code).toBe("secondary_rate_limited")
    expect(decision.waitMs).toBe(30_000)
  })

  it("waits until reset when the primary limit is empty", () => {
    const decision = interpretPoll({
      status: 403,
      headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String((now + 60_000) / 1000) },
      now,
    })
    expect(decision.error?.code).toBe("rate_limited")
    expect(decision.waitMs).toBe(60_000)
  })
})

describe("webhook", () => {
  it("rejects a bad signature and accepts check_run, check_suite, and status", async () => {
    const secret = "not-a-real-secret"
    const checkRun = JSON.stringify({
      action: "completed",
      check_run: { id: 4, name: "lint", status: "completed", conclusion: "success", head_sha: "b7e21aa", html_url: "https://example.invalid/run/4" },
    })
    const bad = await readWebhook({ event: "check_run", rawBody: checkRun, signatureHeader: "sha256=00", secret, hmac })
    expect(bad.ok).toBe(false)
    const good = await readWebhook({
      event: "check_run",
      rawBody: checkRun,
      signatureHeader: `sha256=${hmac(secret, checkRun)}`,
      secret,
      hmac,
    })
    expect(good.ok && !good.ignored && good.checks[0]?.name).toBe("lint")

    const suite = JSON.stringify({
      action: "completed",
      check_suite: { head_sha: "b7e21aa", check_runs: [{ id: 8, name: "unit", status: "queued", conclusion: null }] },
    })
    const suiteResult = await readWebhook({
      event: "check_suite",
      rawBody: suite,
      signatureHeader: `sha256=${hmac(secret, suite)}`,
      secret,
      hmac,
    })
    expect(suiteResult.ok && !suiteResult.ignored && suiteResult.sha).toBe("b7e21aa")

    const status = JSON.stringify({ sha: "c4d90f1", state: "pending", context: "Vercel – taller-ladrillo", target_url: "https://example.invalid/preview" })
    const statusResult = await readWebhook({
      event: "status",
      rawBody: status,
      signatureHeader: `sha256=${hmac(secret, status)}`,
      secret,
      hmac,
    })
    expect(statusResult.ok && !statusResult.ignored && statusResult.checks[0]?.source).toBe("commit-status")
  })
})

describe("merge guard", () => {
  it("does not call the API without confirmation", async () => {
    const send = vi.fn()
    const result = await performMerge({
      mergeEnabled: true,
      confirmed: false,
      gate: alwaysAskApproval(),
      request: { owner: "taller", repo: "ladrillo", pullNumber: 42, sha: "b7e21aa", confirmed: false },
      send,
    })
    expect(result.ok).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it("does not call the API when merge is off", async () => {
    const send = vi.fn()
    const result = await performMerge({
      mergeEnabled: false,
      confirmed: true,
      gate: alwaysAskApproval(),
      request: { owner: "taller", repo: "ladrillo", pullNumber: 42, sha: "b7e21aa", confirmed: true, grantedBy: "Noa" },
      send,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe("merge_disabled")
    expect(send).not.toHaveBeenCalled()
  })

  it("asks the gate and still refuses without a person", async () => {
    const send = vi.fn()
    const review = vi.fn(alwaysAskApproval().review)
    const result = await performMerge({
      mergeEnabled: true,
      confirmed: true,
      gate: { review },
      request: { owner: "taller", repo: "ladrillo", pullNumber: 42, sha: "b7e21aa", confirmed: true },
      send,
    })
    expect(review).toHaveBeenCalled()
    expect(result.ok).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })
})

describe("server handler", () => {
  const token = "test-token-not-real"

  function fetchMock(status: number, body: unknown, extra: Record<string, string> = {}): FetchLike {
    return vi.fn(async () => ({
      status,
      headers: { get: (name: string) => extra[name.toLowerCase()] ?? null },
      text: async () => JSON.stringify(body),
    }))
  }

  it("does not fetch or leak the token when the server has none", async () => {
    const fetchImpl = vi.fn()
    const result = await readPullChecks({ token: undefined, owner: "taller", repo: "ladrillo", pull: 42, fetchImpl: fetchImpl as unknown as FetchLike })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(JSON.stringify(result.body)).not.toContain("test-token")
    expect(result.status).toBe(503)
  })

  it("sends the token only to GitHub and strips it from the client body", async () => {
    const fetchImpl = vi.fn(async (url: string, _init?: { headers?: Record<string, string> }) => {
      if (String(url).endsWith("/pulls/42")) {
        return { status: 200, headers: { get: () => null }, text: async () => JSON.stringify({ number: 42, title: "Folio", state: "open", additions: 86, deletions: 12, head: { sha: "b7e21aa", ref: "feat/folio" }, base: { ref: "main" }, token }) }
      }
      if (String(url).includes("/check-runs")) {
        return { status: 200, headers: { get: (name: string) => (name === "etag" ? '"runs"' : null) }, text: async () => JSON.stringify(checkRunsDoc) }
      }
      return { status: 200, headers: { get: (name: string) => (name === "etag" ? '"status"' : null) }, text: async () => JSON.stringify(statusesDoc) }
    })
    const result = await readPullChecks({ token, owner: "taller", repo: "ladrillo", pull: 42, fetchImpl: fetchImpl as unknown as FetchLike })
    const clientBody = JSON.stringify(result.body)
    expect(clientBody).not.toContain(token)
    expect(clientBody).not.toContain("authorization")
    const init = fetchImpl.mock.calls[0]?.[1]
    expect(init?.headers?.authorization).toBe(`Bearer ${token}`)
    expect(result.status).toBe(200)
  })

  it("does not call GitHub merge without confirmation", async () => {
    const fetchImpl = vi.fn()
    const result = await mergePullRequest({
      token,
      mergeEnabled: true,
      owner: "taller",
      repo: "ladrillo",
      pull: 42,
      sha: "b7e21aa",
      confirmed: false,
      fetchImpl: fetchImpl as unknown as FetchLike,
    })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(result.status).toBe(422)
  })

  it("surfaces a branch protection rejection", async () => {
    const fetchImpl = fetchMock(405, { message: "Required status check \"lint\" is expected." })
    const result = await mergePullRequest({
      token,
      mergeEnabled: true,
      owner: "taller",
      repo: "ladrillo",
      pull: 42,
      sha: "b7e21aa",
      confirmed: true,
      grantedBy: "Noa",
      fetchImpl,
    })
    expect(result.status).toBe(405)
    expect(JSON.stringify(result.body)).toMatch(/lint/)
    expect(JSON.stringify(result.body)).not.toContain(token)
  })
})

describe("stripSecrets", () => {
  it("removes credential fields", () => {
    expect(stripSecrets({ title: "Folio", token: "ghp_secret", nested: { authorization: "Bearer x" } })).toEqual({ title: "Folio", nested: {} })
  })
})

describe("adapter request", () => {
  it("sends If-None-Match", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: { headers?: Record<string, string> }) => ({ status: 304, headers: { get: (name: string) => (name === "etag" ? '"abc"' : null) }, text: async () => "" }))
    const adapter = createGithubAdapter({ token: "test-token-not-real", fetchImpl: fetchImpl as unknown as FetchLike })
    const read = await adapter.getPull("taller", "ladrillo", 42, '"abc"')
    expect(read.notModified).toBe(true)
    const init = fetchImpl.mock.calls[0]?.[1]
    expect(init?.headers?.["if-none-match"]).toBe('"abc"')
  })
})
