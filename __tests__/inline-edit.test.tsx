import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { InlineEdit } from "@/registry/ui/inline-edit"

describe("InlineEdit", () => {
  it("saves on Enter and cancels on Escape", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineEdit label="Project name" value="Kiln 2" onSave={onSave} />)

    await user.click(screen.getByRole("button", { name: "Project name: Kiln 2" }))
    const field = screen.getByRole("textbox", { name: "Project name" })
    await user.clear(field)
    await user.type(field, "Kiln 3{Enter}")
    expect(onSave).toHaveBeenCalledWith("Kiln 3")
    expect(screen.getByRole("button", { name: "Project name: Kiln 3" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Project name: Kiln 3" }))
    const again = screen.getByRole("textbox", { name: "Project name" })
    await user.clear(again)
    await user.type(again, "Nope{Escape}")
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Project name: Kiln 3" })).toBeInTheDocument()
  })

  it("keeps an invalid draft and explains why", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineEdit label="Project name" value="Kiln 2" onSave={onSave} validate={(next) => (next.length < 3 ? "Too short" : null)} />)
    await user.click(screen.getByRole("button", { name: "Project name: Kiln 2" }))
    const field = screen.getByRole("textbox", { name: "Project name" })
    await user.clear(field)
    await user.type(field, "A{Enter}")
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText("Too short")).toBeInTheDocument()
    expect(field).toHaveAttribute("aria-invalid", "true")
  })
})
