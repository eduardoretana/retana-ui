/**
 * Verifies X-Hub-Signature-256 and reads check_run, check_suite, and status.
 * https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 * The HMAC function is injected so this file does not do I/O.
 */

import { normalizeCheckRun, normalizeCommitStatus } from "./normalize"
import type { NormalizedCheck } from "./types"

export type Sha256Hmac = (secret: string, body: string) => string | Promise<string>

export type WebhookResult =
  | { ok: true; ignored: true; event: string }
  | { ok: true; ignored: false; event: string; action: string | null; sha: string | null; checks: NormalizedCheck[] }
  | { ok: false; error: "bad_signature" | "unsupported" }

export function timingSafeEqualString(left: string, right: string) {
  const length = Math.max(left.length, right.length)
  let diff = left.length === right.length ? 0 : 1
  for (let index = 0; index < length; index += 1) {
    const a = left.charCodeAt(index) || 0
    const b = right.charCodeAt(index) || 0
    diff |= a ^ b
  }
  return diff === 0
}

export async function verifyGithubSignature(input: {
  rawBody: string
  signatureHeader: string | null
  secret: string
  hmac: Sha256Hmac
}) {
  const header = input.signatureHeader?.trim() ?? ""
  if (!header.startsWith("sha256=")) return false
  const provided = header.slice("sha256=".length)
  const digest = await input.hmac(input.secret, input.rawBody)
  const expected = digest.startsWith("sha256=") ? digest.slice("sha256=".length) : digest
  if (!/^[0-9a-f]+$/i.test(provided) || !/^[0-9a-f]+$/i.test(expected)) return false
  return timingSafeEqualString(provided.toLowerCase(), expected.toLowerCase())
}

export async function readWebhook(input: {
  event: string | null
  rawBody: string
  signatureHeader: string | null
  secret: string
  hmac: Sha256Hmac
}): Promise<WebhookResult> {
  const valid = await verifyGithubSignature(input)
  if (!valid) return { ok: false, error: "bad_signature" }
  let payload: unknown
  try {
    payload = JSON.parse(input.rawBody) as unknown
  } catch {
    return { ok: false, error: "unsupported" }
  }
  const event = input.event ?? ""
  if (event !== "check_run" && event !== "check_suite" && event !== "status") {
    return { ok: true, ignored: true, event }
  }
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
  const action = typeof root.action === "string" ? root.action : null
  if (event === "check_run") {
    const check = normalizeCheckRun(root.check_run)
    const sha = nestedSha(root.check_run)
    return { ok: true, ignored: false, event, action, sha, checks: check ? [check] : [] }
  }
  if (event === "status") {
    const check = normalizeCommitStatus(root)
    const sha = typeof root.sha === "string" ? root.sha : null
    return { ok: true, ignored: false, event, action, sha, checks: check ? [check] : [] }
  }
  const suite = root.check_suite && typeof root.check_suite === "object" ? (root.check_suite as Record<string, unknown>) : null
  const runs = suite && Array.isArray(suite.check_runs) ? suite.check_runs : []
  const checks = runs.map(normalizeCheckRun).filter((check): check is NormalizedCheck => check != null)
  const sha = suite && typeof suite.head_sha === "string" ? suite.head_sha : null
  return { ok: true, ignored: false, event, action, sha, checks }
}

function nestedSha(value: unknown) {
  if (!value || typeof value !== "object") return null
  const head = (value as { head_sha?: unknown }).head_sha
  if (typeof head === "string") return head
  const checkSuite = (value as { check_suite?: { head_sha?: unknown } }).check_suite
  return checkSuite && typeof checkSuite.head_sha === "string" ? checkSuite.head_sha : null
}
