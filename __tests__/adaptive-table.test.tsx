import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  AdaptiveTable,
  formatAdaptiveNumber,
  resolveAdaptiveLayout,
  type AdaptiveColumn,
} from "@/registry/ui/adaptive-table"

type Row = { id: string; name: string; amount: number }

const columns: AdaptiveColumn<Row>[] = [
  {
    id: "name",
    priority: 10,
    minWidth: 220,
    header: { icon: <span>N</span>, label: "Name" },
    render: (row) => row.name,
    textValue: (row) => row.name,
  },
  {
    id: "amount",
    priority: 4,
    minWidth: 110,
    mergeInto: "name",
    header: { icon: <span>A</span>, label: "Amount" },
    render: (row) => formatAdaptiveNumber(row.amount, { locale: "en", currency: "USD" }),
    compactRender: (row) => formatAdaptiveNumber(row.amount, { locale: "en", currency: "USD", notation: "compact" }),
    textValue: (row) => formatAdaptiveNumber(row.amount, { locale: "en", currency: "USD" }),
  },
  {
    id: "note",
    priority: 1,
    minWidth: 130,
    header: { icon: <span>P</span>, label: "Participants" },
    render: () => "people",
  },
]

const groups = [
  {
    id: "intro",
    label: "Intro",
    rows: [{ id: "pebble", name: "Pebble Co", amount: 1800 }],
  },
]

function atWidth(width: number) {
  class Observer {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver)
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("resolveAdaptiveLayout", () => {
  it("drops low-priority columns before folding a column into its target", () => {
    const wide = resolveAdaptiveLayout(columns, 1100)
    expect(wide).toEqual(["visible", "visible", "visible"])
    const medium = resolveAdaptiveLayout(columns, 400)
    expect(medium).toEqual(["visible", "visible", "hidden"])
    const narrow = resolveAdaptiveLayout(columns, 320)
    expect(narrow).toEqual(["visible", "merged", "hidden"])
  })
})

describe("AdaptiveTable", () => {
  it("keeps the amount in its own column when the container is wide", () => {
    atWidth(720)
    render(<AdaptiveTable title="Pipeline" columns={columns} groups={groups} getRowId={(row) => row.id} locale="en" />)
    expect(screen.getByRole("columnheader", { name: /Amount/ })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Pebble Co" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "$1,800" })).toBeInTheDocument()
  })

  it("folds the amount into the name and removes the hidden column", () => {
    atWidth(320)
    render(<AdaptiveTable title="Pipeline" columns={columns} groups={groups} getRowId={(row) => row.id} locale="en" />)
    expect(screen.queryByRole("columnheader", { name: /Amount/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /Participants/ })).not.toBeInTheDocument()
    expect(screen.getByRole("cell", { name: /Pebble Co/ })).toHaveTextContent("$1.8K")
  })

  it("emits a row click and can collapse a group", async () => {
    atWidth(720)
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <AdaptiveTable
        columns={columns}
        groups={groups}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
        collapsibleGroups
      />,
    )
    await user.click(screen.getByRole("cell", { name: "Pebble Co" }))
    expect(onRowClick).toHaveBeenCalledWith(groups[0].rows[0])
    await user.click(screen.getByRole("button", { name: /Collapse Intro/ }))
    expect(screen.queryByRole("cell", { name: "Pebble Co" })).not.toBeInTheDocument()
  })

  it("renders the empty state", () => {
    atWidth(480)
    render(
      <AdaptiveTable columns={columns} groups={[]} getRowId={(row) => row.id} emptyState="No accounts" />,
    )
    expect(screen.getByText("No accounts")).toBeInTheDocument()
  })
})
