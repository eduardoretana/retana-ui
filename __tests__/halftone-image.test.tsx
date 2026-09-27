import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HalftoneImage } from "@/registry/ui/halftone-image"

describe("HalftoneImage", () => {
  it("exposes the image name on the canvas", () => {
    render(<HalftoneImage src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E" alt="Portrait" />)
    expect(screen.getByRole("img", { name: "Portrait" })).toBeInTheDocument()
  })
})
