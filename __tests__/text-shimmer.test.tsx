import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextShimmer } from "@/registry/ui/text-shimmer"

describe("TextShimmer", () => {
  it("marks ongoing work as busy", () => {
    render(<TextShimmer>Cociendo el lote</TextShimmer>)
    expect(document.querySelector("[data-slot=text-shimmer]")).toHaveAttribute("aria-busy", "true")
  })
})
