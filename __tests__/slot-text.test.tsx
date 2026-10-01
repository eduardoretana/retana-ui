import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SlotText } from "@/registry/ui/slot-text"

describe("SlotText", () => {
  it("announces the formatted number", () => {
    render(<SlotText value={12480} announce />)
    expect(screen.getByText("12,480")).toBeInTheDocument()
  })
})
