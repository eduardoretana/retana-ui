import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/ui/toast-stack"

function Harness() {
  const { toast, dismiss } = useToastStack()
  return (
    <>
      <button type="button" onClick={() => toast({ id: "kiln", title: "Kiln ready", description: "Cone 6", type: "success", duration: Infinity, action: { label: "Undo", onClick: () => {} } })}>Notify</button>
      <button type="button" onClick={() => dismiss()}>Dismiss all</button>
      <ToastStack contained />
    </>
  )
}

describe("ToastStack", () => {
  it("shows a toast and dismisses it", async () => {
    const user = userEvent.setup()
    render(
      <ToastStackProvider>
        <Harness />
      </ToastStackProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Notify" }))
    expect(screen.getByText("Kiln ready")).toBeInTheDocument()
    expect(screen.getByText("Cone 6")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }))
    const item = screen.getByText("Kiln ready").closest("li")
    expect(item).toHaveAttribute("inert")
  })

  it("swipes a toast away", async () => {
    const user = userEvent.setup()
    render(
      <ToastStackProvider>
        <Harness />
      </ToastStackProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Notify" }))
    const card = document.querySelector("[data-slot=toast-stack-card]") as HTMLElement
    Object.defineProperty(card, "offsetWidth", { configurable: true, value: 200 })
    fireEvent.pointerDown(card, { button: 0, pointerId: 4, pointerType: "mouse", clientX: 10, clientY: 10 })
    fireEvent.pointerMove(card, { pointerId: 4, pointerType: "mouse", clientX: 40, clientY: 10 })
    fireEvent.pointerMove(card, { pointerId: 4, pointerType: "mouse", clientX: 160, clientY: 12 })
    fireEvent.pointerUp(card, { pointerId: 4, pointerType: "mouse", clientX: 160, clientY: 12, timeStamp: 40 })
    expect(screen.getByText("Kiln ready").closest("li")).toHaveAttribute("inert")
  })

  it("runs the action", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    function ActionHarness() {
      const { toast } = useToastStack()
      return (
        <>
          <button type="button" onClick={() => toast({ title: "Saved", duration: Infinity, action: { label: "Undo", onClick } })}>Save</button>
          <ToastStack />
        </>
      )
    }
    render(
      <ToastStackProvider>
        <ActionHarness />
      </ToastStackProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Save" }))
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onClick).toHaveBeenCalled()
  })
})
