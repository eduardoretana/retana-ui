import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TreeNav, type TreeNavNode } from "@/registry/ui/tree-nav"

const items: TreeNavNode[] = [
  {
    id: "updates",
    label: "Product Updates",
    count: 18,
    children: [
      { id: "docs", label: "Docs 3.0", href: "#docs" },
      { id: "strategy", label: "Product strategy" },
    ],
  },
  {
    id: "sales",
    label: "Sales Pipeline",
    count: 11,
    children: [
      { id: "kickoff", label: "Week kickoff" },
      {
        id: "untitled",
        label: "Untitled folder",
        count: 2,
        children: [
          { id: "demo", label: "Product demo" },
          { id: "training", label: "AI training" },
        ],
      },
    ],
  },
]

describe("TreeNav", () => {
  it("expands and collapses from a click", async () => {
    const user = userEvent.setup()
    render(<TreeNav items={items} label="Projects" />)
    const updates = screen.getByRole("treeitem", { name: /Product Updates/ })
    expect(updates).toHaveAttribute("aria-expanded", "false")
    expect(updates).toHaveAttribute("aria-level", "1")
    await user.click(updates)
    expect(updates).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: "Docs 3.0" })).toHaveAttribute("aria-level", "2")
    await user.click(updates)
    expect(updates).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("treeitem", { name: "Docs 3.0" })).not.toBeInTheDocument()
  })

  it("expands, moves, and collapses from the keyboard", async () => {
    const user = userEvent.setup()
    render(<TreeNav items={items} label="Projects" />)
    const updates = screen.getByRole("treeitem", { name: /Product Updates/ })
    updates.focus()
    await user.keyboard("{ArrowRight}")
    expect(updates).toHaveAttribute("aria-expanded", "true")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: "Docs 3.0" })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    const strategy = screen.getByRole("treeitem", { name: "Product strategy" })
    expect(strategy).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(updates).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(updates).toHaveAttribute("aria-expanded", "false")
    await user.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: /Sales Pipeline/ })).toHaveFocus()
  })

  it("selects a node and exposes aria-selected", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<TreeNav items={items} label="Projects" defaultExpanded={["updates"]} onSelect={onSelect} />)
    await user.click(screen.getByRole("treeitem", { name: "Product strategy" }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "strategy", label: "Product strategy" }))
    expect(screen.getByRole("treeitem", { name: "Product strategy" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("treeitem", { name: /Product Updates/ })).toHaveAttribute("aria-selected", "false")
    const docs = screen.getByRole("treeitem", { name: "Docs 3.0" })
    expect(docs.tagName).toBe("A")
    expect(docs).toHaveAttribute("href", "#docs")
  })

  it("type-ahead moves to the matching visible row", async () => {
    const user = userEvent.setup()
    render(<TreeNav items={items} label="Projects" />)
    screen.getByRole("treeitem", { name: /Product Updates/ }).focus()
    await user.keyboard("s")
    expect(screen.getByRole("treeitem", { name: /Sales Pipeline/ })).toHaveFocus()
  })
})
