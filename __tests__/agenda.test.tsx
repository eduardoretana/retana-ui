import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agenda } from "@/registry/blocks/agenda"
import {
  addZonedDays,
  startOfZonedDay,
} from "@/registry/lib/date-range"
import {
  attentionEvents,
  calendarDate,
  formatRangeLabel,
  formatTimeZoneShort,
  isEventOngoing,
  isGapHour,
  layoutTimedSegments,
  monthGrid,
  placeOverlaps,
  segmentsForEvent,
  shiftClock,
  shiftEventByDays,
  startOfWeekDate,
  upcomingEvents,
  visibleDates,
  zonedDateTimeToUtc,
  zonedDayBounds,
  type AgendaEvent,
} from "@/registry/lib/agenda"

const MX = "America/Mexico_City"
const NY = "America/New_York"
const now = "2026-04-08T16:28:00.000Z"

const categories = [
  { id: "diseno", label: "Diseño", icon: "pen", tone: "info" as const },
  { id: "taller", label: "Taller", icon: "wrench", tone: "neutral" as const },
]

const events: AgendaEvent[] = [
  {
    id: "pieza",
    title: "Prueba de la pieza",
    description: "Revisar el ajuste del bastidor antes de la crítica.",
    startsAt: "2026-04-08T16:00:00.000Z",
    endsAt: "2026-04-08T18:30:00.000Z",
    categoryId: "diseno",
    location: "Sala Norte",
    taskId: "horno",
    participants: [
      { id: "nuria", name: "Nuria Sol", status: "confirmed" },
      { id: "ivo", name: "Ivo Calderón", status: "pending" },
    ],
  },
  {
    id: "solape",
    title: "Corte de papel",
    startsAt: "2026-04-08T16:30:00.000Z",
    endsAt: "2026-04-08T17:30:00.000Z",
    categoryId: "taller",
  },
  {
    id: "noche",
    title: "Horneada de la noche",
    startsAt: "2026-04-08T04:00:00.000Z",
    endsAt: "2026-04-08T08:00:00.000Z",
    categoryId: "taller",
  },
  {
    id: "feria",
    title: "Feria del barrio",
    startsAt: "2026-04-10T06:00:00.000Z",
    endsAt: "2026-04-11T06:00:00.000Z",
    allDay: true,
    categoryId: "diseno",
    attention: true,
    recordId: "cuenta-calamo",
  },
  {
    id: "lunes",
    title: "Sincronía del equipo",
    startsAt: "2026-04-06T15:00:00.000Z",
    endsAt: "2026-04-06T15:30:00.000Z",
    categoryId: "diseno",
  },
]

function Board(props: Partial<React.ComponentProps<typeof Agenda>> = {}) {
  return (
    <Agenda
      events={events}
      categories={categories}
      now={now}
      anchor="2026-04-08"
      timeZone={MX}
      locale="es-MX"
      hourStart={8}
      hourEnd={16}
      {...props}
    />
  )
}

describe("agenda time", () => {
  it("keeps Mexico City on a 24 hour day and names the offset", () => {
    const ts = Date.parse(now)
    expect(calendarDate(ts, MX)).toBe("2026-04-08")
    expect(formatTimeZoneShort(ts, MX, "es-MX")).toMatch(/-6/)
    const bounds = zonedDayBounds("2026-04-08", MX)
    expect(bounds).toEqual({
      start: Date.parse("2026-04-08T06:00:00.000Z"),
      end: Date.parse("2026-04-09T06:00:00.000Z"),
    })
    expect(startOfZonedDay(ts, MX)).toBe(bounds?.start)
  })

  it("snaps a missing hour forward and prefers the earlier repeated hour", () => {
    const gap = zonedDateTimeToUtc(2026, 3, 8, 2, 30, NY)
    expect(gap.snapped).toBe(true)
    expect(new Date(gap.instant).toISOString()).toBe("2026-03-08T07:00:00.000Z")
    expect(isGapHour("2026-03-08", 2, NY)).toBe(true)
    expect(isGapHour("2026-03-08", 3, NY)).toBe(false)

    const fold = zonedDateTimeToUtc(2026, 11, 1, 1, 30, NY)
    expect(fold.snapped).toBe(false)
    expect(new Date(fold.instant).toISOString()).toBe("2026-11-01T05:30:00.000Z")

    const spring = zonedDayBounds("2026-03-08", NY)!
    expect(spring.end - spring.start).toBe(23 * 3_600_000)
    const fall = zonedDayBounds("2026-11-01", NY)!
    expect(fall.end - fall.start).toBe(25 * 3_600_000)
    expect(addZonedDays(spring.start, 1, NY)).toBe(spring.end)
  })

  it("splits midnight crossings, keeps all-day bounds, and starts the week on Monday", () => {
    const overnight = segmentsForEvent(events[2]!, MX, ["2026-04-07", "2026-04-08"])
    expect(overnight).toEqual([
      expect.objectContaining({ date: "2026-04-07", startMinute: 22 * 60, endMinute: 24 * 60, continuesAfter: true }),
      expect.objectContaining({ date: "2026-04-08", startMinute: 0, endMinute: 2 * 60, continuesBefore: true }),
    ])
    const fair = segmentsForEvent(events[3]!, MX, ["2026-04-10", "2026-04-11"])
    expect(fair).toHaveLength(1)
    expect(fair[0]).toMatchObject({ date: "2026-04-10", allDay: true, continuesBefore: false, continuesAfter: false })
    expect(startOfWeekDate("2026-04-08", 1)).toBe("2026-04-06")
    expect(visibleDates("week", "2026-04-08", 1)[0]).toBe("2026-04-06")
    expect(monthGrid("2026-04-08", 1)[0]?.iso).toBe("2026-03-30")
    expect(formatRangeLabel("month", "2026-04-08", "es-MX")).toMatch(/abril/i)
  })

  it("lays out overlaps in columns and shifts the clock across a gap", () => {
    const placement = placeOverlaps([
      { id: "a", start: 600, end: 720 },
      { id: "b", start: 630, end: 690 },
      { id: "c", start: 660, end: 780 },
      { id: "d", start: 780, end: 840 },
    ])
    expect(placement.get("a")?.columns).toBe(3)
    expect(placement.get("d")).toEqual({ column: 0, columns: 1 })
    const boxes = layoutTimedSegments(
      [
        { eventId: "a", date: "2026-04-08", startMinute: 600, endMinute: 720, allDay: false, continuesBefore: false, continuesAfter: false },
        { eventId: "b", date: "2026-04-08", startMinute: 630, endMinute: 690, allDay: false, continuesBefore: false, continuesAfter: false },
      ],
      8,
      16,
    )
    expect(boxes.find((box) => box.eventId === "b")?.column).toBe(1)
    expect(isEventOngoing(events[0]!, Date.parse(now))).toBe(true)
    expect(isEventOngoing(events[1]!, Date.parse(now))).toBe(false)

    const shifted = shiftEventByDays(
      { startsAt: "2026-03-07T15:00:00.000Z", endsAt: "2026-03-07T16:00:00.000Z" },
      1,
      NY,
    )
    expect(calendarDate(Date.parse(shifted.startsAt), NY)).toBe("2026-03-08")
    expect(new Date(shifted.startsAt).toISOString()).toBe("2026-03-08T14:00:00.000Z")

    const intoGap = shiftClock({ startsAt: "2026-03-08T06:00:00.000Z", endsAt: "2026-03-08T06:30:00.000Z" }, 60, NY)
    expect(intoGap.snapped).toBe(true)
    expect(new Date(intoGap.startsAt).toISOString()).toBe("2026-03-08T07:00:00.000Z")
    expect(upcomingEvents(events, Date.parse(now), []).map((event) => event.id)).toEqual(["solape"])
    expect(attentionEvents(events, Date.parse(now), []).map((event) => event.id)).toEqual(["feria"])
    expect(upcomingEvents(events, Date.parse(now), ["diseno"]).some((event) => event.id === "feria")).toBe(false)
  })
})

describe("agenda", () => {
  it("shows the week, the current time, and an expanded event", async () => {
    const user = userEvent.setup()
    render(<Board defaultSelectedId="pieza" />)
    expect(screen.getByRole("grid", { name: /Agenda/ })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /8/ })).toHaveAttribute("aria-current", "date")
    expect(document.querySelector("[data-slot=agenda-now]")).toHaveTextContent("10:28")
    expect(screen.getByText(/GMT-6|−6|-6/)).toBeInTheDocument()
    expect(screen.getByText("En curso")).toBeInTheDocument()
    const detail = document.querySelector("[data-slot=agenda-detail]")
    expect(detail).toHaveTextContent("Revisar el ajuste")
    await user.click(screen.getByRole("tab", { name: "Participantes" }))
    expect(screen.getByText("Ivo Calderón")).toBeInTheDocument()
    expect(screen.getByText("Pendiente")).toBeInTheDocument()
  })

  it("filters categories, changes the range from the mini month, and calls sync", async () => {
    const user = userEvent.setup()
    const onSync = vi.fn()
    const onAnchorChange = vi.fn()
    render(<Board onSync={onSync} onAnchorChange={onAnchorChange} />)
    expect(screen.getByRole("button", { name: /Abrir Prueba de la pieza/ })).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Mostrar Diseño" }))
    expect(screen.queryByRole("button", { name: /Abrir Prueba de la pieza/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Abrir Corte de papel/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Rango siguiente" }))
    expect(onAnchorChange).toHaveBeenCalledWith("2026-04-13")
    await user.click(screen.getByRole("button", { name: /15 de abril de 2026/ }))
    expect(onAnchorChange).toHaveBeenCalledWith("2026-04-15")
    await user.click(screen.getByRole("button", { name: "Sincronizar calendario" }))
    expect(onSync).toHaveBeenCalledOnce()
  })

  it("moves with the keyboard and the menu without mutating the event", async () => {
    const user = userEvent.setup()
    const onReschedule = vi.fn()
    render(<Board onReschedule={onReschedule} />)
    const open = screen.getByRole("button", { name: /Abrir Prueba de la pieza/ })
    open.focus()
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(onReschedule).toHaveBeenCalledWith(
      "pieza",
      expect.objectContaining({ startsAt: "2026-04-08T16:15:00.000Z" }),
      "move",
    )
    expect(screen.getByRole("button", { name: /Abrir Prueba de la pieza/ })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=agenda-announcement]")).toHaveTextContent(/movió/i)

    await user.click(screen.getByRole("button", { name: "Acciones de Corte de papel" }))
    await user.click(screen.getByRole("menuitem", { name: "Alargar 15 min" }))
    expect(onReschedule).toHaveBeenCalledWith(
      "solape",
      expect.objectContaining({ endsAt: "2026-04-08T17:45:00.000Z" }),
      "resize",
    )
  })

  it("opens the task and joins through callbacks", async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    const onOpenTask = vi.fn()
    const onCreateRequest = vi.fn()
    render(<Board defaultSelectedId="pieza" onJoin={onJoin} onOpenTask={onOpenTask} onCreateRequest={onCreateRequest} />)
    await user.click(screen.getByRole("button", { name: "Unirse a la reunión" }))
    expect(onJoin).toHaveBeenCalledWith("pieza")
    await user.click(screen.getByRole("button", { name: "Abrir encargo" }))
    expect(onOpenTask).toHaveBeenCalledWith("pieza", "horno")
    await user.click(screen.getByRole("button", { name: "Nuevo evento" }))
    expect(onCreateRequest).toHaveBeenCalledWith(expect.objectContaining({ allDay: false }))
  })

  it("shows empty, loading, error, and read only", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onReschedule = vi.fn()
    const { rerender } = render(<Board events={[]} />)
    expect(screen.getByText("No hay eventos")).toBeInTheDocument()
    rerender(<Board loading />)
    expect(screen.getByText("Cargando la agenda")).toBeInTheDocument()
    rerender(<Board error="Fallo de demostración." onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
    rerender(<Board readOnly onReschedule={onReschedule} />)
    expect(screen.getByText("Solo lectura")).toBeInTheDocument()
    screen.getByRole("button", { name: /Abrir Prueba de la pieza/ }).focus()
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(onReschedule).not.toHaveBeenCalled()
  })

  it("switches to the month and lists the fair", async () => {
    const user = userEvent.setup()
    render(<Board />)
    await user.click(screen.getByRole("button", { name: "Mes" }))
    const grid = screen.getByRole("grid", { name: /abril/i })
    expect(within(grid).getByRole("button", { name: /Abrir Feria del barrio/ })).toBeInTheDocument()
  })
})
