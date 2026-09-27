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
})
