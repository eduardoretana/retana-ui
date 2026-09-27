import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChatComposer } from "@/registry/ui/chat-composer"

describe("ChatComposer", () => {
  it("submits on Enter and inserts a newline on Shift+Enter", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ChatComposer onSubmit={onSubmit} placeholder="Write a message" sendLabel="Send" />)

    const field = screen.getByRole("textbox", { name: "Write a message" })
    await user.type(field, "Hola")
    await user.keyboard("{Shift>}{Enter}{/Shift}")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalledWith(expect.stringContaining("Hola"), [])
  })

  it("shows a stop control while generating", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    render(<ChatComposer generating onStop={onStop} stopLabel="Stop" defaultValue="Borrador" />)
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
