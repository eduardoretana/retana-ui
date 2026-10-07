import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { JsonViewer } from "@/registry/ui/json-viewer"

const firing = { glaze: "ash", temps: [980, 1040] }

describe("JsonViewer", () => {
  it("collapses, searches, and copies a value or path", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const onCopy = vi.fn()
    render(<JsonViewer data={firing} label="Firing" onCopy={onCopy} />)

    const root = screen.getByRole("treeitem", { name: "root, object, 2 keys" })
    expect(root).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: "glaze: ash" })).toBeInTheDocument()

    root.focus()
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.queryByRole("treeitem", { name: "glaze: ash" })).not.toBeInTheDocument())
    expect(root).toHaveAttribute("aria-expanded", "false")

    await user.click(screen.getByRole("button", { name: "Expand all" }))
    const glaze = await screen.findByRole("treeitem", { name: "glaze: ash" })
    expect(glaze).toBeInTheDocument()

    const search = screen.getByRole("searchbox", { name: "Search JSON" })
    expect(search.className).toContain("focus-visible:ring-3")
    await user.type(search, "ash")
    expect(screen.getByText("1/1")).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: "glaze: ash" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.getByRole("searchbox", { name: "Search JSON" })).toHaveValue("")

    await user.click(within(screen.getByRole("treeitem", { name: "glaze: ash" })).getByRole("button", { name: "Copy value" }))
    expect(writeText).toHaveBeenCalledWith("ash")
    expect(await screen.findByRole("status")).toHaveTextContent("Copied value of root.glaze")
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ kind: "value", path: "root.glaze", text: "ash" }))

    glaze.focus()
    await user.keyboard("{Control>}{Shift>}c{/Shift}{/Control}")
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("root.glaze"))
    expect(screen.getByRole("status")).toHaveTextContent("Copied path root.glaze")
  })

  it("pages a long array and moves with the keyboard", async () => {
    const user = userEvent.setup()
    render(<JsonViewer data={[1, 2, 3, 4, 5]} pageSize={2} rootName="kiln" label="Temps" />)
    expect(screen.getByRole("treeitem", { name: "0: 1" })).toBeInTheDocument()
    expect(screen.queryByRole("treeitem", { name: "2: 3" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("treeitem", { name: "Show 2 more, 3 hidden" }))
    expect(await screen.findByRole("treeitem", { name: "2: 3" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: "Show 1 more, 1 hidden" })).toBeInTheDocument()

    const root = screen.getByRole("treeitem", { name: "kiln, array, 5 items" })
    root.focus()
    await user.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: "Show 1 more, 1 hidden" })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(root).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: "0: 1" })).toHaveFocus()
  })
})
