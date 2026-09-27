import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PlanCard } from "@/registry/ui/plan-card"

describe("PlanCard", () => {
  it("approves and saves an edited step", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    const onEdit = vi.fn()
    render(
      <PlanCard
        steps={[{ id: "1", title: "Draft the note" }]}
        onApprove={onApprove}
        onEdit={onEdit}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Edit" }))
    const field = screen.getByRole("textbox", { name: "Edit 1" })
    await user.clear(field)
    await user.type(field, "Send the note")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(onEdit).toHaveBeenCalledWith([expect.objectContaining({ title: "Send the note" })])
    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(onApprove).toHaveBeenCalledOnce()
  })
})
