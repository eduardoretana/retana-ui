import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextReveal } from "@/registry/ui/text-reveal"

describe("TextReveal", () => {
  it("exposes the full sentence to assistive tech", () => {
    render(<TextReveal text={"Costa Atelier\nabre el horno"} />)
    expect(screen.getByRole("heading", { name: "Costa Atelier abre el horno" })).toBeInTheDocument()
  })
})
