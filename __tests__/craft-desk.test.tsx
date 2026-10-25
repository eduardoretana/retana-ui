import { useState } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ActivityChat } from "@/registry/ui/activity-chat"
import { DataTableReorder, DataTableSparkline } from "@/registry/ui/data-table-reorder"
import { InlineApproveButton } from "@/registry/ui/inline-approve-button"
import { TimelineGantt } from "@/registry/ui/timeline-gantt"
import { TooltipCard } from "@/registry/ui/tooltip-card"
import { PortfolioDesk } from "@/registry/blocks/portfolio-desk"
import {
  formatEventWhen,
  orderEntries,
  voiceClock,
  waveformLevels,
  type ActivityChatEntry,
} from "@/registry/lib/activity-chat"
import { nextSort, sortTableRows, sparklinePoints } from "@/registry/lib/data-table-reorder"
import {
  dependencyCurve,
  formatGanttDate,
  ganttBar,
  ganttDependencies,
  ganttDomain,
  ganttTicks,
  layoutGroups,
  todayOffset,
  utcDay,
  type GanttItem,
} from "@/registry/lib/timeline-gantt"

const now = "2026-10-25T18:00:00.000Z"

const items: GanttItem[] = [
  {
    id: "ink",
    workstream: "print",
    label: "Pruebas de tinta",
    start: "2026-10-20",
    end: "2026-10-24",
    status: "done",
  },
  {
    id: "book",
    workstream: "print",
    label: "Catálogo de feria",
    start: "2026-10-21",
    end: "2026-10-28",
    status: "active",
    deps: ["ink", "missing"],
    description: "Treinta y dos páginas.",
    assignees: [{ id: "ana", name: "Ana Rueda" }],
  },
]

describe("gantt model", () => {
  it("places bars, a today line, and real dependencies", () => {
    expect(utcDay("2026-02-31")).toBeNull()
    const domain = ganttDomain(items, "day", Date.parse(now), 1)
    expect(domain.start).toBeLessThan(utcDay("2026-10-20")!)
    expect(domain.end).toBeGreaterThan(utcDay("2026-10-25")!)
    const bar = ganttBar(items[1]!, domain, 36)
    expect(bar?.width).toBeGreaterThan(36)
    expect(todayOffset(now, domain, 36)).not.toBeNull()
    expect(ganttDependencies(items)).toEqual([{ fromId: "ink", toId: "book" }])
    const ticks = ganttTicks(domain, "week", "es-MX", 16, 1)
    expect(ticks.length).toBeGreaterThan(0)
    expect(formatGanttDate("2026-10-25", "es-MX")).toMatch(/2026/)
    const layout = layoutGroups(items, [{ id: "print", label: "Impresión" }])
    expect(layout.groups[0]?.tasks).toHaveLength(2)
    const curve = dependencyCurve({ x: 0, width: 40, y: 32 }, { x: 80, y: 72 }, 40)
    expect(curve.d.startsWith("M")).toBe(true)
  })
})

describe("timeline gantt", () => {
  it("selects from the bar and announces it", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onHover = vi.fn()
    render(
      <TimelineGantt
        items={items}
        workstreams={[{ id: "print", label: "Impresión" }]}
        now={now}
        scale="week"
        onSelect={onSelect}
        onHover={onHover}
      />,
    )
    expect(screen.getByRole("heading", { name: "Cronograma" })).toBeInTheDocument()
    expect(screen.getByText("Hoy")).toBeInTheDocument()
    const bar = screen.getByRole("button", { name: /Catálogo de feria/ })
    bar.focus()
    await user.click(bar)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "book" }))
    expect(screen.getByText("Catálogo de feria seleccionado")).toBeInTheDocument()
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("button", { name: /Pruebas de tinta/ })).toHaveFocus()
  })

  it("moves the detail card with the pointer and closes it with Escape", async () => {
    const user = userEvent.setup()
    const onHover = vi.fn()
    render(
      <TimelineGantt
        items={items}
        workstreams={[{ id: "print", label: "Impresión" }]}
        now={now}
        scale="week"
        onHover={onHover}
      />,
    )
    await user.hover(screen.getByRole("button", { name: /Catálogo de feria/ }))
    expect(await screen.findByRole("dialog", { name: "Catálogo de feria" })).toBeInTheDocument()
    await user.hover(screen.getByRole("button", { name: /Pruebas de tinta/ }))
    expect(await screen.findByRole("dialog", { name: "Pruebas de tinta" })).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "Catálogo de feria" })).not.toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  it("shows empty, loading, and error", () => {
    const { rerender } = render(<TimelineGantt items={[]} now={now} />)
    expect(screen.getByText("No hay tareas en este periodo")).toBeInTheDocument()
    rerender(<TimelineGantt items={items} loading now={now} />)
    expect(screen.getByText("Cargando el cronograma")).toBeInTheDocument()
    rerender(<TimelineGantt items={[]} error="Fallo" onRetry={() => undefined} now={now} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Fallo")
  })
})

describe("tooltip card", () => {
  it("opens from the keyboard and runs an action", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <TooltipCard
        title="Catálogo"
        description="Treinta y dos páginas."
        people={[
          { id: "ana", name: "Ana Rueda" },
          { id: "leo", name: "Leo Marín" },
        ]}
        metrics={[{ id: "sheets", label: "Pliegos", value: "120" }]}
        actions={[{ id: "open", label: "Abrir ficha", onSelect }]}
      >
        <button type="button">Ver</button>
      </TooltipCard>,
    )
    const trigger = screen.getByRole("button", { name: "Ver" })
    trigger.focus()
    expect(await screen.findByRole("dialog", { name: "Catálogo" })).toBeInTheDocument()
    expect(screen.getByText("AR")).toBeInTheDocument()
    await user.tab()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalled()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Catálogo" })).not.toBeInTheDocument()
  })
})

describe("table sort", () => {
  it("keeps ties and sends empty values last", () => {
    const rows = [
      { id: "a", hours: 2 },
      { id: "b", hours: 2 },
      { id: "c", hours: null as number | null },
    ]
    expect(nextSort(null, "hours")).toEqual({ columnId: "hours", direction: "asc" })
    expect(nextSort({ columnId: "hours", direction: "asc" }, "hours").direction).toBe("desc")
    expect(sortTableRows(rows, (row) => row.hours, "asc").map((row) => row.id)).toEqual(["a", "b", "c"])
    expect(sortTableRows(rows, (row) => row.hours, "desc").map((row) => row.id)).toEqual(["a", "b", "c"])
    expect(sparklinePoints([1, 3], 10, 10)).toContain(",")
  })
})

function TableHarness() {
  const [name, setName] = useState("nada")
  const rows = [
    { id: "book", name: "Catálogo", hours: 10 },
    { id: "ink", name: "Tinta", hours: 4 },
  ]
  return (
    <div>
      <DataTableReorder
        rows={rows}
        columns={[
          { id: "name", header: "Pieza", sortValue: (row) => row.name, cell: (row) => row.name },
          { id: "hours", header: "Horas", align: "end", sortValue: (row) => row.hours, cell: (row) => row.hours },
        ]}
        onSortChange={() => undefined}
        onRowSelect={(row) => setName(row.name)}
        detail={(row) => ({ title: row.name, label: row.name, description: "Nota" })}
      />
      <DataTableSparkline values={[1, 2, 3]} label="Horas de la semana" />
      <p>{`Elegido: ${name}`}</p>
    </div>
  )
}

describe("data table reorder", () => {
  it("sorts rows and keeps both of them", async () => {
    const user = userEvent.setup()
    render(<TableHarness />)
    const table = screen.getByRole("table", { name: "Tabla" })
    const before = within(table).getAllByRole("row").slice(1).map((row) => row.textContent)
    expect(before[0]).toMatch(/Catálogo/)
    await user.click(screen.getByRole("button", { name: "Ordenar Horas ascendente" }))
    expect(screen.getByText("Ordenado por Horas, ascendente")).toBeInTheDocument()
    const after = within(table).getAllByRole("row").slice(1).map((row) => row.textContent)
    expect(after[0]).toMatch(/Tinta/)
    expect(after[1]).toMatch(/Catálogo/)
    await user.click(screen.getByRole("button", { name: "Detalle de Catálogo" }))
    expect(screen.getByText("Elegido: Catálogo")).toBeInTheDocument()
  })
})

describe("activity chat model", () => {
  it("orders entries and draws a waveform", () => {
    const entries: ActivityChatEntry[] = [
      { id: "b", kind: "message", authorId: "ana", createdAt: "2026-10-25T16:00:00.000Z", body: "Luego" },
      { id: "a", kind: "message", authorId: "ana", createdAt: "2026-10-25T15:00:00.000Z", body: "Antes" },
    ]
    expect(orderEntries(entries).map((entry) => entry.id)).toEqual(["a", "b"])
    expect(voiceClock(4200)).toBe("0:04")
    expect(waveformLevels([0, 1], 4)).toHaveLength(4)
    expect(formatEventWhen({ title: "Revisión", startsAt: "2026-10-27T22:00:00.000Z", endsAt: "2026-10-27T23:00:00.000Z" }, "es-MX", "America/Mexico_City")).toMatch(/–/)
  })
})

describe("activity chat", () => {
  it("sends a message and starts a voice note", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onPlay = vi.fn()
    const messages: ActivityChatEntry[] = [
      {
        id: "voice",
        kind: "voice",
        authorId: "leo",
        createdAt: "2026-10-25T16:00:00.000Z",
        voice: { durationMs: 2000, peaks: [0.2, 0.8, 0.4], transcript: "En el estante" },
      },
      {
        id: "event",
        kind: "event",
        authorId: "mina",
        createdAt: "2026-10-25T16:10:00.000Z",
        event: { title: "Revisión de color", startsAt: "2026-10-27T22:00:00.000Z", endsAt: "2026-10-27T23:00:00.000Z", location: "Mesa norte" },
      },
    ]
    render(<ActivityChat messages={messages} people={[{ id: "leo", name: "Leo Marín" }, { id: "mina", name: "Mina Soler" }]} currentUserId="mina" onSend={onSend} onPlay={onPlay} />)
    expect(screen.getByRole("heading", { name: "Revisión de color" })).toBeInTheDocument()
    expect(screen.getByText("Mesa norte")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reproducir nota de Leo Marín" }))
    expect(onPlay).toHaveBeenCalledWith("voice")
    expect(screen.getByRole("button", { name: "Pausar nota de Leo Marín" })).toHaveAttribute("aria-pressed", "true")
    await user.type(screen.getByRole("textbox", { name: "Mensaje" }), "Listo el pliego")
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onSend).toHaveBeenCalledWith("Listo el pliego")
  })
})

describe("inline approve", () => {
  it("turns the primary action into success", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<InlineApproveButton onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: "Aprobar" }))
    expect(onConfirm).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Aprobado" })).toHaveAttribute("data-state", "success")
  })
})

describe("portfolio desk", () => {
  it("shows the four regions", () => {
    render(
      <PortfolioDesk
        title="Taller Bruma"
        gantt={{ items, now, scale: "day" }}
        table={{
          rows: [{ id: "book", name: "Catálogo" }],
          columns: [{ id: "name", header: "Pieza", cell: (row: { id: string; name: string }) => row.name }],
        }}
        chat={{ messages: [], onSend: () => undefined }}
        approval={{ onConfirm: () => undefined }}
      />,
    )
    expect(screen.getByRole("heading", { name: "Taller Bruma" })).toBeInTheDocument()
    expect(screen.getAllByRole("region", { name: "Cronograma" }).length).toBeGreaterThan(0)
    expect(screen.getByRole("region", { name: "Tablero" })).toBeInTheDocument()
    expect(screen.getAllByRole("region", { name: "Conversación" }).length).toBeGreaterThan(0)
    expect(screen.getByRole("region", { name: "Aprobación" })).toBeInTheDocument()
  })
})
