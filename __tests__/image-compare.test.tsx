import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ImageCompare } from "@/registry/ui/image-compare"

function frame() {
  return (
    <ImageCompare
      label="Glaze compare"
      before={<span>Bisque</span>}
      after={<span>Glaze</span>}
    />
  )
}

describe("ImageCompare", () => {
  it("steps the divider with the keyboard", async () => {
    const user = userEvent.setup()
    render(frame())
    const slider = screen.getByRole("slider", { name: "Glaze compare" })
    expect(slider).toHaveAttribute("aria-valuenow", "50")
    expect(slider).toHaveAttribute("aria-valuetext", "50% after")
    slider.focus()
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuenow", "49")
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(slider).toHaveAttribute("aria-valuenow", "59")
    await user.keyboard("{End}")
    expect(slider).toHaveAttribute("aria-valuenow", "100")
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "0")
  })

  it("drags the divider", () => {
    const onPositionChange = vi.fn()
    render(
      <ImageCompare
        label="Glaze compare"
        before={<span>Bisque</span>}
        after={<span>Glaze</span>}
        onPositionChange={onPositionChange}
      />,
    )
    const root = document.querySelector("[data-slot=image-compare]") as HTMLElement
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON() { return {} },
    })
    fireEvent.pointerDown(root, { button: 0, isPrimary: true, pointerId: 1, pointerType: "mouse", clientX: 40, clientY: 20 })
    fireEvent.pointerMove(root, { pointerId: 1, pointerType: "mouse", clientX: 150, clientY: 20 })
    fireEvent.pointerUp(root, { pointerId: 1, pointerType: "mouse", clientX: 150, clientY: 20 })
    expect(onPositionChange).toHaveBeenCalled()
    const last = onPositionChange.mock.calls.at(-1)?.[0] as number
    expect(last).toBeGreaterThan(70)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", String(Math.round(100 - last)))
  })
})
