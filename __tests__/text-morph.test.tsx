import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextMorph } from "@/registry/ui/text-morph"

describe("TextMorph", () => {
  it("reads the current label", () => {
    const { rerender } = render(<TextMorph>Publicar</TextMorph>)
    expect(screen.getByText("Publicar")).toBeInTheDocument()
    rerender(<TextMorph>Publicado</TextMorph>)
    expect(screen.getByText("Publicado")).toBeInTheDocument()
  })
})
