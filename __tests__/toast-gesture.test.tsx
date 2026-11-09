import { readFileSync } from "node:fs"
import path from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/ui/toast-stack"

function Harness() {
  const { toast } = useToastStack()
  return (
    <>
      <button type="button" onClick={() => toast({ id: "kiln", title: "Kiln ready", duration: Infinity })}>
        Notify
      </button>
      <ToastStack contained />
    </>
  )
}

async function showCard() {
  const user = userEvent.setup()
  const view = render(
    <ToastStackProvider>
      <Harness />
    </ToastStackProvider>,
  )
  await user.click(screen.getByRole("button", { name: "Notify" }))
  const card = document.querySelector("[data-slot=toast-stack-card]")
  if (!(card instanceof HTMLElement)) throw new Error("Missing toast card")
  Object.defineProperty(card, "offsetWidth", { configurable: true, value: 200 })
  Object.defineProperty(card, "offsetHeight", { configurable: true, value: 80 })
  return { card, ...view }
}

describe("toast-stack gesture", () => {
  it("descarta hacia abajo, el eje de la entrada, y no hacia la derecha", async () => {
    const downward = await showCard()
    fireEvent.pointerDown(downward.card, { button: 0, pointerId: 4, pointerType: "mouse", clientX: 10, clientY: 10, timeStamp: 0 })
    fireEvent.pointerMove(downward.card, { pointerId: 4, pointerType: "mouse", clientX: 12, clientY: 30, timeStamp: 20 })
    fireEvent.pointerMove(downward.card, { pointerId: 4, pointerType: "mouse", clientX: 14, clientY: 90, timeStamp: 80 })
    fireEvent.pointerUp(downward.card, { pointerId: 4, pointerType: "mouse", clientX: 14, clientY: 90, timeStamp: 80 })
    expect(screen.getByText("Kiln ready").closest("li")).toHaveAttribute("inert")
    downward.unmount()

    const horizontal = await showCard()
    fireEvent.pointerDown(horizontal.card, { button: 0, pointerId: 5, pointerType: "mouse", clientX: 10, clientY: 10, timeStamp: 0 })
    fireEvent.pointerMove(horizontal.card, { pointerId: 5, pointerType: "mouse", clientX: 40, clientY: 12, timeStamp: 20 })
    fireEvent.pointerMove(horizontal.card, { pointerId: 5, pointerType: "mouse", clientX: 180, clientY: 14, timeStamp: 80 })
    fireEvent.pointerUp(horizontal.card, { pointerId: 5, pointerType: "mouse", clientX: 180, clientY: 14, timeStamp: 80 })
    expect(screen.getAllByText("Kiln ready").at(-1)?.closest("li")).not.toHaveAttribute("inert")
  })

  it("no anima width auto", () => {
    const source = readFileSync(path.join(process.cwd(), "registry/ui/toast-stack.tsx"), "utf8")
    expect(source).not.toMatch(/width:\s*["']auto["']/)
  })

  it("la tarjeta usa touch-pan-x porque el descarte es vertical", async () => {
    const { card } = await showCard()
    expect(card.className).toMatch(/touch-pan-x/)
    expect(card.className).not.toMatch(/touch-pan-y/)
  })

  it("las escenas PLP de gesto exportan dragging, dismissed y reduced", () => {
    const source = readFileSync(path.join(process.cwd(), "app/examples/toast-stack/scenes.tsx"), "utf8")
    expect(source).toMatch(/"dragging"/)
    expect(source).toMatch(/"dismissed"/)
    expect(source).toMatch(/"reduced"/)
  })
})
