import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Archive, Trash2 } from "lucide-react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { SwipeActions, SwipeActionsRow } from "@/registry/ui/swipe-actions"

describe("SwipeActions", () => {
  it("runs the same action from the more menu", async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    const onDelete = vi.fn()
    render(
      <SwipeActions label="Inbox">
        <SwipeActionsRow
          label="Kiln note"
          trailing={[
            { label: "Archive", icon: <Archive />, onSelect: onArchive, keepRow: true },
            { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: onDelete },
          ]}
        >
          Kiln note
        </SwipeActionsRow>
      </SwipeActions>,
    )
    expect(screen.getByRole("list", { name: "Inbox" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "More actions for Kiln note" }))
    await user.click(await screen.findByRole("menuitem", { name: "Archive" }))
    expect(onArchive).toHaveBeenCalledOnce()
    await user.click(screen.getByRole("button", { name: "More actions for Kiln note" }))
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it("removes a row when the parent drops it after the action", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [rows, setRows] = useState(["Kiln note", "Glaze test"])
      return (
        <SwipeActions label="Inbox">
          {rows.map((row) => (
            <SwipeActionsRow key={row} label={row} trailing={[{ label: "Archive", icon: <Archive />, onSelect: () => setRows((current) => current.filter((item) => item !== row)) }]}>
              {row}
            </SwipeActionsRow>
          ))}
        </SwipeActions>
      )
    }
    render(<Harness />)
    await user.click(screen.getByRole("button", { name: "More actions for Kiln note" }))
    await user.click(await screen.findByRole("menuitem", { name: "Archive" }))
    expect(screen.getByText("Kiln note").closest("li")).toHaveAttribute("data-removing")
    expect(screen.getByText("Glaze test")).toBeInTheDocument()
  })
})
