import type { ComponentProps } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { DataTableGrouping, type DataTableGroupingColumn } from "@/registry/ui/data-table-grouping"

type Flat = { id: string; name: string; stage: string; client: string; amount: number }

const flatRows: Flat[] = [
  { id: "a", name: "Cuenco", stage: "Horno", client: "Pell", amount: 10 },
  { id: "b", name: "Plato", stage: "Horno", client: "Duna", amount: 20 },
  { id: "c", name: "Jarra", stage: "Torno", client: "Pell", amount: 5 },
]

const flatColumns: DataTableGroupingColumn<Flat>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "stage", header: "Stage" },
  { accessorKey: "client", header: "Client" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => {
      const value = getValue<number>()
      return value == null ? "—" : String(value)
    },
  },
]

function FlatTable(props: Partial<ComponentProps<typeof DataTableGrouping<Flat>>> = {}) {
  return (
    <DataTableGrouping
      data={flatRows}
      columns={flatColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      aggregates={{ amount: "sum" }}
      align={{ amount: "end" }}
      groupCriteria={[
        { id: "stage", label: "Stage", columnId: "stage" },
        { id: "client", label: "Client", columnId: "client" },
        { id: "none", label: "None", columnId: null },
      ]}
      defaultGroupBy="stage"
      {...props}
    />
  )
}

type Node = { id: string; name: string; amount: number; hours: number; children?: Node[] }

const tree: Node[] = [
  {
    id: "casa",
    name: "Casa",
    amount: 0,
    hours: 0,
    children: [
      { id: "renta", name: "Renta", amount: 100, hours: 2 },
      { id: "luz", name: "Luz", amount: 40, hours: 4 },
    ],
  },
  {
    id: "mar",
    name: "Mar",
    amount: 0,
    hours: 0,
    children: [{ id: "boya", name: "Boya", amount: 10, hours: 6 }],
  },
]

const treeColumns: DataTableGroupingColumn<Node>[] = [
  { accessorKey: "name", header: "Partida" },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const value = getValue<number>()
      return value == null ? "—" : String(value)
    },
  },
  {
    accessorKey: "hours",
    header: "Horas",
    cell: ({ getValue }) => {
      const value = getValue<number>()
      return value == null ? "—" : String(value)
    },
  },
]

function TreeTable() {
  return (
    <DataTableGrouping
      data={tree}
      columns={treeColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      getSubRows={(row) => row.children}
      aggregates={{ amount: "sum", hours: "avg" }}
      align={{ amount: "end", hours: "end" }}
    />
  )
}

describe("data-table-grouping", () => {
  it("groups rows and keeps the selection when the criterion changes", async () => {
    const user = userEvent.setup()
    render(<FlatTable />)

    const hornoToggle = screen.getByRole("button", { name: "Collapse Horno" })
    expect(hornoToggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "Collapse Torno" })).toBeInTheDocument()
    const horno = hornoToggle.closest("tr")
    expect(horno).not.toBeNull()
    expect(within(horno as HTMLElement).getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Cuenco")).toBeInTheDocument()
    expect(screen.getByText("Jarra")).toBeInTheDocument()

    await user.click(screen.getByRole("checkbox", { name: "Select Cuenco" }))
    expect(screen.getByText("1 selected")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Client" }))
    expect(screen.getByRole("button", { name: "Client" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Collapse Pell" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Collapse Duna" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Select Cuenco" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select Plato" })).not.toBeChecked()
    expect(screen.getByText("1 selected")).toBeInTheDocument()
  })

  it("collapses one group and toggles every group", async () => {
    const user = userEvent.setup()
    render(<FlatTable />)

    await user.click(screen.getByRole("button", { name: "Collapse Horno" }))
    expect(screen.getByRole("button", { name: "Expand Horno" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Cuenco")).not.toBeInTheDocument()
    expect(screen.queryByText("Plato")).not.toBeInTheDocument()
    expect(screen.getByText("Jarra")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Collapse all" }))
    expect(screen.queryByText("Jarra")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Expand Torno" })).toHaveAttribute("aria-expanded", "false")

    await user.click(screen.getByRole("button", { name: "Expand all" }))
    expect(screen.getByText("Cuenco")).toBeInTheDocument()
    expect(screen.getByText("Jarra")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Collapse Horno" })).toHaveAttribute("aria-expanded", "true")
  })

  it("selects a whole group and turns the group checkbox indeterminate", async () => {
    const user = userEvent.setup()
    render(<FlatTable />)

    await user.click(screen.getByRole("checkbox", { name: "Select group Horno" }))
    expect(screen.getByRole("checkbox", { name: "Select Cuenco" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select Plato" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select Jarra" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select group Horno" })).toBeChecked()
    expect(screen.getByText("2 selected")).toBeInTheDocument()

    await user.click(screen.getByRole("checkbox", { name: "Select Cuenco" }))
    expect(screen.getByRole("checkbox", { name: "Select group Horno" })).toHaveAttribute("aria-checked", "mixed")
    expect(screen.getByRole("checkbox", { name: "Select Plato" })).toBeChecked()
    expect(screen.getByText("1 selected")).toBeInTheDocument()
  })

  it("shows nested subtotals and a grand total footer", () => {
    const { container } = render(<TreeTable />)

    expect(screen.getByText("Renta")).toBeInTheDocument()
    expect(screen.getByText("Luz")).toBeInTheDocument()
    expect(screen.getByText("140")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()

    const footer = container.querySelector("tfoot")
    expect(footer).not.toBeNull()
    expect(footer).toHaveTextContent("Total")
    expect(footer).toHaveTextContent("150")
    expect(footer).toHaveTextContent("4")
  })

  it("collapses a tree parent without dropping its subtotal", async () => {
    const user = userEvent.setup()
    render(<TreeTable />)

    await user.click(screen.getByRole("button", { name: "Collapse Casa" }))
    expect(screen.getByRole("button", { name: "Expand Casa" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Renta")).not.toBeInTheDocument()
    expect(screen.queryByText("Luz")).not.toBeInTheDocument()
    expect(screen.getByText("140")).toBeInTheDocument()
    expect(screen.getByText("Boya")).toBeInTheDocument()
  })

  it("reveals a master-detail subtable and pages rows", async () => {
    const user = userEvent.setup()
    const rows = ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"].map((name, index) => ({
      id: `r${index}`,
      name,
    }))
    render(
      <DataTableGrouping
        data={rows}
        columns={[{ accessorKey: "name", header: "Orden" } satisfies DataTableGroupingColumn<(typeof rows)[number]>]}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        renderDetail={(row) => <p>Tareas de {row.name}</p>}
        defaultPageSize={2}
        pageSizeOptions={[2, 4]}
      />,
    )

    expect(screen.getByText("Uno")).toBeInTheDocument()
    expect(screen.queryByText("Tres")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Show details Uno" }))
    expect(screen.getByText("Tareas de Uno")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hide details Uno" })).toHaveAttribute("aria-expanded", "true")

    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("Tres")).toBeInTheDocument()
    expect(screen.queryByText("Uno")).not.toBeInTheDocument()
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument()
  })

  it("renders loading, empty, and error states", () => {
    const { rerender } = render(<FlatTable data={[]} />)
    expect(screen.getByRole("status")).toHaveTextContent("No rows")

    rerender(<FlatTable loading />)
    expect(screen.getByRole("status", { name: "Loading rows" })).toBeInTheDocument()

    rerender(<FlatTable error="Falló la red" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Falló la red")
  })
})
