import { readFileSync } from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BottomSheet } from "@/registry/ui/bottom-sheet"
import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

const animateCalls = vi.hoisted(() => [] as unknown[][])

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    animate: (...args: unknown[]) => {
      animateCalls.push(args)
      const value = args[0] as { set?: (next: number) => void } | undefined
      const target = args[1]
      if (value && typeof value.set === "function" && typeof target === "number") value.set(target)
      return { stop() {}, then: () => Promise.resolve() }
    },
  }
})

describe("bottom sheet hits and detent return", () => {
  it("el grabber y el cerrar cubren 44 px y el hover está en el media query", async () => {
    const user = userEvent.setup()
    render(
      <BottomSheet title="Kiln" trigger={<button type="button">Open</button>}>
        Log
      </BottomSheet>,
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const grabber = screen.getByRole("button", { name: "Expand sheet" })
    const close = screen.getByRole("button", { name: "Close" })
    const sheet = screen.getByRole("dialog", { name: "Kiln" })
    expect(grabber.className).toMatch(/before:h-11/)
    expect(close.className).toMatch(/before:h-11/)
    const pill = grabber.querySelector("span")
    expect(pill?.className).toMatch(/hover:hover/)
    expect(pill?.className).toMatch(/pointer:fine/)
    expect(sheet.className).not.toMatch(/will-change/)
  })

  it("volver al mismo detent usa un spring de 0.2 s sin rebote", async () => {
    const user = userEvent.setup()
    const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 800 })
    animateCalls.length = 0
    render(
      <BottomSheet title="Kiln" detents={[0.45, 0.92]} trigger={<button type="button">Open</button>}>
        Log
      </BottomSheet>,
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const header = document.querySelector("[data-slot='bottom-sheet-header']")
    if (!(header instanceof HTMLElement)) throw new Error("Missing header")
    const point = (type: string, y: number, time: number) => {
      const event = new PointerEvent(type, { button: 0, pointerId: 7, clientY: y, buttons: type === "pointerup" ? 0 : 1, bubbles: true })
      Object.defineProperty(event, "timeStamp", { value: time })
      Object.defineProperty(event, "isPrimary", { value: true })
      header.dispatchEvent(event)
    }
    point("pointerdown", 500, 0)
    point("pointermove", 520, 360)
    point("pointerup", 520, 400)
    const snap = animateCalls.find((call) => {
      const options = call[2] as { visualDuration?: number; bounce?: number } | undefined
      return options?.visualDuration === 0.2 && options.bounce === 0
    })
    expect(snap).toBeTruthy()
    if (height) Object.defineProperty(HTMLElement.prototype, "offsetHeight", height)
  })

  it("las escenas PLP exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/bottom-sheet/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})

describe("slide handle hit", () => {
  it("el asa cubre 44 px sin crecer el dibujo de 40 px", () => {
    render(<SlideToConfirm label="Send" />)
    const slider = screen.getByRole("slider", { name: "Send" })
    expect(slider.className).toMatch(/size-10/)
    expect(slider.className).toMatch(/before:h-11/)
    expect(slider.className).toMatch(/before:w-11/)
  })
})
