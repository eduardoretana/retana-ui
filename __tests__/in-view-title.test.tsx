import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InViewTitle } from "@/registry/ui/in-view-title"

describe("InViewTitle", () => {
  it("names the heading", () => {
    render(<InViewTitle text="Barro de la costa" />)
    expect(screen.getByRole("heading", { name: "Barro de la costa" })).toBeInTheDocument()
  })
})
