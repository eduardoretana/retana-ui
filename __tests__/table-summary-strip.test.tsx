import { readFileSync } from "node:fs"
import path from "node:path"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AdaptiveTable } from "@/registry/ui/adaptive-table"
import { AdminDataTable } from "@/registry/ui/data-table"
import { ExpandableTable } from "@/registry/ui/expandable-table"
import { TableSummaryStrip } from "@/registry/ui/table-summary-strip"
import { WorkTable } from "@/registry/ui/work-table"
import { TableComposition } from "@/app/examples/table-summary-strip/composition"

vi.mock("sonner", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() })
  return { toast }
})

const item = {
  id: "series",
  label: "Series",
  value: 4,
  format: "number" as const,
  sparkline: [1, 2, 4],
  sparklineLabel: "Trend for Series",
}

describe("table-summary-strip", () => {
  it("renders figures, a named trend, and tabular numbers", () => {
    render(<TableSummaryStrip locale="es-MX" items={[item]} />)
    expect(screen.getByText("Series")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Trend for Series" })).toBeInTheDocument()
  })

  it("hides an empty strip and still shows explicit zeros", () => {
    const { rerender } = render(<TableSummaryStrip items={[]} empty="hide" />)
    expect(document.querySelector("[data-slot='table-summary-strip']")).toBeNull()
    rerender(
      <TableSummaryStrip
        empty="show"
        locale="en-US"
        items={[{ id: "none", label: "Series", value: 0, format: "number" }]}
      />,
    )
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("announces loading and offers retry after an error", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = render(<TableSummaryStrip loading labels={{ loading: "Cargando cifras" }} items={[item]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando cifras")
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true")
    rerender(<TableSummaryStrip error="No se pudieron leer las cifras." onRetry={onRetry} labels={{ retry: "Reintentar" }} />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron leer las cifras.")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("renders a per-item slot", () => {
    render(<TableSummaryStrip items={[item]} renderItem={() => <span>Total en texto</span>} />)
    expect(screen.getByText("Total en texto")).toBeInTheDocument()
  })
})

describe("table composition", () => {
  it("mounts the strip, the admin table, a status action, and a sparkline", () => {
    render(<TableComposition locale="es" kind="data" mode="filled" />)
    expect(screen.getByText("Series")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: /En pausa, Reanudar, Reintentar, Aprobar, Anotar/ })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Tendencia de Serie A" })).toBeInTheDocument()
  })

  it("mounts the same strip on the expandable, work, and adaptive tables", () => {
    const { rerender } = render(<TableComposition locale="en" kind="expandable" mode="filled" />)
    expect(screen.getByRole("group", { name: /Paused, Resume, Retry, Approve, Note/ })).toBeInTheDocument()
    rerender(<TableComposition locale="en" kind="work" mode="filled" />)
    expect(screen.getByRole("group", { name: /Paused, Resume, Retry, Approve, Note/ })).toBeInTheDocument()
    rerender(<TableComposition locale="en" kind="adaptive" mode="filled" />)
    expect(screen.getByRole("group", { name: /Paused, Resume, Retry, Approve, Note/ })).toBeInTheDocument()
  })

  it("gives each table a leading slot without replacing the table", () => {
    const strip = <p>Cifras</p>
    const { rerender } = render(
      <AdminDataTable data={[{ id: "a" }]} columns={[{ id: "id", header: "Id", cell: ({ row }) => row.original.id }]} leading={strip} />,
    )
    expect(screen.getByText("Cifras")).toBeInTheDocument()
    rerender(
      <ExpandableTable rows={[{ id: "a" }]} columns={[{ id: "id", header: "Id", cell: (row) => row.id }]} rowTitle={(row) => row.id} leading={<p>Cifras</p>} />,
    )
    expect(screen.getByText("Cifras")).toBeInTheDocument()
    rerender(<WorkTable rows={[{ id: "a" }]} columns={[{ id: "id", header: "Id", cell: (row) => row.id }]} leading={<p>Cifras</p>} readOnly selectable={false} showOrder={false} paginate={false} />)
    expect(screen.getByText("Cifras")).toBeInTheDocument()
    rerender(
      <AdaptiveTable
        columns={[{ id: "id", priority: 1, minWidth: 80, header: { icon: <span>I</span>, label: "Id" }, render: (row: { id: string }) => row.id }]}
        groups={[{ id: "g", label: "Group", rows: [{ id: "a" }] }]}
        getRowId={(row) => row.id}
        leading={<p>Cifras</p>}
      />,
    )
    expect(screen.getByText("Cifras")).toBeInTheDocument()
  })
})

describe("table-summary fixtures stay domain-free", () => {
  it("does not use paid-library domain copy", () => {
    const root = path.resolve(__dirname, "..")
    const banned = /\b(payouts?|attendance|tickets?|regional|budget|shadcn)\b/i
    for (const file of [
      "registry/ui/table-summary-strip.tsx",
      "app/examples/table-summary-strip/fixtures.ts",
      "app/examples/table-summary-strip/composition.tsx",
      "app/examples/table-summary-strip/scenes.tsx",
    ]) {
      expect(readFileSync(path.join(root, file), "utf8")).not.toMatch(banned)
    }
  })
})
