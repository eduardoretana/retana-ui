/**
 * GitHub REST adapter. Network lives here, not in the deterministic core.
 * The token is an argument. This file does not read the environment.
 */

import { nextLink } from "./pages"
import { normalizeCheckRunsPayload, normalizePull, normalizeStatusesPayload } from "./normalize"
import { interpretPoll, pollRequestHeaders, type HeaderMap } from "./poll"
import type { CiError, NormalizedCheck, NormalizedPull } from "./types"

export type FetchLike = (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{
  status: number
  headers: { get(name: string): string | null }
  text(): Promise<string>
}>

export type GithubAdapterOptions = {
  token: string
  fetchImpl?: FetchLike
  baseUrl?: string
  now?: () => number
}

export type GithubRead = {
  status: number
  etag: string | null
  waitMs: number
  error: CiError | null
  notModified: boolean
  body: string
  link: string | null
}

function headersOf(response: { headers: { get(name: string): string | null } }): HeaderMap {
  const names = ["etag", "link", "retry-after", "x-ratelimit-remaining", "x-ratelimit-reset"]
  const headers: HeaderMap = {}
  for (const name of names) headers[name] = response.headers.get(name)
  return headers
}

export function createGithubAdapter(options: GithubAdapterOptions) {
  const fetchImpl = options.fetchImpl ?? (globalThis.fetch as unknown as FetchLike)
  const baseUrl = (options.baseUrl ?? "https://api.github.com").replace(/\/$/, "")
  const now = options.now ?? (() => Date.now())

  async function request(path: string, init: { method?: string; etag?: string | null; body?: string }): Promise<GithubRead> {
    const headers = {
      ...pollRequestHeaders(init.etag ?? null),
      authorization: `Bearer ${options.token}`,
    }
    const target = path.startsWith("http") ? path : `${baseUrl}${path}`
    const response = await fetchImpl(target, { method: init.method ?? "GET", headers, body: init.body })
    const body = await response.text()
    const decision = interpretPoll({
      status: response.status,
      headers: headersOf(response),
      body,
      now: now(),
      etagSent: init.etag ?? null,
    })
    return {
      status: response.status,
      etag: decision.etag,
      waitMs: decision.waitMs,
      error: decision.error,
      notModified: decision.kind === "not_modified",
      body,
      link: headersOf(response).link ?? null,
    }
  }

  return {
    async getPull(owner: string, repo: string, pull: number, etag: string | null) {
      const read = await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pull}`, { etag })
      const pullBody: NormalizedPull | null = read.notModified || read.error ? null : normalizePull(parseJson(read.body))
      return { ...read, pull: pullBody }
    },
    async listChecks(owner: string, repo: string, sha: string, etags: { checkRuns: string | null; statuses: string | null }) {
      const root = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`
      const runs: NormalizedCheck[] = []
      let checkRunsEtag: string | null = null
      let checkRunsNotModified = false
      let runsError: CiError | null = null
      let runsWait = 0
      let url: string | null = `${root}/check-runs?per_page=100`
      let first = true
      while (url) {
        const page = await request(url, { etag: first ? etags.checkRuns : null })
        first = false
        checkRunsEtag = page.etag
        runsWait = Math.max(runsWait, page.waitMs)
        if (page.error) {
          runsError = page.error
          break
        }
        if (page.notModified) {
          checkRunsNotModified = true
          break
        }
        runs.push(...normalizeCheckRunsPayload(parseJson(page.body)))
        url = nextLink(page.link)
      }
      const statuses = await request(`${root}/status`, { etag: etags.statuses })
      const error = runsError ?? statuses.error
      const checks: NormalizedCheck[] = [
        ...runs,
        ...(statuses.notModified || statuses.error ? [] : normalizeStatusesPayload(parseJson(statuses.body))),
      ]
      return {
        error,
        waitMs: Math.max(runsWait, statuses.waitMs),
        checkRunsEtag,
        statusEtag: statuses.etag,
        checkRunsNotModified,
        statusesNotModified: statuses.notModified,
        checks,
      }
    },
    async merge(owner: string, repo: string, pull: number, body: { sha?: string; merge_method?: "merge" | "squash" | "rebase" }) {
      return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pull}/merge`, {
        method: "PUT",
        body: JSON.stringify(body),
      })
    },
  }
}

function parseJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}
