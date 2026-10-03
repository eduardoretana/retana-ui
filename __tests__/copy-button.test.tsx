import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CopyButton } from "@/registry/ui/copy-button"

describe("CopyButton", () => {
  it("copies the value and announces it", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText, readText: async () => "" } })
    const onCopied = vi.fn()
    render(<CopyButton value="hola@costa-atelier.example" label="Copy email" onCopied={onCopied} />)
    await user.click(screen.getByRole("button", { name: "Copy email" }))
    expect(writeText).toHaveBeenCalledWith("hola@costa-atelier.example")
    expect(onCopied).toHaveBeenCalledOnce()
    expect(screen.getByRole("status")).toHaveTextContent("Copy email: Copied")
  })
})
