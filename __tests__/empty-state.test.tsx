import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EmptyState } from "@/registry/ui/empty-state"

describe("EmptyState", () => {
  it("names the empty region and runs its action", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <EmptyState
        label="Kiln"
        title="No pieces in the kiln"
        description="A firing shows up here."
        action={<button type="button" onClick={onAdd}>Register firing</button>}
      />,
    )
    expect(screen.getByRole("region", { name: "Kiln" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "No pieces in the kiln" })).toBeInTheDocument()
    expect(screen.getByText("A firing shows up here.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Register firing" }))
    expect(onAdd).toHaveBeenCalledOnce()
  })
})
