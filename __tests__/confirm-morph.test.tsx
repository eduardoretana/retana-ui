import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ConfirmMorph } from "@/registry/ui/confirm-morph"

const quiet = { confirmTimeout: 0, resultTimeout: 0 }

describe("ConfirmMorph", () => {
  it("asks in place and confirms", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmMorph label="Delete draft" confirmLabel="Delete" doneLabel="Deleted" onConfirm={onConfirm} {...quiet} />)
    await user.click(screen.getByRole("button", { name: "Delete draft" }))
    expect(screen.getByRole("group", { name: "Delete draft?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.getByRole("status")).toHaveTextContent("Deleted")
    expect(document.querySelector("[data-slot=confirm-morph]")).toHaveAttribute("data-state", "done")
  })

  it("cancels with Escape", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmMorph label="Revoke" prompt="Revoke access?" cancelLabel="Cancel" onCancel={onCancel} {...quiet} />)
    await user.click(screen.getByRole("button", { name: "Revoke" }))
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(onCancel).toHaveBeenCalledOnce()
    expect(screen.getByRole("status")).toHaveTextContent("Cancelled")
    expect(screen.getByRole("button", { name: "Revoke" })).toBeInTheDocument()
  })
})
