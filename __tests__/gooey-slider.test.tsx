import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GooeySlider } from "@/registry/ui/gooey-slider"

describe("GooeySlider", () => {
  it("exposes a slider with the current value", () => {
    render(<GooeySlider defaultValue={25} label="Intensity" />)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "25")
    expect(document.querySelector("[data-slot=slider]")).toHaveAttribute("aria-label", "Intensity")
  })
})
