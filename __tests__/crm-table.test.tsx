import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CrmTable, crmColumnDefs, type CrmRow } from "@/registry/ui/crm-table"

const row: CrmRow = {
  id: "1",
  name: "Marina Soler",
  email: "marina@bruma.example",
  status: "Active",
  statusTone: "emphasis",
  stage: "Proposal",
  owner: "Diego Alarcón",
  lastActivity: "2h ago",
}

describe("CrmTable", () => {
  it("renders the pipeline columns and emits a row click", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<CrmTable rows={[row]} onRowClick={onRowClick} />)
    expect(screen.getByRole("columnheader", { name: "Contact" })).toBeInTheDocument()
    expect(screen.getByText("Proposal")).toBeInTheDocument()
    await user.click(screen.getByText("Marina Soler"))
    expect(onRowClick).toHaveBeenCalledWith(row)
    expect(crmColumnDefs().map((column) => column.id)).toEqual(["person", "status", "stage", "owner", "activity"])
  })
})
