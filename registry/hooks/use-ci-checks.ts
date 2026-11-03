"use client"

/**
 * Client store for CI Checks Live.
 * Talks to a transport the host provides. It has no token parameter and
 * never sets an Authorization header.
 */

import * as React from "react"

import type { CiError, NormalizedSnapshot } from "@/registry/retana/lib/ci-checks"

export type CiSnapshotResponse = {
  snapshot?: NormalizedSnapshot
  etag?: string | null
  statusEtag?: string | null
  waitMs?: number
  error?: CiError
  checkRunsNotModified?: boolean
  statusesNotModified?: boolean
}

export type CiTransport = {
  load: (input: { etag: string | null }) => Promise<{ status: number; body: CiSnapshotResponse | null; etag: string | null }>
  merge: (input: { confirmed: boolean; grantedBy?: string; sha: string }) => Promise<{ ok: boolean; message: string }>
}

export type UseCiChecks = {
  snapshot: NormalizedSnapshot | null
  error: CiError | null
  loading: boolean
  merge: (input: { confirmed: boolean; grantedBy?: string }) => Promise<{ ok: boolean; message: string }>
}

export function useCiChecks(options: { transport: CiTransport; pollMs?: number }): UseCiChecks {
  const { transport, pollMs = 0 } = options
  const [snapshot, setSnapshot] = React.useState<NormalizedSnapshot | null>(null)
  const [error, setError] = React.useState<CiError | null>(null)
  const [loading, setLoading] = React.useState(true)
  const etag = React.useRef<string | null>(null)
  const transportRef = React.useRef(transport)

  React.useEffect(() => {
    transportRef.current = transport
  }, [transport])

  React.useEffect(() => {
    let stopped = false
    async function tick() {
      const result = await transportRef.current.load({ etag: etag.current })
      if (stopped) return
      if (result.etag) etag.current = result.etag
      if (result.status === 304) {
        setLoading(false)
        return
      }
      if (result.body?.error) setError(result.body.error)
      else setError(null)
      if (result.body?.snapshot) setSnapshot(result.body.snapshot)
      setLoading(false)
    }
    void tick()
    if (pollMs <= 0) return () => {
      stopped = true
    }
    const timer = window.setInterval(() => void tick(), pollMs)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [pollMs])

  const merge = React.useCallback(async (input: { confirmed: boolean; grantedBy?: string }) => {
    const sha = snapshot?.pull.sha ?? ""
    return transportRef.current.merge({ ...input, sha })
  }, [snapshot?.pull.sha])

  return { snapshot, error, loading, merge }
}

/** Browser transport. Relative URL only. No Authorization header is set. */
export function createHttpTransport(endpoint: string, fetchImpl: typeof fetch = globalThis.fetch): CiTransport {
  return {
    async load({ etag }) {
      const headers: Record<string, string> = { accept: "application/json" }
      if (etag) headers["if-none-match"] = etag
      const response = await fetchImpl(endpoint, { method: "GET", headers, cache: "no-store" })
      if (response.status === 304) return { status: 304, body: null, etag: response.headers.get("etag") }
      const body = (await response.json()) as CiSnapshotResponse
      return { status: response.status, body, etag: response.headers.get("etag") }
    },
    async merge(input) {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ confirmed: input.confirmed, grantedBy: input.grantedBy, sha: input.sha }),
        cache: "no-store",
      })
      const body = (await response.json()) as { message?: string; error?: { message?: string }; merged?: boolean }
      return { ok: response.ok && body.merged === true, message: body.error?.message ?? body.message ?? "" }
    },
  }
}
