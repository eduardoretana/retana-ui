import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Marker } from "@/registry/ui/marker"

describe("Marker", () => {
  it("keeps the highlighted text readable", () => {
    render(<Marker>forty-five days</Marker>)
    expect(screen.getByText("forty-five days")).toBeInTheDocument()
  })
})
