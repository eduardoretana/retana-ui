import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Agenda } from "@/registry/blocks/agenda"
import { balanceLeft, businessSpan, mexicoStatutoryHolidays, requestedUnits } from "@/registry/lib/time-off"
import { TimeOffRequest } from "@/registry/ui/time-off-request"

describe("time off", () => {
  it("counts Mexican business days and skips Independence Day", () => {
    const holidays = mexicoStatutoryHolidays(2026)
    expect(holidays.map((holiday) => holiday.date)).toEqual([
      "2026-01-01",
      "2026-02-02",
      "2026-03-16",
      "2026-05-01",
      "2026-09-16",
      "2026-11-16",
      "2026-12-25",
    ])
    expect(mexicoStatutoryHolidays(2024).some((holiday) => holiday.date === "2024-12-01")).toBe(true)
    const span = businessSpan("2026-09-14", "2026-09-18", holidays)
    expect(span.days).toBe(4)
    expect(span.skipped.some((day) => day.date === "2026-09-16" && day.name === "Día de la Independencia")).toBe(true)
    expect(requestedUnits("2026-10-05", "2026-10-05", holidays, "half")).toBe(0.5)
    expect(requestedUnits("2026-09-16", "2026-09-16", holidays, "half")).toBe(0)
    expect(balanceLeft(12, 2, 4)).toBe(6)
    expect(balanceLeft(0, 0, 2)).toBe(-2)
  })

  it("shows requested days against the balance and blocks a shortfall", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <TimeOffRequest
        available={12}
        pending={0}
        holidays={mexicoStatutoryHolidays(2026)}
        defaultStart="2026-09-14"
        defaultEnd="2026-09-18"
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getByText("Requested days vs available balance")).toBeInTheDocument()
    expect(screen.getByText(/Día de la Independencia/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Send request" }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ requested: 4, remaining: 8 }))
  })

  it("puts a holiday on the all-day row and toasts a duplicate", async () => {
    const user = userEvent.setup()
    const onDuplicate = vi.fn()
    render(
      <Agenda
        now="2026-09-16T16:00:00.000Z"
        anchor="2026-09-14"
        holidays={[{ date: "2026-09-16", title: "Día de la Independencia" }]}
        events={[{ id: "horno", title: "Revisión del horno 2", startsAt: "2026-09-15T16:00:00.000Z", endsAt: "2026-09-15T17:00:00.000Z" }]}
        onDuplicate={onDuplicate}
      />,
    )
    expect(screen.getByText("Festivo: Día de la Independencia")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Editar, duplicar o borrar Revisión del horno 2" }))
    await user.click(screen.getByRole("button", { name: "Duplicar" }))
    expect(onDuplicate).toHaveBeenCalledWith(expect.objectContaining({ id: "horno" }))
    expect(await screen.findByText("Evento duplicado")).toBeInTheDocument()
  })
})
