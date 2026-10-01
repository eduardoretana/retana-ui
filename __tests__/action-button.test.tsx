import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ActionButton } from "@/registry/ui/action-button"

describe("ActionButton", () => {
  it("moves through pending into success", async () => {
    const user = userEvent.setup()
    let finish = () => {}
    const onAction = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
    render(<ActionButton label="Save kiln" pendingLabel="Saving" successLabel="Saved" onAction={onAction} />)
    const button = screen.getByRole("button", { name: /Save kiln/ })
    await user.click(button)
    expect(onAction).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute("data-state", "pending")
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Saving")
    finish()
    await waitFor(() => expect(button).toHaveAttribute("data-state", "success"))
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
  })

  it("returns to idle and reports a failed action", async () => {
    const user = userEvent.setup()
    const onActionError = vi.fn()
    render(
      <ActionButton
        label="Save kiln"
        onAction={() => {
          throw new Error("offline")
        }}
        onActionError={onActionError}
      />,
    )
    const button = screen.getByRole("button", { name: /Save kiln/ })
    await user.click(button)
    expect(onActionError).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute("data-state", "idle")
    expect(screen.getByRole("status")).toHaveTextContent("")
  })
})
