import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BarTrendCard } from "@/registry/blocks/ae/bar-trend-card"
import { DashboardAnaliticoAe } from "@/registry/blocks/ae/dashboard-analitico-ae"
import { DashboardCapacitacionAe } from "@/registry/blocks/ae/dashboard-capacitacion-ae"
import { DayScrollerSchedule } from "@/registry/blocks/ae/day-scroller-schedule"
import { LeaderboardCard } from "@/registry/blocks/ae/leaderboard-card"
import { MultiAreaChartCard } from "@/registry/blocks/ae/multi-area-chart-card"
import { PillTopNav } from "@/registry/blocks/ae/pill-top-nav"
import { QuickNotesCard } from "@/registry/blocks/ae/quick-notes-card"
import { RadialRing } from "@/registry/blocks/ae/radial-pair-card"
import { StatSparklineCard, sparkPath } from "@/registry/blocks/ae/stat-sparkline-card"
import { TaskProgressCard } from "@/registry/blocks/ae/task-progress-card"
import { aeAppointments, aeDays, aeLeaders, aeMonthly } from "@/registry/lib/ae-dash-data"

describe("AE dashboard pieces", () => {
  it("stat card shows value and direction, and inverts tone", () => {
    render(<StatSparklineCard label="Vencidas" value="27" change="−12%" direction="down" series={[3, 2, 1]} invert />)
    expect(screen.getByText("27")).toBeInTheDocument()
    expect(screen.getByText("Baja")).toBeInTheDocument()
    expect(screen.getByText("Baja").parentElement).toHaveAttribute("data-good", "true")
    expect(sparkPath([])).toBe("")
    expect(sparkPath([5])).toContain("M0")
  })

  it("radial ring clamps and exposes a meter", () => {
    render(<RadialRing label="Resolución" value={140} />)
    expect(screen.getByRole("meter", { name: "Resolución" })).toHaveAttribute("aria-valuenow", "100")
  })

  it("bar card switches range and handles empty data", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<BarTrendCard data={aeMonthly} />)
    expect(screen.getByText(/Abr 42 expedientes/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText("Periodo"), "3")
    expect(screen.queryByText(/Abr 42/)).not.toBeInTheDocument()
    rerender(<BarTrendCard data={[]} />)
    expect(screen.getByText("Sin datos en este periodo.")).toBeInTheDocument()
  })

  it("notes add and delete", async () => {
    const user = userEvent.setup()
    render(<QuickNotesCard notes={[]} />)
    expect(screen.getByText("Sin notas por ahora.")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Nueva nota"), "Llamar a cliente{Enter}")
    expect(screen.getByText("Llamar a cliente")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Borrar nota: Llamar a cliente" }))
    await waitFor(() => expect(screen.queryByText("Llamar a cliente")).not.toBeInTheDocument())
  })

  it("day scroller moves with arrow keys and shows the next appointment", async () => {
    const user = userEvent.setup()
    render(<DayScrollerSchedule days={aeDays} items={aeAppointments} defaultDay="2026-10-22" />)
    expect(screen.getByRole("article", { name: "Próxima cita: Diagnóstico de pensión" })).toBeInTheDocument()
    screen.getByRole("tab", { selected: true }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName(/Vie 23/)
    await user.keyboard("{ArrowRight}")
    expect(await screen.findByText("No hay citas este día.")).toBeInTheDocument()
  })

  it("pill nav marks the current page", async () => {
    const user = userEvent.setup()
    const seen: string[] = []
    render(<PillTopNav items={[{ id: "a", label: "Uno" }, { id: "b", label: "Dos" }]} active="a" onNavigate={(id) => seen.push(id)} unread={2} />)
    expect(screen.getByRole("link", { name: "Uno" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Notificaciones, 2 sin leer" })).toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Dos" }))
    expect(seen).toEqual(["b"])
  })

  it("area legend toggles series", async () => {
    const user = userEvent.setup()
    render(<MultiAreaChartCard labels={["A", "B"]} series={[{ id: "x", label: "Serie X", values: [1, 2] }]} />)
    await user.click(screen.getByRole("button", { name: "Serie X" }))
    expect(screen.getByText("Activa al menos una serie.")).toBeInTheDocument()
  })

  it("tasks and leaderboard", () => {
    render(<TaskProgressCard tasks={[{ id: "1", title: "Uno", progress: 150 }, { id: "2", title: "Dos", progress: 20 }]} />)
    expect(screen.getByText("1/2")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Uno" })).toHaveAttribute("aria-valuenow", "100")
    render(<LeaderboardCard leaders={[...aeLeaders].reverse()} highlightId="a2" />)
    const first = screen.getAllByRole("listitem").find((row) => row.textContent?.includes("Ana Ruiz"))
    expect(first && within(first).getByText("1")).toBeTruthy()
    expect(screen.getByText("Luis Mora").closest("li")).toHaveAttribute("aria-current", "true")
  })

  it("both full screens render", () => {
    render(<DashboardAnaliticoAe />)
    expect(screen.getByRole("heading", { name: "Hola, Ana" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Crear nueva" })).toBeDisabled()
    render(<DashboardCapacitacionAe />)
    expect(screen.getAllByRole("navigation", { name: "Secciones" })).toHaveLength(2)
    expect(screen.getByRole("heading", { name: "Ranking de asesores" })).toBeInTheDocument()
  })

  it("keeps one tab stop when the default day is missing, and counts rounded tasks as done", () => {
    render(<DayScrollerSchedule days={aeDays} items={aeAppointments} defaultDay="2030-01-01" />)
    const stops = screen.getAllByRole("tab").filter((tab) => tab.getAttribute("tabindex") === "0")
    expect(stops).toHaveLength(1)
    render(<TaskProgressCard tasks={[{ id: "r", title: "Casi", progress: 99.6 }]} />)
    expect(screen.getByText("1/1")).toBeInTheDocument()
  })
})
