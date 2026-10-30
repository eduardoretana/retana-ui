import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GooeySlider } from "@/registry/ui/gooey-slider"

describe("GooeySlider", () => {
  it("exposes a slider with the current value", () => {
    render(<GooeySlider defaultValue={25} label="Intensity" />)
    const slider = screen.getByRole("slider", { name: "Intensity" })
    expect(slider).toHaveAttribute("aria-valuenow", "25")
    expect(slider).toHaveAttribute("data-slot", "slider-thumb")
    expect(document.querySelector("[data-slot=slider]")).not.toHaveAttribute("aria-valuetext")
  })
})
