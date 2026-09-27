import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ImageGeneration } from "@/registry/ui/image-generation"

describe("ImageGeneration", () => {
  it("exposes progress while generating and the image when done", () => {
    const { rerender } = render(<ImageGeneration status="generating" progress={40} alt="Study" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
    rerender(<ImageGeneration status="done" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E" alt="Study" />)
    expect(screen.getByRole("img", { name: "Study" })).toBeInTheDocument()
  })
})
