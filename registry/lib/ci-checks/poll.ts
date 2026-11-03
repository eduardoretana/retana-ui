/**
 * Pure polling decisions. The caller performs the request.
 * Primary rate limit: remaining 0, wait until reset.
 * Secondary rate limit: Retry-After, or the documented error text.
 * https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
 */

import type { CiError } from "./types"

export const DEFAULT_POLL_MS = 15_000

export type HeaderMap = Record<string, string | null | undefined>

export type PollDecision = {
  kind: "ok" | "not_modified" | "error"
  etag: string | null
  waitMs: number
  error: CiError | null
}

function header(headers: HeaderMap, name: string) {
  const target = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value ?? null
  }
  return null
}

export function pollRequestHeaders(etag: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  }
  if (etag) headers["if-none-match"] = etag
  return headers
}

function retryAfterMs(value: string | null, now: number): number | null {
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  if (!Number.isFinite(date)) return null
  return Math.max(0, date - now)
}

export function isSecondaryRateLimit(status: number, body: string, headers: HeaderMap) {
  if (status !== 403 && status !== 429) return false
  if (header(headers, "retry-after")) return true
  return /secondary rate limit/i.test(body)
}

export function isPrimaryRateLimit(status: number, headers: HeaderMap) {
  if (status !== 403 && status !== 429) return false
  return header(headers, "x-ratelimit-remaining") === "0"
}

export function interpretPoll(input: {
  status: number
  headers?: HeaderMap
  body?: string
  now: number
  attempt?: number
  etagSent?: string | null
}): PollDecision {
  const headers = input.headers ?? {}
  const body = input.body ?? ""
  const etag = header(headers, "etag") ?? input.etagSent ?? null
  const attempt = input.attempt ?? 0
  const resetHeader = header(headers, "x-ratelimit-reset")
  const resetMs = resetHeader && Number.isFinite(Number(resetHeader)) ? Number(resetHeader) * 1000 - input.now : null
  const remaining = header(headers, "x-ratelimit-remaining")

  if (input.status === 304) {
    return { kind: "not_modified", etag, waitMs: coolDown(remaining, resetMs), error: null }
  }

  if (isSecondaryRateLimit(input.status, body, headers) && !isPrimaryRateLimit(input.status, headers)) {
    const waitMs = retryAfterMs(header(headers, "retry-after"), input.now) ?? 60_000
    return {
      kind: "error",
      etag,
      waitMs,
      error: {
        code: "secondary_rate_limited",
        message: "GitHub aplicó un límite secundario. Hay que esperar antes de volver a pedir.",
        retryAfterMs: waitMs,
      },
    }
  }

  if (isPrimaryRateLimit(input.status, headers)) {
    const waitMs = Math.max(0, resetMs ?? 60_000)
    return {
      kind: "error",
      etag,
      waitMs,
      error: {
        code: "rate_limited",
        message: "Se agotó el cupo de GitHub para esta hora.",
        retryAfterMs: waitMs,
      },
    }
  }

  if (input.status === 401) {
    return { kind: "error", etag, waitMs: 0, error: { code: "unauthorized", message: "GitHub rechazó la credencial.", retryAfterMs: null } }
  }
  if (input.status === 403) {
    return { kind: "error", etag, waitMs: 0, error: { code: "forbidden", message: messageOf(body) ?? "GitHub negó el acceso.", retryAfterMs: null } }
  }
  if (input.status === 404) {
    return { kind: "error", etag, waitMs: 0, error: { code: "not_found", message: "No está el pull request o el commit.", retryAfterMs: null } }
  }
  if (input.status === 422) {
    return { kind: "error", etag, waitMs: 0, error: { code: "invalid", message: messageOf(body) ?? "GitHub no aceptó la petición.", retryAfterMs: null } }
  }
  if (input.status >= 200 && input.status < 300) {
    return { kind: "ok", etag, waitMs: coolDown(remaining, resetMs), error: null }
  }

  const waitMs = Math.min(60_000, 1000 * 2 ** Math.min(attempt, 5))
  return {
    kind: "error",
    etag,
    waitMs,
    error: { code: "upstream", message: messageOf(body) ?? `GitHub respondió ${input.status}.`, retryAfterMs: waitMs },
  }
}

function coolDown(remaining: string | null, resetMs: number | null) {
  if (remaining != null && Number(remaining) < 2 && resetMs != null && resetMs > 0) return resetMs
  return DEFAULT_POLL_MS
}

function messageOf(body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: unknown; errors?: { message?: unknown }[] }
    if (typeof parsed.message === "string" && parsed.message && parsed.message !== "Validation Failed") {
      const detail = parsed.errors?.map((error) => error.message).filter((item): item is string => typeof item === "string")
      return detail && detail.length > 0 ? `${parsed.message}: ${detail.join(" ")}` : parsed.message
    }
    const detail = parsed.errors?.map((error) => error.message).filter((item): item is string => typeof item === "string")
    if (detail && detail.length > 0) return detail.join(" ")
  } catch {
    return null
  }
  return null
}
