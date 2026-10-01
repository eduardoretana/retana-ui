import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatsBand } from "@/registry/blocks/stats-band"

describe("StatsBand", () => {
  it("renders the count-up value", () => {
    render(<StatsBand stats={[{ value: 42, suffix: "%", label: "Kilns firing" }]} />)
    expect(screen.getByText("Kilns firing")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='stats-band-value']")).toHaveAttribute("data-value", "42%")
  })
})
