import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SplitButton } from "@/registry/ui/split-button"

describe("SplitButton", () => {
  it("runs the main action", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<SplitButton label="Publish" onClick={onClick} actions={[{ label: "Schedule" }]} />)
    await user.click(screen.getByRole("button", { name: "Publish" }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("chooses a menu action from the keyboard", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <SplitButton
        label="Publish"
        actions={[
          { label: "Schedule", onSelect },
          { label: "Remove", destructive: true, disabled: true },
        ]}
      />,
    )
    await user.tab()
    await user.tab()
    await user.keyboard("{ArrowDown}")
    const item = await screen.findByRole("menuitem", { name: "Schedule" })
    expect(item).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.queryByRole("menuitem", { name: "Remove" })).not.toBeInTheDocument()
  })
})
