import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { applyGanttTaskPatch, type GanttItem } from "@/registry/lib/timeline-gantt"
import { TimelineGantt } from "@/registry/ui/timeline-gantt"

const now = "2026-10-25T18:00:00.000Z"

const base: GanttItem[] = [
  {
    id: "tinta",
    workstream: "impresion",
    label: "Pruebas de tinta",
    start: "2026-10-20",
    end: "2026-10-24",
    status: "done",
  },
  {
    id: "catalogo",
    workstream: "impresion",
    label: "Catálogo de feria",
    start: "2026-10-13",
    end: "2026-10-28",
    status: "active",
    deps: ["tinta"],
    assignees: [{ id: "mina", name: "Mina Soler" }],
  },
  {
    id: "tapas",
    workstream: "encuadernacion",
    label: "Tapas de lino",
    start: "2026-10-27",
    end: "2026-10-30",
    status: "planned",
  },
]

const streams = [
  { id: "impresion", label: "Impresión" },
  { id: "encuadernacion", label: "Encuadernación" },
  { id: "vacio", label: "Vacío" },
]

describe("TimelineGantt without the new props", () => {
  it("keeps the solid status bar and skips progress, rollup, and the sheet", () => {
    render(<TimelineGantt items={base} workstreams={streams} now={now} />)
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "Editar tarea" })).not.toBeInTheDocument()
    expect(screen.queryByText("Sin avance")).not.toBeInTheDocument()
    const active = screen.getByRole("button", { name: /Catálogo de feria/ })
    expect(active.className).toContain("bg-primary")
    expect(active).not.toHaveAttribute("data-progress")
    expect(screen.getByText("Impresión, 2").textContent).toBe("Impresión, 2")
  })
})

describe("TimelineGantt progress", () => {
  const items: GanttItem[] = [
    { ...base[0]!, progress: 1 },
    { ...base[1]!, progress: 0.4 },
    { ...base[2]!, progress: 0 },
  ]

  it("exposes a progressbar, clamps extremes, and ignores NaN", () => {
    render(
      <TimelineGantt
        items={[
          { ...items[1]!, progress: 150 },
          { ...items[0]!, id: "nada", label: "Sin número", progress: Number.NaN },
          { ...items[2]!, id: "cero", label: "En cero", progress: -8 },
          { ...items[1]!, id: "uno", label: "Un día", start: "2026-10-22", end: "2026-10-22", progress: 40 },
        ]}
        now={now}
        scale="day"
      />,
    )
    expect(screen.getByRole("progressbar", { name: /Catálogo de feria/ })).toHaveAttribute("aria-valuenow", "100")
    expect(screen.getByRole("button", { name: /Sin número/ })).not.toHaveAttribute("data-progress")
    expect(screen.getByRole("progressbar", { name: /En cero/ })).toHaveAttribute("aria-valuenow", "0")
    const day = screen.getByRole("progressbar", { name: /Un día/ })
    expect(day).toHaveAttribute("aria-valuemin", "0")
    expect(day).toHaveAttribute("aria-valuemax", "100")
    expect(day).toHaveAttribute("aria-valuenow", "40")
    const fill = document.querySelector("[data-slot=timeline-gantt-progress-fill]")
    expect(fill?.className).toContain("origin-left")
    expect(fill?.getAttribute("style") ?? "").not.toMatch(/width/)
  })

  it("rolls a group up by duration and leaves an empty group without a fake zero", () => {
    render(<TimelineGantt items={[
      { ...base[0]!, start: "2026-10-01", end: "2026-10-05", progress: 1 },
      { ...base[1]!, start: "2026-10-06", end: "2026-10-10", progress: 0.6 },
      { ...base[2]!, progress: 0 },
    ]} workstreams={streams} now={now} />)
    const impresion = screen.getByRole("progressbar", { name: /Impresión, 80% de avance/ })
    expect(impresion).toHaveAttribute("aria-valuenow", "80")
    expect(screen.getByRole("progressbar", { name: /Encuadernación, 0% de avance/ })).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByText("Vacío, 0").textContent).toBe("Vacío, 0")
    expect(screen.getByText("80%")).toBeInTheDocument()
  })
})

describe("TimelineGantt edit sheet", () => {
  it("opens on the name field, rejects an end before the start, and returns focus on Escape", async () => {
    const user = userEvent.setup()
    const requests = vi.fn()
    render(<EditHarness onRequest={requests} />)
    const name = await screen.findByRole("textbox", { name: "Nombre" })
    await waitFor(() => expect(name).toHaveFocus())
    const dialog = screen.getByRole("dialog", { name: "Editar tarea" })
    expect(dialog.className).toContain("w-[390px]")
    const end = within(dialog).getByLabelText("Fin")
    fireEvent.change(end, { target: { value: "2026-10-01" } })
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(requests).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent("anterior al inicio")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: "Editar tarea" })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("button", { name: /Catálogo de feria/ })).toHaveFocus())
  })

  it("emits a patch and lets the host store it", async () => {
    const user = userEvent.setup()
    const requests = vi.fn()
    render(<EditHarness onRequest={requests} />)
    const name = screen.getByRole("textbox", { name: "Nombre" })
    await user.clear(name)
    await user.type(name, "Catálogo revisado")
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(requests).toHaveBeenCalledWith(
      "catalogo",
      expect.objectContaining({ label: "Catálogo revisado", start: "2026-10-13", end: "2026-10-28", status: "active" }),
    )
    expect(screen.getByRole("button", { name: /Catálogo revisado/ })).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "Editar tarea" })).not.toBeInTheDocument()
  })
})

function EditHarness({ onRequest }: { onRequest: (id: string, patch: Parameters<typeof applyGanttTaskPatch>[2]) => void }) {
  const [items, setItems] = useState(base)
  const [editingId, setEditingId] = useState<string | null>("catalogo")
  return (
    <TimelineGantt
      items={items}
      workstreams={streams}
      now={now}
      editingId={editingId}
      onEditingIdChange={setEditingId}
      onTaskChangeRequest={(id, patch) => {
        onRequest(id, patch)
        setItems((current) => applyGanttTaskPatch(current, id, patch))
        setEditingId(null)
      }}
    />
  )
}
