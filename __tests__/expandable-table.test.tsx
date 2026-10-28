import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { expandableIds, expandAll, filterExpandableRows } from "@/registry/lib/expandable-table"
import { ExpandableTable, ExpansionLines } from "@/registry/ui/expandable-table"
import { checklistRows, nestedRows, taskRows } from "@/app/examples/expandable-table/fixtures"

describe("expandable table", () => {
  it("keeps a parent when a child matches and opens with the right arrow", async () => {
    const user = userEvent.setup()
    const rows = taskRows("es")
    const kept = filterExpandableRows(rows, {
      query: "lectura",
      searchText: (row) => row.code,
      getSubRows: (row) => row.subRows,
      setSubRows: (row, children) => ({ ...row, subRows: children }),
    })
    expect(kept.map((row) => row.id)).toEqual(["horno"])
    expect(expandableIds(rows, (row) => row.subRows)).toEqual(["horno", "termopar", "empaque"])
    expect(expandAll(["horno"])).toEqual({ horno: true })

    const onExpandedChange = vi.fn()
    render(
      <ExpandableTable
        rows={checklistRows("en")}
        columns={[{ id: "code", header: "Order", cell: (row) => row.code }]}
        rowTitle={(row) => row.code}
        renderDetail={(row) => <p>{row.account}</p>}
        onExpandedChange={onExpandedChange}
        pageSize={4}
      />,
    )
    expect(screen.getByText("PED-772")).toBeInTheDocument()
    expect(screen.queryByText("PED-641")).not.toBeInTheDocument()
    const open = screen.getByRole("button", { name: "Open PED-1048" })
    open.focus()
    await user.keyboard("{ArrowRight}")
    expect(onExpandedChange).toHaveBeenCalled()
    const next = onExpandedChange.mock.calls.at(-1)?.[0]
    expect(next).toMatchObject({ "ped-1048": true })
  })

  it("shows the order total inside the nested lines", () => {
    const lines = nestedRows("es")[0]?.lines ?? []
    render(<ExpansionLines lines={lines} caption="Partidas del pedido" />)
    expect(screen.getByText("$18,400.00 MXN")).toBeInTheDocument()
    expect(screen.getByText("Subtotal")).toBeInTheDocument()
  })
})
