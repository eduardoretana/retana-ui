import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CiChecksLive, ciChecksLiveLabelsEs } from "@/registry/blocks/ci-checks-live"
import type { CiTransport } from "@/registry/hooks/use-ci-checks"
import type { NormalizedSnapshot } from "@/registry/lib/ci-checks"

const snapshot: NormalizedSnapshot = {
  passed: 5,
  total: 5,
  pull: {
    number: 42,
    title: "Guardar el folio del horno al recargar",
    state: "open",
    sha: "b7e21aa",
    message: "feat/folio-horno",
    baseRef: "main",
    headRef: "feat/folio-horno",
    additions: 86,
    deletions: 12,
    commits: [{ sha: "b7e21aa", message: "Leer el folio", author: "Noa Ferrer", committedAt: "2026-11-02T15:00:00Z" }],
  },
  checks: [
    { id: "lint", name: "lint", status: "passed", source: "check-run", startedAt: null, completedAt: null, durationMs: 11_000, url: null, description: null },
    { id: "typecheck", name: "typecheck", status: "passed", source: "check-run", startedAt: null, completedAt: null, durationMs: 19_000, url: null, description: null },
    { id: "unit", name: "unit", status: "passed", source: "check-run", startedAt: null, completedAt: null, durationMs: 33_000, url: null, description: null },
    { id: "preview", name: "preview", status: "passed", source: "commit-status", startedAt: null, completedAt: null, durationMs: 38_000, url: "https://example.invalid/preview", description: null },
    { id: "e2e", name: "e2e", status: "passed", source: "check-run", startedAt: null, completedAt: null, durationMs: null, url: null, description: null },
  ],
}

function transport(merge = vi.fn(async () => ({ ok: true, message: "Merged into main" }))): CiTransport {
  return {
    load: async () => ({ status: 200, etag: null, body: { snapshot } }),
    merge,
  }
}

describe("CiChecksLive", () => {
  it("starts with the checks panel closed", async () => {
    render(<CiChecksLive transport={transport()} labels={ciChecksLiveLabelsEs} />)
    expect(await screen.findByRole("button", { name: /Comprobaciones 5\/5/ })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("list", { name: /comprobaciones/i })).not.toBeInTheDocument()
    expect(screen.getByText(/tiempos de las barras son estimados/i)).toBeInTheDocument()
  })

  it("stays off by default", async () => {
    const merge = vi.fn(async () => ({ ok: true, message: "Merged into main" }))
    render(<CiChecksLive transport={transport(merge)} labels={ciChecksLiveLabelsEs} />)
    expect(await screen.findByText("La fusión está apagada.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Fusionar" })).toBeDisabled()
    expect(merge).not.toHaveBeenCalled()
  })

  it("does not merge without confirmation", async () => {
    const user = userEvent.setup()
    const merge = vi.fn(async () => ({ ok: true, message: "Merged into main" }))
    render(<CiChecksLive transport={transport(merge)} mergeEnabled labels={ciChecksLiveLabelsEs} />)
    await user.click(await screen.findByRole("button", { name: "Fusionar" }))
    expect(merge).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Confirmar fusión en main" }))
    expect(merge).toHaveBeenCalledTimes(1)
  })

  it("respects reduced motion", async () => {
    window.matchMedia = (query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    render(<CiChecksLive transport={transport()} labels={ciChecksLiveLabelsEs} />)
    expect(await screen.findByTestId("ci-checks-live")).toHaveAttribute("data-motion", "reduced")
  })
})
