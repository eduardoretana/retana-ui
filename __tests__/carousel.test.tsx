import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Carousel } from "@/registry/ui/carousel"

const slides = ["Bowl", "Cup", "Plate"]

function box(this: HTMLElement) {
  const index = this.getAttribute("data-index")
  if (this.getAttribute("data-slot") === "carousel-slide" && index != null) {
    const i = Number(index)
    return { x: i * 200, y: 0, left: i * 200, top: 0, right: i * 200 + 180, bottom: 48, width: 180, height: 48, toJSON() { return {} } }
  }
  return { x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 48, width: 400, height: 48, toJSON() { return {} } }
}

describe("Carousel", () => {
  it("moves with the next control and the arrow keys", async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Carousel label="Kiln shelves" onIndexChange={onIndexChange}>
        {slides.map((name) => (
          <p key={name}>{name}</p>
        ))}
      </Carousel>,
    )
    expect(screen.getByRole("tab", { name: "1 of 3" })).toHaveAttribute("aria-selected", "true")
    await user.click(screen.getByRole("button", { name: "Next slide" }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByRole("tab", { name: "2 of 3" })).toHaveAttribute("aria-selected", "true")
    screen.getByRole("tab", { name: "2 of 3" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "3 of 3" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveAttribute("aria-disabled", "true")
  })

  it("drags to another slide", () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = box
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth")
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 400 } })
    const onIndexChange = vi.fn()
    render(
      <Carousel label="Kiln shelves" onIndexChange={onIndexChange}>
        {slides.map((name) => (
          <p key={name}>{name}</p>
        ))}
      </Carousel>,
    )
    const viewport = screen.getByRole("group", { name: "Slides" })
    try {
      fireEvent.pointerDown(viewport, { button: 0, pointerId: 3, pointerType: "mouse", clientX: 320, clientY: 10 })
      fireEvent.pointerMove(viewport, { pointerId: 3, pointerType: "mouse", clientX: 300, clientY: 12 })
      fireEvent.pointerMove(viewport, { pointerId: 3, pointerType: "mouse", clientX: 40, clientY: 12 })
      fireEvent.pointerUp(viewport, { pointerId: 3, pointerType: "mouse", clientX: 40, clientY: 12 })
      expect(onIndexChange.mock.calls.at(-1)?.[0]).toBeGreaterThan(0)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
      if (width) Object.defineProperty(HTMLElement.prototype, "clientWidth", width)
    }
  })

  it("jumps to a slide from its tab", async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Carousel label="Kiln shelves" onIndexChange={onIndexChange}>
        {slides.map((name) => (
          <p key={name}>{name}</p>
        ))}
      </Carousel>,
    )
    await user.click(screen.getByRole("tab", { name: "3 of 3" }))
    expect(onIndexChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole("tab", { name: "3 of 3" })).toHaveAttribute("aria-selected", "true")
  })
})
