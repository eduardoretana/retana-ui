import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LogoMarquee } from "@/registry/ui/logo-marquee"

describe("LogoMarquee", () => {
  it("duplicates the logos for the loop and hides the clone", () => {
    render(
      <LogoMarquee label="Studios">
        <span>Bruma</span>
      </LogoMarquee>,
    )
    expect(screen.getByRole("region", { name: "Studios" })).toBeInTheDocument()
    expect(screen.getAllByText("Bruma")).toHaveLength(2)
  })
})
