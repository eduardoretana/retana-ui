import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ReplyComposer } from "@/registry/ui/reply-composer"

describe("ReplyComposer", () => {
  it("sends a note with Ctrl+Enter and keeps Enter as a newline", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <ReplyComposer
        suggestions={[{ label: "Pedimos el esmalte", value: "Pedimos el esmalte de nuevo." }]}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Pedimos el esmalte" }))
    await user.click(screen.getByRole("tab", { name: "Note" }))
    expect(document.querySelector("[data-slot='reply-composer']")).toHaveAttribute("data-mode", "note")
    expect(document.querySelector("[data-slot='reply-composer']")).toHaveClass("bg-accent")
    const field = screen.getByRole("textbox")
    expect(field).toHaveValue("Pedimos el esmalte de nuevo.")
    field.focus()
    await user.keyboard("{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onSubmit).toHaveBeenCalledWith("Pedimos el esmalte de nuevo.", "note", [])
  })
})
