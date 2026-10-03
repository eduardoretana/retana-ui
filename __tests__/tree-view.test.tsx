import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TreeView, type TreeNode } from "@/registry/ui/tree-view"

const nodes: TreeNode[] = [
  {
    id: "kiln",
    label: "Kiln",
    children: [{ id: "log", label: "firing.md" }],
  },
  { id: "glaze", label: "glaze.json" },
]

describe("TreeView", () => {
  it("expands, selects, and moves with the keyboard", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<TreeView nodes={nodes} aria-label="Studio files" onSelect={onSelect} />)
    const kiln = screen.getByRole("treeitem", { name: "Kiln" })
    expect(kiln).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("treeitem", { name: "firing.md" })).not.toBeInTheDocument()

    kiln.focus()
    await user.keyboard("{ArrowRight}")
    expect(kiln).toHaveAttribute("aria-expanded", "true")
    const file = screen.getByRole("treeitem", { name: "firing.md" })
    expect(file).toBeInTheDocument()

    await user.keyboard("{ArrowDown}")
    expect(file).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "log", label: "firing.md" }))
    expect(file).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowLeft}")
    expect(kiln).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(kiln).toHaveAttribute("aria-expanded", "false")
    await waitFor(() => expect(screen.queryByRole("treeitem", { name: "firing.md" })).not.toBeInTheDocument())

    await user.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: "glaze.json" })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(kiln).toHaveFocus()
  })
})
