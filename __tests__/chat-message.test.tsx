import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChatMessage } from "@/registry/ui/chat-message"

describe("ChatMessage", () => {
  it("copies assistant text and retries a failed message", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    const onRetry = vi.fn()

    render(
      <div>
        <ChatMessage role="assistant" copyText="Hola">
          Hola
        </ChatMessage>
        <ChatMessage role="assistant" status="error" onRetry={onRetry} errorLabel="Not sent" retryLabel="Retry">
          Falló
        </ChatMessage>
      </div>,
    )

    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeText).toHaveBeenCalledWith("Hola")
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("marks an internal note and a seen receipt", () => {
    render(
      <ChatMessage role="user" side="incoming" variant="note" receipt="unseen" noteLabel="Internal note">
        Solo el taller
      </ChatMessage>,
    )
    const row = screen.getByText("Solo el taller").closest("[data-slot='chat-message']")
    expect(row).toHaveAttribute("data-variant", "note")
    expect(row).toHaveAttribute("data-side", "incoming")
    expect(row).toHaveAttribute("data-receipt", "unseen")
    expect(screen.getByText("Internal note")).toBeInTheDocument()
    expect(screen.getByText("Not seen")).toBeInTheDocument()
  })

  it("toggles a reaction", async () => {
    const user = userEvent.setup()
    const onReact = vi.fn()
    render(<ChatMessage role="assistant" reactions={[{ emoji: "🔥", count: 2 }]} onReact={onReact}>Hola</ChatMessage>)
    await user.click(screen.getByRole("button", { name: "🔥, 2" }))
    expect(onReact).toHaveBeenCalledWith("🔥")
  })
})
