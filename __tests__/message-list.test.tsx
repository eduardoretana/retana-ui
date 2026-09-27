import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { MessageList } from "@/registry/ui/message-list"

describe("MessageList", () => {
  it("offers a jump control after the reader leaves the bottom", async () => {
    const user = userEvent.setup()
    render(
      <MessageList jumpLabel="Jump to latest" className="h-40">
        <p>Uno</p>
      </MessageList>,
    )

    const viewport = document.querySelector("[data-stuck]") as HTMLDivElement
    Object.defineProperty(viewport, "scrollHeight", { configurable: true, value: 800 })
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 160 })
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)

    const jump = screen.getByRole("button", { name: "Jump to latest" })
    await user.click(jump)
    expect(viewport).toHaveAttribute("data-stuck", "true")
  })
})
