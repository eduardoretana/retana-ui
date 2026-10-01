import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EmptyStates } from "@/registry/blocks/empty-states"

describe("EmptyStates", () => {
  it("switches scenes from the keyboard and clears filters", async () => {
    const user = userEvent.setup()
    const onSceneChange = vi.fn()
    render(<EmptyStates className="kiln-empty" onSceneChange={onSceneChange} />)
    expect(document.querySelector("[data-slot=empty-states]")).toHaveClass("kiln-empty")
    expect(screen.getByRole("heading", { name: /No results for/ })).toBeInTheDocument()
    const first = screen.getByRole("tab", { name: "No results" })
    first.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Offline" })).toHaveAttribute("aria-selected", "true")
    expect(onSceneChange).toHaveBeenCalledWith("offline")
    await user.keyboard("{ArrowLeft}")
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(screen.getByRole("heading", { name: /12 results/ })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent(/Filters cleared/)
    await user.click(screen.getByRole("button", { name: "Restore filters" }))
    expect(screen.getByRole("heading", { name: /No results for/ })).toBeInTheDocument()
  })

  it("retries a connection and lands on the done scene", async () => {
    const user = userEvent.setup()
    const onPhaseChange = vi.fn()
    render(<EmptyStates waits={{ offline: 0 }} onPhaseChange={onPhaseChange} />)
    await user.click(screen.getByRole("tab", { name: "Offline" }))
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await screen.findByRole("heading", { name: "Back online" })).toBeInTheDocument()
    expect(onPhaseChange).toHaveBeenCalledWith("offline", "done")
    expect(screen.getByRole("img", { name: /cloud joined to a device/i })).toBeInTheDocument()
  })
})
