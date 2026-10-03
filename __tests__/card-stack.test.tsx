import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CardStack } from "@/registry/ui/card-stack"

const items = [
  { id: "bowl", name: "Bowl" },
  { id: "cup", name: "Cup" },
]

function stack(onDecide = vi.fn(), onUndo = vi.fn()) {
  return (
    <CardStack
      items={items}
      getKey={(item) => item.id}
      getLabel={(item) => item.name}
      renderCard={(item) => <p>{item.name}</p>}
      labels={{ left: "Pass", right: "Keep" }}
      onDecide={onDecide}
      onUndo={onUndo}
    />
  )
}

describe("CardStack", () => {
  it("keeps a card and undoes it", async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    const onUndo = vi.fn()
    render(stack(onDecide, onUndo))
    await user.click(screen.getByRole("button", { name: "Keep" }))
    expect(onDecide).toHaveBeenCalledWith(items[0], "right")
    expect(screen.getByRole("status")).toHaveTextContent("Bowl: Keep")
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalledWith(items[0], "right")
    expect(screen.getByRole("status")).toHaveTextContent("Bowl restored")
  })

  it("throws the top card to the right", () => {
    const onDecide = vi.fn()
    render(stack(onDecide))
    const card = screen.getByRole("group", { name: /Bowl/ })
    fireEvent.pointerDown(card, { button: 0, isPrimary: true, pointerId: 1, clientX: 10, clientY: 20 })
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 180, clientY: 24 })
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 180, clientY: 24 })
    expect(onDecide).toHaveBeenCalledWith(items[0], "right")
  })

  it("decides from the arrow keys", async () => {
    const user = userEvent.setup()
    const onDecide = vi.fn()
    render(stack(onDecide))
    screen.getByRole("group", { name: "Cards" }).focus()
    await user.keyboard("{ArrowLeft}")
    expect(onDecide).toHaveBeenCalledWith(items[0], "left")
  })
})
