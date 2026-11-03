import { createHmac } from "node:crypto"

import { readWebhook, stripSecrets } from "@/registry/lib/ci-checks"

/**
 * Example webhook. The secret stays in CI_CHECKS_WEBHOOK_SECRET.
 * Events: check_run, check_suite, status. The signature is HMAC-SHA256.
 */

export async function POST(request: Request) {
  const secret = process.env.CI_CHECKS_WEBHOOK_SECRET
  const rawBody = await request.text()
  if (!secret) {
    return Response.json({ error: "missing_secret" }, { status: 503, headers: { "cache-control": "no-store" } })
  }
  const result = await readWebhook({
    event: request.headers.get("x-github-event"),
    rawBody,
    signatureHeader: request.headers.get("x-hub-signature-256"),
    secret,
    hmac: (key, body) => createHmac("sha256", key).update(body).digest("hex"),
  })
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 401, headers: { "cache-control": "no-store" } })
  }
  return Response.json(stripSecrets(result), { headers: { "cache-control": "no-store" } })
}
