import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { HoldToConfirm } from "@/registry/ui/hold-to-confirm"

describe("HoldToConfirm", () => {
  it("ignores a short click", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onHoldChange = vi.fn()
    render(<HoldToConfirm label="Hold to delete" duration={5000} onConfirm={onConfirm} onHoldChange={onHoldChange} />)
    const button = screen.getByRole("button", { name: "Hold to delete" })
    await user.click(button)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(button).toHaveAttribute("data-state", "idle")
    expect(onHoldChange).toHaveBeenCalledWith(true)
    expect(onHoldChange).toHaveBeenLastCalledWith(false)
    expect(button).toHaveAccessibleDescription(/hold Space or Enter/i)
  })

  it("confirms after the keyboard hold elapses", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<HoldToConfirm label="Hold to delete" confirmedLabel="Deleted" duration={80} onConfirm={onConfirm} />)
    const button = screen.getByRole("button", { name: "Hold to delete" })
    button.focus()
    await user.keyboard("[Space>]")
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce(), { timeout: 2000 })
    expect(button).toHaveAttribute("data-state", "done")
    expect(button).toHaveAccessibleName("Deleted")
    expect(screen.getByRole("status")).toHaveTextContent("Deleted")
  })
})
