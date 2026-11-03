const SECRET_KEYS = new Set([
  "token",
  "access_token",
  "authorization",
  "webhook_secret",
  "secret",
  "password",
  "github_token",
])

/** Drops credential-shaped fields before a payload is sent to the browser. */
export function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets)
  if (!value || typeof value !== "object") return value
  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEYS.has(key.toLowerCase())) continue
    next[key] = stripSecrets(child)
  }
  return next
}
