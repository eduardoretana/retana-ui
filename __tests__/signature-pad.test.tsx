import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getStrokeOutline, outlineToPath, signatureToSvg, SignaturePad, type InkStroke } from "@/registry/ui/signature-pad"

const stroke: InkStroke = {
  id: "a",
  color: "blue",
  width: "medium",
  at: 0,
  points: [
    { x: 10, y: 20, p: -1, t: 0 },
    { x: 40, y: 28, p: -1, t: 30 },
    { x: 70, y: 18, p: -1, t: 60 },
  ],
}

describe("SignaturePad", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 600,
      bottom: 260,
      width: 600,
      height: 260,
      toJSON() {
        return {}
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("builds an outline and exports without a hard-coded color", () => {
    const outline = getStrokeOutline(stroke.points, { size: 5 })
    expect(outline.length).toBeGreaterThan(3)
    expect(outlineToPath(outline)).toMatch(/^M/)
    const svg = signatureToSvg([stroke])
    expect(svg).toContain("currentColor")
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it("draws, undoes with the keyboard, and replays", async () => {
    const user = userEvent.setup()
    render(<SignaturePad label="Studio signature" signer="Inés" />)
    const pad = screen.getByRole("img", { name: /Empty/ })
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Replay signature" })).toBeDisabled()

    fireEvent.pointerDown(pad, { button: 0, pointerId: 1, pointerType: "mouse", clientX: 20, clientY: 40 })
    fireEvent.pointerMove(pad, { pointerId: 1, pointerType: "mouse", clientX: 80, clientY: 50 })
    fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse", clientX: 80, clientY: 50 })

    expect(screen.getByRole("img", { name: /1 stroke/ })).toBeInTheDocument()
    pad.focus()
    await user.keyboard("{Control>}z{/Control}")
    expect(screen.getByRole("img", { name: /Empty/ })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Redo" }))
    expect(screen.getByRole("img", { name: /1 stroke/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Replay signature" }))
    expect(screen.getByRole("button", { name: "Stop replay" })).toBeInTheDocument()
  })

  it("moves ink color with arrow keys", async () => {
    const user = userEvent.setup()
    render(<SignaturePad label="Studio signature" />)
    const black = screen.getByRole("radio", { name: "Black ink" })
    black.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Blue ink" })).toHaveAttribute("aria-checked", "true")
  })
})
