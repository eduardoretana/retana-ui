import type { CiTransport } from "@/registry/hooks/use-ci-checks"
import type { CiError, NormalizedSnapshot } from "@/registry/lib/ci-checks"

export const liveSnapshot: NormalizedSnapshot = {
  passed: 2,
  total: 5,
  pull: {
    number: 42,
    title: "Guardar el folio del horno al recargar",
    state: "open",
    sha: "b7e21aab7e21aa",
    message: "feat/folio-horno",
    baseRef: "main",
    headRef: "feat/folio-horno",
    additions: 86,
    deletions: 12,
    commits: [
      { sha: "b7e21aab7e21aa", message: "Leer el folio desde la ficha", author: "Noa Ferrer", committedAt: "2026-11-02T15:00:00Z" },
    ],
  },
  checks: [
    { id: "lint", name: "lint", status: "passed", source: "check-run", startedAt: "2026-11-02T15:00:00Z", completedAt: "2026-11-02T15:00:11Z", durationMs: 11_000, url: null, description: null },
    { id: "typecheck", name: "typecheck", status: "passed", source: "check-run", startedAt: "2026-11-02T15:00:00Z", completedAt: "2026-11-02T15:00:19Z", durationMs: 19_000, url: null, description: null },
    { id: "unit", name: "unit", status: "running", source: "check-run", startedAt: "2026-11-02T15:00:20Z", completedAt: null, durationMs: null, url: null, description: null },
    { id: "preview", name: "Vercel – taller-ladrillo", status: "queued", source: "commit-status", startedAt: null, completedAt: null, durationMs: null, url: "https://example.invalid/preview/folio", description: "En espera" },
    { id: "e2e", name: "e2e", status: "queued", source: "check-run", startedAt: null, completedAt: null, durationMs: null, url: null, description: null },
  ],
}

export function fixtureTransport(input: { snapshot?: NormalizedSnapshot | null; error?: CiError; hang?: boolean } = {}): CiTransport {
  return {
    load: () =>
      input.hang
        ? new Promise(() => {})
        : Promise.resolve({
            status: input.error ? 403 : 200,
            etag: null,
            body: input.error ? { error: input.error } : { snapshot: input.snapshot ?? undefined },
          }),
    merge: async () => ({ ok: false, message: "La protección de la rama rechazó la fusión." }),
  }
}

export const filled = { snapshot: liveSnapshot }
export const empty = { snapshot: null }
export const loading = { hang: true }
export const error = { error: { code: "forbidden" as const, message: "GitHub negó el acceso.", retryAfterMs: null } }
