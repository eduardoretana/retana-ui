import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { CiChecksStory, ciChecksStoryLabelsEs } from "@/registry/blocks/ci-checks-story"

describe("CiChecksStory", () => {
  it("walks create, fail, fix, and merge", async () => {
    const user = userEvent.setup()
    render(<CiChecksStory defaultPhase="empty" showTransport labels={ciChecksStoryLabelsEs} />)
    expect(screen.queryByRole("list", { name: /comprobaciones/i })).not.toBeInTheDocument()
    const next = screen.getByRole("button", { name: "Siguiente paso" })
    for (let step = 0; step < 8; step += 1) {
      if (screen.queryByText("Fusionado en main")) break
      await user.click(next)
    }
    expect(screen.getByText("Fusionado en main")).toBeInTheDocument()
    expect(screen.getByText(/El recibo pierde el folio/)).toBeInTheDocument()
  })

  it("keeps the checks panel closed on the open phase", () => {
    render(<CiChecksStory phase="open" labels={ciChecksStoryLabelsEs} />)
    expect(screen.getByRole("button", { name: /Comprobaciones/ })).toHaveAttribute("aria-expanded", "false")
  })

  it("opens the panel when a check fails", () => {
    render(<CiChecksStory phase="failing" labels={ciChecksStoryLabelsEs} />)
    expect(screen.getByRole("button", { name: /Comprobaciones/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Falló")).toBeInTheDocument()
  })
})
