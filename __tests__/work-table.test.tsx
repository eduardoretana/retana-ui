import type { ComponentProps } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { WorkTableBoard } from "@/registry/blocks/work-table-board"
import { WorkTableQueue } from "@/registry/blocks/work-table-queue"
import { WorkTableSupport } from "@/registry/blocks/work-table-support"
import { WorkTableTree } from "@/registry/blocks/work-table-tree"
import {
  changeDepth,
  effortFilled,
  filterWorkRows,
  formatCompactNumber,
  formatMinutes,
  formatPercent,
  formatRelativeDue,
  formatSla,
  groupRows,
  loadSnapshot,
  mergeRows,
  moveInTree,
  moveSelection,
  moveToStatus,
  replaceWindow,
  savePreset,
  saveSnapshot,
  shiftSelection,
  sliceGroup,
  sortWorkRows,
  toggleHidden,
  treeSummary,
  visibleTreeIds,
  withSequentialRank,
  workTableAnnouncements,
  type WorkColumnLayout,
} from "@/registry/lib/work-table"
import { WorkDueCell, WorkNumberCell, WorkSlaCell, WorkStatusCell } from "@/registry/ui/work-table-cells"
import { WorkTable, type WorkColumn } from "@/registry/ui/work-table"

vi.mock("sonner", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() })
  return { toast }
})

const now = new Date("2026-10-15T15:00:00.000Z")

function liveText() {
  return document.querySelector("[data-slot='work-table-live']")?.textContent ?? ""
}

type Row = { id: string; title: string; statusId: string; parentId: string | null; effort: number; priority: "p0" | "p1" | "p2" | "p3"; due: string | null }

const rows: Row[] = [
  { id: "a", title: "Alfa", statusId: "todo", parentId: null, effort: 2, priority: "p1", due: "2026-10-16T00:00:00.000Z" },
  { id: "b", title: "Bravo", statusId: "todo", parentId: null, effort: 5, priority: "p0", due: "2026-10-14T00:00:00.000Z" },
  { id: "c", title: "Cora", statusId: "doing", parentId: null, effort: 1, priority: "p3", due: null },
]

function columns(): WorkColumn<Row>[] {
  return [
    { id: "title", header: "Título", locked: true, cell: (row) => row.title },
    { id: "effort", header: "Esfuerzo", cell: (row) => String(row.effort) },
  ]
}

describe("work table ordering", () => {
  it("moves a selected block and shifts it up or down", () => {
    expect(moveSelection(["a", "b", "c", "d"], "b", "d", ["b", "c"])).toEqual(["a", "d", "b", "c"])
    expect(shiftSelection(["a", "b", "c", "d"], ["b", "c"], "up")).toEqual(["b", "c", "a", "d"])
    expect(shiftSelection(["a", "b", "c", "d"], ["b", "c"], "end")).toEqual(["a", "d", "b", "c"])
    expect(shiftSelection(["a", "b", "c", "d"], ["b", "d"], "start")).toEqual(["b", "d", "a", "c"])
  })

  it("keeps ids outside the visible page in place", () => {
    expect(replaceWindow(["a", "b", "c", "d"], ["b", "c"], ["c", "b"])).toEqual(["a", "c", "b", "d"])
  })

  it("recalculates rank from the current order", () => {
    expect(withSequentialRank([{ id: "b", rank: 9 }, { id: "a", rank: 1 }])).toEqual([
      { id: "b", rank: 1 },
      { id: "a", rank: 2 },
    ])
  })
})

describe("work table groups and tree", () => {
  it("groups by status and sums points", () => {
    const groups = groupRows(rows, [
      { id: "todo", label: "Por hacer" },
      { id: "doing", label: "En curso" },
    ], (row) => row.statusId, (row) => row.effort)
    expect(groups.map((group) => [group.id, group.count, group.effort])).toEqual([
      ["todo", 2, 7],
      ["doing", 1, 1],
    ])
    expect(sliceGroup(groups[0]?.rows ?? [], 1, false).hidden).toBe(1)
  })

  it("moves a row into another status", () => {
    const next = moveToStatus(rows, ["a"], "doing", "c", (row) => row.statusId, (row, statusId) => ({ ...row, statusId }))
    expect(next.find((row) => row.id === "a")?.statusId).toBe("doing")
    expect(next.map((row) => row.id)).toEqual(["b", "c", "a"])
  })

  it("nests under the previous row and refuses a drop onto a descendant", () => {
    const tree = [
      { id: "s", parentId: null },
      { id: "a", parentId: "s" },
      { id: "n", parentId: "a" },
      { id: "t", parentId: null },
    ]
    const nested = moveInTree(tree, "t", "s", 1, (row, parentId) => ({ ...row, parentId }))
    expect(nested.find((row) => row.id === "t")?.parentId).toBe("s")
    const blocked = moveInTree(tree, "s", "n", 1, (row, parentId) => ({ ...row, parentId }))
    expect(blocked.map((row) => row.id)).toEqual(["s", "a", "n", "t"])
    const indented = changeDepth(tree, "a", 1, (row, parentId) => ({ ...row, parentId }))
    expect(indented.find((row) => row.id === "a")?.parentId).toBe("s")
    expect(visibleTreeIds(tree, ["s"]).includes("a")).toBe(false)
    expect(treeSummary(tree)).toEqual({ sections: 2, articles: 2, points: 0 })
  })
})

describe("work table formatters and layout", () => {
  it("formats compact numbers, percents, minutes, due dates, and SLA", () => {
    expect(formatCompactNumber(6300)).toBe("6.3k")
    expect(formatPercent(62)).toBe("62%")
    expect(formatMinutes(12.2)).toBe("12 min")
    expect(formatRelativeDue("2026-10-14T00:00:00.000Z", now).label).toBe("Vencida")
    expect(formatRelativeDue("2026-10-15T08:00:00.000Z", now).label).toBe("Hoy")
    expect(formatSla("2026-10-15T11:00:00.000Z", now).label).toBe("Vencido")
    expect(formatSla("2026-10-15T19:00:00.000Z", now).label).toBe("4h restantes")
    expect(effortFilled(0)).toBe(0)
  })

  it("sorts by priority with empty dates last and filters assignees", () => {
    const sorted = sortWorkRows(rows, "priority", "asc", { priority: (row) => row.priority, due: (row) => row.due })
    expect(sorted.map((row) => row.id)).toEqual(["b", "a", "c"])
    const dated = sortWorkRows(rows, "date", "asc", { due: (row) => row.due })
    expect(dated.at(-1)?.id).toBe("c")
    const filtered = filterWorkRows(rows, { priorities: ["p0"], priority: (row) => row.priority })
    expect(filtered.map((row) => row.id)).toEqual(["b"])
  })

  it("saves, restores, and persists a column preset", () => {
    const layout: WorkColumnLayout = { order: ["effort", "title"], hidden: ["effort"], density: "compact" }
    const presets = savePreset([], "Compacta", layout)
    expect(presets[0]?.layout.hidden).toEqual(["effort"])
    expect(toggleHidden(layout, "title", ["title"]).hidden).toEqual(["effort"])
    const memory = new Map<string, string>()
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) }
    saveSnapshot(storage, "queue", { layout, presets, activePresetId: presets[0]?.id ?? null })
    expect(loadSnapshot(storage, "queue", ["title", "effort"])?.layout.density).toBe("compact")
    const merged = mergeRows(rows, [rows[1]!, { ...rows[0]!, statusId: "doing" }])
    expect(merged.find((row) => row.id === "a")?.statusId).toBe("doing")
    expect(workTableAnnouncements(
      { pickedUp: "Tomada, posición", of: "de", over: "Sobre la posición", notOver: "Sin un destino.", dropped: "Soltada en la posición", cancelled: "Cancelado.", instructions: "" },
      () => 2,
      4,
    ).onDragStart({ active: { id: "row:a" } })).toContain("Tomada")
  })
})

describe("WorkTable", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function renderTable(extra: Partial<ComponentProps<typeof WorkTable<Row>>> = {}) {
    const onReorder = vi.fn()
    const onRemove = vi.fn()
    render(
      <WorkTable
        rows={rows}
        columns={columns()}
        getRowLabel={(row) => row.title}
        onReorder={onReorder}
        onRemove={onRemove}
        pageSize={2}
        {...extra}
      />,
    )
    return { onReorder, onRemove }
  }

  it("reorders from the row menu and announces it", async () => {
    const user = userEvent.setup()
    const { onReorder } = renderTable()
    await user.click(screen.getByRole("button", { name: "Alfa" }))
    await user.click(screen.getByRole("menuitem", { name: "Mover abajo" }))
    expect(onReorder).toHaveBeenCalledWith(["b", "a", "c"])
    expect(liveText()).toContain("Soltada")
  })

  it("moves a selection from the bulk toolbar", async () => {
    const user = userEvent.setup()
    const { onReorder } = renderTable()
    await user.click(screen.getByRole("checkbox", { name: "Seleccionar fila Alfa" }))
    await user.click(screen.getByRole("checkbox", { name: "Seleccionar fila Bravo" }))
    await user.click(screen.getByRole("button", { name: "Mover abajo" }))
    expect(onReorder).toHaveBeenCalledWith(["c", "a", "b"])
  })

  it("paginates and exposes a keyboard drag handle", async () => {
    const user = userEvent.setup()
    renderTable()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled()
    expect(screen.queryByText("Cora")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(screen.getByText("Cora")).toBeInTheDocument()
    const handle = screen.getByRole("button", { name: "Reordenar fila Cora" })
    expect(handle).toHaveAttribute("aria-roledescription", "sortable")
    handle.focus()
    await user.keyboard(" ")
    expect(liveText()).toMatch(/Tomada|Cancelado|Soltada|posición/)
  })

  it("drops motion when the reader prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }))
    renderTable()
    expect(screen.getByRole("table", { name: "Tabla de trabajo" }).closest("[data-motion]")).toHaveAttribute("data-motion", "reduce")
  })

  it("renders empty, loading, and error states", () => {
    const { unmount } = render(<WorkTable rows={[]} columns={columns()} />)
    expect(screen.getByText("Sin filas")).toBeInTheDocument()
    unmount()
    const { unmount: unmountLoading } = render(<WorkTable rows={rows} columns={columns()} state="loading" />)
    expect(screen.getByText("Cargando")).toBeInTheDocument()
    unmountLoading()
    render(<WorkTable rows={rows} columns={columns()} state="error" errorMessage="Sin red" onRetry={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Sin red")
  })

  it("shows more rows inside a group and nests from the menu", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    render(
      <WorkTable
        rows={rows}
        columns={columns()}
        mode="grouped"
        paginate={false}
        groupLimit={1}
        statuses={[{ id: "todo", label: "Por hacer", tone: "neutral" }, { id: "doing", label: "En curso", tone: "info" }]}
        getStatusId={(row) => row.statusId}
        setStatusId={(row, statusId) => ({ ...row, statusId })}
        getEffort={(row) => row.effort}
        getRowLabel={(row) => row.title}
        onMove={onMove}
      />,
    )
    const group = screen.getByText("Por hacer").closest("tbody")
    expect(group).toBeTruthy()
    expect(within(group as HTMLElement).getByRole("button", { name: /Mostrar 1 más/ })).toBeInTheDocument()
    expect(within(group as HTMLElement).queryByText("Bravo")).not.toBeInTheDocument()
    await user.click(within(group as HTMLElement).getByRole("button", { name: /Mostrar 1 más/ }))
    expect(within(group as HTMLElement).getByText("Bravo")).toBeInTheDocument()
    expect(screen.getByText("7 pts")).toBeInTheDocument()
  })
})

describe("work table variants", () => {
  it("renders the board, tree, queue, and support demos", () => {
    const { unmount } = render(<WorkTableBoard />)
    expect(screen.getByText("Revisar contrato marco")).toBeInTheDocument()
    expect(screen.getAllByText("Vencida").length).toBeGreaterThan(0)
    expect(screen.getByText("6.3k")).toBeInTheDocument()
    unmount()
    const { unmount: unmountTree } = render(<WorkTableTree />)
    expect(screen.getByText(/secciones/)).toBeInTheDocument()
    expect(screen.getByText("Notas del párrafo")).toBeInTheDocument()
    unmountTree()
    const { unmount: unmountQueue } = render(<WorkTableQueue />)
    expect(screen.getByText("Rango")).toBeInTheDocument()
    unmountQueue()
    render(<WorkTableSupport />)
    expect(screen.getByText("Vencido")).toBeInTheDocument()
    expect(screen.getByText("2h restantes")).toBeInTheDocument()
  })

  it("filters the board and nests a tree row", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<WorkTableBoard />)
    await user.click(screen.getByRole("button", { name: "P0", pressed: false }))
    expect(screen.getByText("Revisar contrato marco")).toBeInTheDocument()
    expect(screen.queryByText("Cerrar propuesta norte")).not.toBeInTheDocument()
    unmount()
    render(<WorkTableTree />)
    await user.click(screen.getByRole("button", { name: "Objetivo del encargo" }))
    await user.click(screen.getByRole("menuitem", { name: "Subir un nivel" }))
    expect(liveText()).toContain("Soltada")
  })
})

describe("work table cells", () => {
  it("renders overdue copy and status appearances", () => {
    render(
      <div>
        <WorkDueCell value="2026-10-14T00:00:00.000Z" now={now} />
        <WorkSlaCell value="2026-10-15T19:00:00.000Z" now={now} />
        <WorkStatusCell label="Hecho" tone="positive" appearance="outline" />
        <WorkStatusCell label="Por hacer" appearance="text" />
        <WorkNumberCell value={6300} />
      </div>,
    )
    expect(screen.getByText("Vencida")).toHaveAttribute("data-overdue", "")
    expect(screen.getByText("4h restantes")).toBeInTheDocument()
    expect(screen.getByText("Hecho").closest("[data-slot='status-pill']")).toHaveAttribute("data-appearance", "outline")
    expect(screen.getByText("Por hacer").closest("[data-slot='status-pill']")).toHaveAttribute("data-appearance", "text")
    expect(screen.getByText("6.3k")).toBeInTheDocument()
  })
})
