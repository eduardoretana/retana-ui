import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Agenda } from "@/registry/blocks/agenda"
import {
  agendaLabelsEn,
  conflictPartners,
  findResourceConflicts,
  formatHoursFromMs,
  resourceLoads,
  zonedDayBounds,
  type AgendaEvent,
  type AgendaResource,
} from "@/registry/lib/agenda"

const MX = "America/Mexico_City"
const NY = "America/New_York"

function mx(day: number, hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 3, day, hour + 6, minute)).toISOString()
}

function event(partial: Pick<AgendaEvent, "id" | "startsAt" | "endsAt"> & Partial<AgendaEvent>): AgendaEvent {
  return { title: partial.id, ...partial }
}

const resources: AgendaResource[] = [
  { id: "horno", label: "Horno norte", capacityHours: 8 },
  { id: "mesa", label: "Mesa larga", capacityHours: 4 },
]

describe("findResourceConflicts", () => {
  it("does not treat a shared endpoint as a conflict", () => {
    const conflicts = findResourceConflicts([
      event({ id: "a", resourceId: "horno", startsAt: mx(8, 10), endsAt: mx(8, 11) }),
      event({ id: "b", resourceId: "horno", startsAt: mx(8, 11), endsAt: mx(8, 12) }),
    ])
    expect(conflicts).toEqual([])
  })

  it("pairs overlapping events on the same resource only", () => {
    const conflicts = findResourceConflicts([
      event({ id: "b", resourceId: "horno", startsAt: mx(8, 10), endsAt: mx(8, 12) }),
      event({ id: "a", resourceId: "horno", startsAt: mx(8, 11), endsAt: mx(8, 13) }),
      event({ id: "c", resourceId: "mesa", startsAt: mx(8, 11), endsAt: mx(8, 13) }),
      event({ id: "loose", startsAt: mx(8, 11), endsAt: mx(8, 13) }),
      event({ id: "blank", resourceId: "", startsAt: mx(8, 10), endsAt: mx(8, 14) }),
      event({ id: "bad", resourceId: "horno", startsAt: mx(8, 15), endsAt: mx(8, 15) }),
    ])
    expect(conflicts).toEqual([{ resourceId: "horno", eventIds: ["a", "b"] }])
    expect(conflictPartners("a", conflicts)).toEqual(["b"])
    expect(conflictPartners("loose", conflicts)).toEqual([])
  })

  it("counts an all-day event against the same resource and not the next boundary", () => {
    const day = zonedDayBounds("2026-04-10", MX)!
    const next = zonedDayBounds("2026-04-11", MX)!
    const conflicts = findResourceConflicts([
      event({
        id: "fair",
        resourceId: "horno",
        allDay: true,
        startsAt: new Date(day.start).toISOString(),
        endsAt: new Date(day.end).toISOString(),
      }),
      event({ id: "inside", resourceId: "horno", startsAt: mx(10, 10), endsAt: mx(10, 11) }),
      event({
        id: "next-day",
        resourceId: "horno",
        allDay: true,
        startsAt: new Date(next.start).toISOString(),
        endsAt: new Date(next.end).toISOString(),
      }),
      event({
        id: "at-boundary",
        resourceId: "horno",
        startsAt: new Date(day.end).toISOString(),
        endsAt: new Date(day.end + 60 * 60_000).toISOString(),
      }),
    ])
    expect(conflicts).toEqual([
      { resourceId: "horno", eventIds: ["at-boundary", "next-day"] },
      { resourceId: "horno", eventIds: ["fair", "inside"] },
    ])
  })

  it("uses absolute instants across a DST fold and a short spring day", () => {
    const fold = findResourceConflicts([
      event({
        id: "first",
        resourceId: "sala",
        startsAt: "2026-11-01T05:30:00.000Z",
        endsAt: "2026-11-01T06:00:00.000Z",
      }),
      event({
        id: "second",
        resourceId: "sala",
        startsAt: "2026-11-01T06:30:00.000Z",
        endsAt: "2026-11-01T07:00:00.000Z",
      }),
    ])
    expect(fold).toEqual([])

    const spanning = findResourceConflicts([
      event({
        id: "across",
        resourceId: "sala",
        startsAt: "2026-11-01T05:30:00.000Z",
        endsAt: "2026-11-01T06:45:00.000Z",
      }),
      event({
        id: "second",
        resourceId: "sala",
        startsAt: "2026-11-01T06:30:00.000Z",
        endsAt: "2026-11-01T07:00:00.000Z",
      }),
    ])
    expect(spanning).toEqual([{ resourceId: "sala", eventIds: ["across", "second"] }])

    const spring = zonedDayBounds("2026-03-08", NY)!
    expect(spring.end - spring.start).toBe(23 * 3_600_000)
    const springConflicts = findResourceConflicts([
      event({
        id: "spring-day",
        resourceId: "sala",
        allDay: true,
        startsAt: new Date(spring.start).toISOString(),
        endsAt: new Date(spring.end).toISOString(),
      }),
      event({
        id: "inside",
        resourceId: "sala",
        startsAt: new Date(spring.start + 60 * 60_000).toISOString(),
        endsAt: new Date(spring.start + 2 * 60 * 60_000).toISOString(),
      }),
      event({
        id: "after",
        resourceId: "sala",
        startsAt: new Date(spring.end).toISOString(),
        endsAt: new Date(spring.end + 60 * 60_000).toISOString(),
      }),
    ])
    expect(springConflicts).toEqual([{ resourceId: "sala", eventIds: ["inside", "spring-day"] }])
  })

  it("reports each overlapping pair and stays quiet for two hundred chained touches", () => {
    const chained = Array.from({ length: 200 }, (_, index) =>
      event({
        id: `e${String(index).padStart(3, "0")}`,
        resourceId: "horno",
        startsAt: new Date(Date.parse(mx(8, 8)) + index * 30 * 60_000).toISOString(),
        endsAt: new Date(Date.parse(mx(8, 8)) + (index * 30 + 60) * 60_000).toISOString(),
      }),
    )
    expect(findResourceConflicts(chained)).toHaveLength(199)
  })
})

describe("resourceLoads", () => {
  it("sums clipped hours, ignores a missing resource, and reports the overage", () => {
    const loads = resourceLoads(
      [
        event({ id: "burn", resourceId: "horno", startsAt: mx(8, 10), endsAt: mx(8, 12) }),
        event({ id: "other", resourceId: "mesa", startsAt: mx(8, 10), endsAt: mx(8, 15) }),
        event({ id: "loose", startsAt: mx(8, 10), endsAt: mx(8, 18) }),
        event({ id: "yesterday", resourceId: "horno", startsAt: mx(7, 10), endsAt: mx(7, 12) }),
        event({ id: "spill", resourceId: "horno", startsAt: mx(7, 22), endsAt: mx(8, 10) }),
      ],
      resources,
      ["2026-04-08"],
      MX,
    )
    const horno = loads.find((row) => row.resourceId === "horno")
    const mesa = loads.find((row) => row.resourceId === "mesa")
    expect(horno).toMatchObject({ scheduledMs: 12 * 3_600_000, capacityMs: 8 * 3_600_000, overMs: 4 * 3_600_000 })
    expect(mesa).toMatchObject({ scheduledMs: 5 * 3_600_000, capacityMs: 4 * 3_600_000, overMs: 1 * 3_600_000 })
    expect(formatHoursFromMs(horno?.overMs ?? 0, "es-MX")).toBe("4")
  })

  it("counts a spring-forward all-day as 23 hours and doubles overlapping bookings", () => {
    const spring = zonedDayBounds("2026-03-08", NY)!
    const doubled = resourceLoads(
      [
        event({ id: "a", resourceId: "mesa", startsAt: mx(8, 10), endsAt: mx(8, 12) }),
        event({ id: "b", resourceId: "mesa", startsAt: mx(8, 11), endsAt: mx(8, 13) }),
      ],
      [{ id: "mesa", label: "Mesa", capacityHours: 2 }],
      ["2026-04-08"],
      MX,
    )
    expect(doubled[0]).toMatchObject({ scheduledMs: 4 * 3_600_000, overMs: 2 * 3_600_000 })

    const shortDay = resourceLoads(
      [
        event({
          id: "all",
          resourceId: "sala",
          allDay: true,
          startsAt: new Date(spring.start).toISOString(),
          endsAt: new Date(spring.end).toISOString(),
        }),
      ],
      [{ id: "sala", label: "Sala", capacityHours: 8 }],
      ["2026-03-08"],
      NY,
    )
    expect(shortDay[0]?.scheduledMs).toBe(23 * 3_600_000)
    expect(shortDay[0]?.overMs).toBe(15 * 3_600_000)

    const open = resourceLoads(
      [event({ id: "a", resourceId: "libre", startsAt: mx(8, 10), endsAt: mx(8, 11) })],
      [{ id: "libre", label: "Libre" }, { id: "neg", label: "Neg", capacityHours: -1 }],
      ["2026-04-08", "2026-04-08"],
      MX,
    )
    expect(open[0]?.capacityMs).toBeNull()
    expect(open[0]?.overMs).toBe(0)
    expect(open[1]?.capacityMs).toBeNull()
  })
})

const originalMatch = window.matchMedia

afterEach(() => {
  window.matchMedia = originalMatch
})

function viewport(narrow: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("max-width") ? narrow : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

const dayEvents: AgendaEvent[] = [
  event({ id: "quema", title: "Quema del lote", resourceId: "horno", startsAt: mx(8, 10), endsAt: mx(8, 12) }),
  event({ id: "esmalte", title: "Esmalte húmedo", resourceId: "horno", startsAt: mx(8, 11), endsAt: mx(8, 13) }),
  event({ id: "corte", title: "Corte de papel", resourceId: "mesa", startsAt: mx(8, 9), endsAt: mx(8, 10) }),
]

const boardResources: AgendaResource[] = [
  { id: "horno", label: "Horno norte", capacityHours: 3 },
  { id: "mesa", label: "Mesa larga", capacityHours: 4 },
]

function DayBoard(props: Partial<React.ComponentProps<typeof Agenda>> = {}) {
  return (
    <Agenda
      events={dayEvents}
      resources={boardResources}
      now="2026-04-08T16:28:00.000Z"
      anchor="2026-04-08"
      defaultView="day"
      timeZone={MX}
      locale="es-MX"
      hourStart={8}
      hourEnd={16}
      {...props}
    />
  )
}

describe("agenda resources", () => {
  it("keeps the previous agenda when resources are omitted", () => {
    render(
      <Agenda
        events={dayEvents}
        now="2026-04-08T16:28:00.000Z"
        anchor="2026-04-08"
        defaultView="day"
        timeZone={MX}
        locale="es-MX"
        hourStart={8}
        hourEnd={16}
      />,
    )
    expect(screen.queryByRole("combobox", { name: "Recurso" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /choque/i })).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot=agenda-capacity]")).toBeNull()
    expect(document.querySelector("[data-slot=agenda]")).toHaveAttribute("data-resource-layout", "off")
    expect(screen.getByRole("button", { name: /Abrir Quema del lote/ })).toBeInTheDocument()
  })

  it("filters by resource, controlled or not, and lays the day out in columns", async () => {
    const user = userEvent.setup()
    const onResourceIdChange = vi.fn()
    const { rerender } = render(<DayBoard />)
    expect(document.querySelector("[data-slot=agenda]")).toHaveAttribute("data-resource-layout", "columns")
    expect(screen.getByRole("columnheader", { name: "Horno norte" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Mesa larga" })).toBeInTheDocument()
    await user.selectOptions(screen.getByRole("combobox", { name: "Recurso" }), "mesa")
    expect(screen.queryByRole("button", { name: /Abrir Quema del lote/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Abrir Corte de papel/ })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=agenda]")).toHaveAttribute("data-resource-layout", "single")

    rerender(<DayBoard resourceId="horno" onResourceIdChange={onResourceIdChange} />)
    expect(screen.getByRole("combobox", { name: "Recurso" })).toHaveValue("horno")
    await user.selectOptions(screen.getByRole("combobox", { name: "Recurso" }), "mesa")
    expect(onResourceIdChange).toHaveBeenCalledWith("mesa")
    expect(screen.getByRole("combobox", { name: "Recurso" })).toHaveValue("horno")
  })

  it("announces a conflict on the event and in the header, and keyboard reaches it", async () => {
    const user = userEvent.setup()
    render(<DayBoard />)
    const open = screen.getByRole("button", { name: /Abrir Quema del lote/ })
    expect(open).toHaveAccessibleName(/Choque con Esmalte húmedo/)
    expect(open.closest("[data-slot=agenda-event]")).toHaveAttribute("data-conflict", "true")
    expect(within(open).getByText(/Choque con Esmalte húmedo/)).toBeInTheDocument()
    const jump = screen.getByRole("button", { name: /1 choque/ })
    jump.focus()
    await user.keyboard("{Enter}")
    expect(open).toHaveFocus()
    expect(document.querySelector("[data-slot=agenda-announcement]")).toHaveTextContent("1 choque")
  })

  it("shows scheduled hours against capacity, including the overage", () => {
    render(<DayBoard />)
    const summary = document.querySelector("[data-slot=agenda-capacity]")
    expect(summary).not.toBeNull()
    expect(summary).toHaveTextContent("Horno norte")
    expect(summary).toHaveTextContent("4 h de 3 h")
    expect(summary).toHaveTextContent("1 h de más")
    expect(summary?.querySelector("svg")).not.toBeNull()
  })

  it("uses a list instead of columns at a narrow width", async () => {
    viewport(true)
    render(<DayBoard />)
    expect(document.querySelector("[data-slot=agenda]")).toHaveAttribute("data-resource-layout", "list")
    expect(screen.getByRole("heading", { name: "Horno norte" })).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: "Horno norte" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Choque con Esmalte húmedo/ })).toBeInTheDocument()
  })

  it("switches the chrome to English", () => {
    render(<DayBoard labels={agendaLabelsEn} locale="en-US" />)
    expect(screen.getByRole("combobox", { name: "Resource" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /1 conflict/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Conflicts with Esmalte húmedo/ })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=agenda-capacity]")).toHaveTextContent("1 h over")
  })

  it("keeps thirty resources and long names in the day axis", () => {
    const manyResources: AgendaResource[] = Array.from({ length: 30 }, (_, index) => ({
      id: `r${index}`,
      label: index === 0 ? `Horno${"Norte".repeat(12)}` : `Recurso ${index}`,
      capacityHours: 8,
    }))
    const manyEvents = Array.from({ length: 200 }, (_, index) =>
      event({
        id: `n${index}`,
        title: index === 0 ? `Critica${"Larga".repeat(12)}` : `Nota ${index}`,
        resourceId: `r${index % 30}`,
        startsAt: mx(8, 9),
        endsAt: mx(8, 10),
      }),
    )
    render(
      <DayBoard
        resources={manyResources}
        events={manyEvents}
      />,
    )
    expect(screen.getAllByRole("option")).toHaveLength(31)
    const header = screen.getByRole("columnheader", { name: manyResources[0]!.label })
    expect(header.querySelector(".truncate")).not.toBeNull()
    expect(screen.getByRole("button", { name: new RegExp(`Abrir ${manyEvents[0]!.title}`) })).toBeInTheDocument()
  })
})
