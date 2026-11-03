import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PrCreateCard, prCreateCardLabelsEs, type CommitNode } from "@/registry/ui/pr-create-card"

const commit: CommitNode = {
  sha: "b7e21aa",
  message: "Leer el folio desde la ficha",
  author: "Noa Ferrer",
  timeLabel: "hace 40 min",
  branches: ["feat/folio-horno"],
}

const base = {
  title: "Guardar el folio del horno al recargar",
  number: 42,
  state: "open" as const,
  diffStat: { add: 86, del: 12 },
  commits: [commit],
  labels: prCreateCardLabelsEs,
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

describe("PrCreateCard", () => {
  it("expands the diff chip into the pull request", async () => {
    const user = userEvent.setup()
    render(<PrCreateCard {...base} />)
    const chip = screen.getByRole("button", { name: /86 adiciones, 12 supresiones/ })
    expect(chip).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("heading", { name: base.title })).not.toBeInTheDocument()
    await user.click(chip)
    expect(chip).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("heading", { name: base.title })).toBeInTheDocument()
    expect(screen.getByText("b7e21aa")).toBeInTheDocument()
    expect(screen.getByText("Abierto")).toBeInTheDocument()
  })

  it("toggles the chip from the keyboard", async () => {
    const user = userEvent.setup()
    render(<PrCreateCard {...base} />)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("button", { name: /86 adiciones, 12 supresiones/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("announces the open pull request", () => {
    render(<PrCreateCard {...base} open />)
    expect(screen.getByRole("status")).toHaveTextContent(/pull request 42 está abierto/i)
  })

  it("shows an error with text", () => {
    render(
      <PrCreateCard
        {...base}
        state="error"
        open
        errorMessage="El remoto rechazó la rama"
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("El remoto rechazó la rama")
    expect(screen.getByText("Error")).toBeInTheDocument()
  })

  it("keeps a long title in the card", () => {
    const title = "N".repeat(60)
    render(<PrCreateCard {...base} title={title} open commits={[]} />)
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    expect(screen.getByText(/sin commits/i)).toBeInTheDocument()
  })

  it("respects reduced motion", () => {
    reducedMotion()
    render(<PrCreateCard {...base} open />)
    expect(screen.getByTestId("pr-create-card")).toHaveAttribute("data-motion", "reduced")
  })
})
