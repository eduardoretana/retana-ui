import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DissolveInput } from "@/registry/ui/dissolve-input"

describe("DissolveInput", () => {
  it("reports the value when the field is cleared", async () => {
    const user = userEvent.setup()
    const onDissolve = vi.fn()
    render(<DissolveInput aria-label="Note" defaultValue="Bruma" clearLabel="Clear" onDissolve={onDissolve} />)
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(onDissolve).toHaveBeenCalledWith("Bruma")
  })
})
