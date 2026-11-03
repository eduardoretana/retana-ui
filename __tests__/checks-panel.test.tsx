import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ChecksPanel, checksPanelLabelsEs, type CheckItem } from "@/registry/ui/checks-panel"

const checks: CheckItem[] = [
  { id: "lint", name: "lint", status: "passed", durationMs: 11_000, progress: 1 },
  { id: "typecheck", name: "typecheck", status: "passed", durationMs: 19_000, progress: 1 },
  { id: "unit", name: "unit", status: "running", durationMs: 8_000, progress: 0.4, estimated: true },
  { id: "preview", name: "preview", status: "queued", progress: 0 },
  { id: "e2e", name: "e2e", status: "failed", durationMs: 29_000, progress: 1 },
]

const base = {
  passed: 2,
  total: 5,
  sha: "b7e21aa",
  message: "Guardar el folio del horno",
  checks,
  labels: checksPanelLabelsEs,
}

function reducedMotion() {
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
}

describe("ChecksPanel", () => {
  it("stays closed until the pill is opened", async () => {
    const user = userEvent.setup()
    render(<ChecksPanel {...base} />)
    const pill = screen.getByRole("button", { name: /Comprobaciones 2\/5/ })
    expect(pill).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("list", { name: /comprobaciones en b7e21aa/i })).not.toBeInTheDocument()
    await user.click(pill)
    expect(pill).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("list", { name: /comprobaciones en b7e21aa/i })).toBeInTheDocument()
  })

  it("shows a word for every status", () => {
    render(
      <ChecksPanel
        {...base}
        open
        checks={[
          ...checks,
          { id: "skip", name: "docs", status: "skipped", progress: 0 },
          { id: "stop", name: "nightly", status: "cancelled", progress: 0 },
        ]}
      />,
    )
    expect(screen.getAllByText("Pasó").length).toBeGreaterThan(0)
    expect(screen.getByText("Falló")).toBeInTheDocument()
    expect(screen.getByText("En curso")).toBeInTheDocument()
    expect(screen.getByText("En cola")).toBeInTheDocument()
    expect(screen.getByText("Omitida")).toBeInTheDocument()
    expect(screen.getByText("Cancelada")).toBeInTheDocument()
  })

  it("separates the sha from the title", () => {
    render(<ChecksPanel {...base} open />)
    expect(screen.getByText("Comprobaciones en b7e21aa").className).toMatch(/font-mono/)
    const title = screen.getByTitle("Guardar el folio del horno")
    expect(title).toHaveClass("truncate")
    expect(title).not.toHaveTextContent("b7e21aa")
  })

  it("labels an estimated duration", () => {
    render(<ChecksPanel {...base} open />)
    expect(screen.getByText(/estimado/i)).toBeInTheDocument()
  })

  it("announces the count", () => {
    render(<ChecksPanel {...base} open />)
    expect(screen.getByRole("status")).toHaveTextContent(/2 de 5/)
  })

  it("renders fifty checks", () => {
    const many: CheckItem[] = Array.from({ length: 50 }, (_, index) => ({
      id: `c-${index}`,
      name: index === 0 ? "X".repeat(60) : `check-${index}`,
      status: "passed" as const,
      durationMs: 1000,
      progress: 1,
    }))
    render(<ChecksPanel {...base} open passed={50} total={50} checks={many} />)
    expect(screen.getAllByRole("listitem")).toHaveLength(50)
    expect(screen.getByRole("list")).toHaveClass("overflow-y-auto")
  })

  it("respects reduced motion", () => {
    reducedMotion()
    render(<ChecksPanel {...base} open />)
    expect(screen.getByTestId("checks-panel")).toHaveAttribute("data-motion", "reduced")
    const meter = screen.getAllByRole("meter")[0]
    expect(meter?.querySelector("[data-bar]")).toHaveStyle({ transitionDuration: "0ms" })
  })
})
