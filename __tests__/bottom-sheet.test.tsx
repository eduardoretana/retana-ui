import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BottomSheet } from "@/registry/ui/bottom-sheet"

describe("BottomSheet", () => {
  it("steps through detents with the keyboard and closes", async () => {
    const user = userEvent.setup()
    const onDetentChange = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <BottomSheet
        title="Kiln"
        description="Stoneware schedule"
        detents={[0.3, 0.6, 0.9]}
        onDetentChange={onDetentChange}
        onOpenChange={onOpenChange}
        trigger={<button type="button">Open kiln</button>}
      >
        Stoneware log
      </BottomSheet>,
    )

    await user.click(screen.getByRole("button", { name: "Open kiln" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    const dialog = screen.getByRole("dialog", { name: "Kiln" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText("Stoneware schedule")).toBeInTheDocument()
    expect(screen.getByText("Stoneware log")).toBeInTheDocument()

    const grabber = screen.getByRole("button", { name: "Expand sheet" })
    expect(grabber).toHaveAttribute("aria-expanded", "false")
    grabber.focus()
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("status")).toHaveTextContent("Sheet at 60 percent height")
    expect(onDetentChange).toHaveBeenLastCalledWith(1)

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("button", { name: "Collapse sheet" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Sheet expanded")
    expect(onDetentChange).toHaveBeenLastCalledWith(2)

    await user.keyboard("{End}")
    expect(screen.getByRole("status")).toHaveTextContent("Sheet collapsed")
    expect(screen.getByRole("button", { name: "Expand sheet" })).toHaveAttribute("aria-expanded", "false")
    expect(dialog).toBeInTheDocument()

    await user.keyboard("{Home}")
    expect(screen.getByRole("status")).toHaveTextContent("Sheet expanded")
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Kiln" })).not.toBeInTheDocument())
  })

  it("expands from the grabber and dismisses with Escape", async () => {
    const user = userEvent.setup()
    render(
      <BottomSheet title="Filters" trigger={<button type="button">Open filters</button>}>
        Clay body
      </BottomSheet>,
    )
    await user.click(screen.getByRole("button", { name: "Open filters" }))
    await user.click(screen.getByRole("button", { name: "Expand sheet" }))
    expect(screen.getByRole("button", { name: "Collapse sheet" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Sheet expanded")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
