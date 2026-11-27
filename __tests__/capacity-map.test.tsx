import { readFileSync } from "node:fs"
import path from "node:path"

import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { filledZones, longNameZones, stressZones } from "@/app/examples/capacity-map/fixtures"
import {
  aisleRows,
  availableCount,
  defaultStatuses,
  resolveStatuses,
  simulateDemand,
  slotAccessibleName,
  zoneStats,
} from "@/registry/lib/capacity-map"
import { CapacityMap, CapacityMapBoard } from "@/registry/ui/capacity-map"

const banned = /\b(parking|garage|vehicle|vehicles|license plate|number plate|shadcn|payouts?|ev charging|drive aisle)\b/i

describe("capacity-map math", () => {
  it("counts available slots from statuses marked available and uses explicit capacity when given", () => {
    const zone = filledZones()[0]
    const stats = zoneStats(zone, defaultStatuses("en"))
    expect(stats.total).toBe(zone.groups.reduce((n, group) => n + group.slots.length, 0))
    expect(stats.capacity).toBe(zone.capacity ?? stats.total)
    expect(stats.available).toBe(availableCount(zone, defaultStatuses("en")))
    expect(stats.available + stats.occupied + stats.special + stats.exceeded).toBe(stats.total)
  })

  it("splits a group into two facing rows, with the remainder on the first row", () => {
    const slots = Array.from({ length: 7 }, (_, i) => ({ id: `s${i}`, label: `S${i}`, status: "free" }))
    const layout = aisleRows(slots)
    expect(layout.columns).toBe(4)
    expect(layout.top.map((slot) => slot.id)).toEqual(["s0", "s1", "s2", "s3"])
    expect(layout.bottom.map((slot) => slot.id)).toEqual(["s4", "s5", "s6"])
  })

  it("fills fillable slots in zone, group and slot order and reports overflow without touching special slots", () => {
    const statuses = resolveStatuses([
      { id: "held", label: "Held", tone: "info", available: false, fillable: false },
    ], "en")
    const zones = [
      {
        id: "a",
        label: "A",
        groups: [
          {
            id: "g1",
            label: "Hall",
            slots: [
              { id: "a1", label: "A1", status: "free" },
              { id: "a2", label: "A2", status: "special" },
              { id: "a3", label: "A3", status: "free" },
              { id: "a4", label: "A4", status: "held" },
            ],
          },
        ],
      },
      {
        id: "b",
        label: "B",
        groups: [{ id: "g2", label: "Hall", slots: [{ id: "b1", label: "B1", status: "free" }] }],
      },
    ]
    const two = simulateDemand(zones, 2, statuses)
    expect(two.filledIds).toEqual(["a1", "a3"])
    expect(two.overflow).toBe(0)
    expect(two.byZone.a).toEqual({ from: 2, to: 0, capacity: 4, filled: 2, overflow: 0 })
    const four = simulateDemand(zones, 4, statuses)
    expect(four.filledIds).toEqual(["a1", "a3", "b1"])
    expect(four.overflow).toBe(1)
    expect(four.byZone.b.overflow).toBe(0)
    expect(four.byZone.a.to).toBe(0)
  })

  it("builds an accessible name from the slot, its status and optional detail", () => {
    expect(slotAccessibleName({ id: "c1", label: "C-1", status: "occupied" }, defaultStatuses("es-MX"), "Inés Ejemplo")).toBe(
      "C-1, Ocupado, Inés Ejemplo",
    )
  })
})

describe("capacity-map surface", () => {
  it("shows a capacity bar per zone and arranges groups with a named separator", () => {
    render(<CapacityMap zones={filledZones()} locale="es-MX" defaultOpenZoneIds={["pb"]} />)
    const zone = screen.getByRole("region", { name: /Planta baja/i })
    expect(within(zone).getByRole("meter", { name: /disponibles/i })).toBeInTheDocument()
    expect(within(zone).getAllByText("Pasillo de consulta").length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /C-14, Excedido/ })).toBeInTheDocument()
  })

  it("highlights a slot from the table and the other way around", async () => {
    const user = userEvent.setup()
    render(<CapacityMapBoard zones={filledZones()} locale="es-MX" defaultOpenZoneIds={["pb"]} />)
    const row = screen.getByRole("row", { name: /Inés Ejemplo/ })
    await user.hover(row)
    expect(screen.getByRole("button", { name: /C-14, Excedido/ })).toHaveAttribute("data-highlighted", "")
    await user.click(screen.getByRole("button", { name: /C-21, Ocupado/ }))
    expect(screen.getByRole("row", { name: /Diego Ejemplo/ })).toHaveAttribute("data-highlighted", "")
  })

  it("opens the slot popover from the keyboard and closes it with Escape", async () => {
    const user = userEvent.setup()
    render(<CapacityMap zones={filledZones()} locale="en" defaultOpenZoneIds={["pb"]} />)
    const slot = screen.getByRole("button", { name: /C-14, Exceeded/ })
    slot.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("dialog", { name: /C-14/ })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: /C-14/ })).not.toBeInTheDocument()
  })

  it("previews extra demand, warns about overflow and discards without keeping the fill", async () => {
    const user = userEvent.setup()
    render(<CapacityMap zones={filledZones()} locale="es-MX" defaultOpenZoneIds={["pb", "p1"]} simulate />)
    await user.click(screen.getByRole("button", { name: /Simular demanda/i }))
    const slider = screen.getByRole("slider", { name: /Demanda extra/i })
    fireEvent.change(slider, { target: { value: (slider as HTMLInputElement).max } })
    expect(screen.getByRole("alert")).toHaveTextContent(/se quedarían fuera/i)
    const previewed = document.querySelectorAll("[data-preview='fill']")
    expect(previewed.length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: /Descartar/i }))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(document.querySelectorAll("[data-preview='fill']")).toHaveLength(0)
  })

  it("announces loading, empty and error and accepts a custom status", async () => {
    const { rerender } = render(<CapacityMap zones={[]} locale="es-MX" loading labels={{ loading: "Cargando el mapa" }} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando el mapa")
    rerender(<CapacityMap zones={[]} locale="es-MX" emptyLabel="No hay cupos que mostrar." />)
    expect(screen.getByText("No hay cupos que mostrar.")).toBeInTheDocument()
    rerender(<CapacityMap zones={[]} locale="es-MX" error="No se pudo leer el mapa." onRetry={() => undefined} labels={{ retry: "Reintentar" }} />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo leer el mapa.")
    rerender(
      <CapacityMap
        zones={[{ id: "z", label: "Zona", groups: [{ id: "g", label: "Pasillo", slots: [{ id: "s", label: "S-1", status: "held" }] }] }]}
        locale="en"
        defaultOpenZoneIds={["z"]}
        statuses={[{ id: "held", label: "On hold", tone: "warning", available: false }]}
      />,
    )
    expect(screen.getByRole("button", { name: "S-1, On hold" })).toBeInTheDocument()
  })

  it("moves between slots in a group with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<CapacityMap zones={filledZones()} locale="es-MX" defaultOpenZoneIds={["pb"]} />)
    const first = screen.getByRole("button", { name: /C-11,/ })
    first.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /C-12,/ })).toHaveFocus()
  })

  it("renders 500 slots and keeps a long label complete in the accessible name", () => {
    render(<CapacityMap zones={stressZones(500)} locale="en" defaultOpenZoneIds={["z0"]} />)
    expect(document.querySelectorAll("[data-slot='capacity-slot']")).toHaveLength(500)
    render(<CapacityMap zones={longNameZones()} locale="es-MX" defaultOpenZoneIds={["z"]} />)
    expect(screen.getByRole("button", { name: /Cubículo de observación compartida con nombre muy largo/ })).toBeInTheDocument()
  })
})

describe("capacity-map fixtures stay domain-free", () => {
  it("does not use the paid block's parking copy", () => {
    const root = path.resolve(__dirname, "..")
    for (const file of [
      "registry/ui/capacity-map.tsx",
      "registry/lib/capacity-map.ts",
      "app/examples/capacity-map/fixtures.ts",
      "app/examples/capacity-map/scenes.tsx",
    ]) {
      expect(readFileSync(path.join(root, file), "utf8")).not.toMatch(banned)
    }
  })
})
