import type { ComponentProps } from "react"

import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DispatchBoard } from "@/registry/blocks/dispatch-board"
import { buildResources, type Job, type Resource, type Skill } from "@/registry/lib/dispatch-board"

const TZ = "America/Mexico_City"
const skills: Skill[] = [
  { id: "caldera", label: "Caldera" },
  { id: "altura", label: "Altura" },
]
const ines: Resource = { id: "ines", name: "Inés Soler", groupId: "asesor", skills: ["caldera"], capacityHours: 7, initials: "IS" }
const bruno: Resource = { id: "bruno", name: "Bruno Hale", groupId: "asesor", skills: ["altura"], capacityHours: 7 }

function at(day: number, hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 10, day, hour + 6, minute)).toISOString()
}
function job(partial: Pick<Job, "id" | "startsAt" | "endsAt"> & Partial<Job>): Job {
  return { title: partial.id, statusId: "accepted", ...partial }
}

const model = {
  groups: [{ id: "asesor", label: "Asesores de campo" }],
  resources: [ines, bruno],
  skills,
  statuses: [
    { id: "accepted", label: "Aceptado", tone: "positive" as const },
    { id: "travel", label: "Traslado", tone: "warning" as const },
  ],
  jobs: [
    job({ id: "puesta", title: "Puesta de caldera", statusId: "accepted", resourceId: "ines", skillId: "caldera", location: "Calle Roble 18", startsAt: at(4, 10), endsAt: at(4, 12), marker: "V", markerLabel: "Visita" }),
    job({ id: "cola", title: "Lectura de medidor", statusId: "travel", skillId: "caldera", location: "Andador Norte 4", startsAt: at(4, 13), endsAt: at(4, 14) }),
  ],
  absences: [{ id: "libre", resourceId: "bruno", startsAt: at(4, 9), endsAt: at(4, 16), label: "Curso interno" }],
}

function board(overrides: Partial<ComponentProps<typeof DispatchBoard>> = {}) {
  return <DispatchBoard model={model} anchor="2026-11-04" now="2026-11-04T19:46:00.000Z" hourStart={9} hourEnd={16} timeZone={TZ} locale="es-MX" {...overrides} />
}

describe("DispatchBoard", () => {
  it("exposes a grid, a textual absence, and a status word", () => {
    render(board())
    expect(screen.getByRole("grid", { name: "Despacho" })).toBeInTheDocument()
    expect(screen.getByText("Curso interno")).toBeInTheDocument()
    expect(screen.getByText("Aceptado")).toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("assigns from the menu and rolls back when the host rejects the move", async () => {
    const user = userEvent.setup()
    const onAssignRequest = vi.fn().mockResolvedValue({ ok: true })
    const onMoveRequest = vi.fn().mockResolvedValue({ ok: false, reason: "conflict", detail: "Choca con Puesta de caldera. Elige otro horario u otra persona." })
    render(board({ onAssignRequest, onMoveRequest }))
    await user.click(screen.getByRole("button", { name: "Acciones del trabajo Lectura de medidor" }))
    await user.click(screen.getByRole("menuitem", { name: /Inés Soler/ }))
    expect(onAssignRequest).toHaveBeenCalledWith(expect.objectContaining({ jobId: "cola", resourceId: "ines" }))
    screen.getByRole("button", { name: /^Puesta de caldera/ }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMoveRequest).toHaveBeenCalled()
    expect(await screen.findByText(/Choca con Puesta de caldera/)).toBeInTheDocument()
  })

  it("does not call the host for a skill mismatch", async () => {
    const user = userEvent.setup()
    const onAssignRequest = vi.fn()
    render(board({
      onAssignRequest,
      model: { ...model, jobs: [...model.jobs, job({ id: "techo", title: "Revisión en altura", skillId: "altura", startsAt: at(4, 13), endsAt: at(4, 14) })] },
    }))
    await user.click(screen.getByRole("button", { name: "Acciones del trabajo Revisión en altura" }))
    const item = screen.getByRole("menuitem", { name: /Inés Soler/ })
    expect(item).toHaveAttribute("aria-disabled", "true")
    await user.click(item)
    expect(onAssignRequest).not.toHaveBeenCalled()
    expect(screen.getByText(/Le falta la habilidad Altura/)).toBeInTheDocument()
  })

  it("does not move a read-only job with the arrows", async () => {
    const user = userEvent.setup()
    const onMoveRequest = vi.fn()
    render(board({ readOnly: true, onMoveRequest }))
    screen.getByRole("button", { name: /^Puesta de caldera/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(onMoveRequest).not.toHaveBeenCalled()
  })

  it("mounts a window of a 500-row board", () => {
    const group = { id: "asesor", label: "Asesores de campo" }
    render(board({ model: { groups: [group], resources: buildResources(500, group, skills), skills, statuses: model.statuses, jobs: [], absences: [] } }))
    const names = within(screen.getByRole("grid")).getAllByText(/Asesor \d+/)
    expect(names.length).toBeGreaterThan(3)
    expect(names.length).toBeLessThan(40)
  })

  it("offers csv through the export callback", async () => {
    const user = userEvent.setup()
    const onExport = vi.fn().mockReturnValue(false)
    render(board({ onExport }))
    await user.click(screen.getByRole("button", { name: "Descargar lista" }))
    await user.click(screen.getByRole("menuitem", { name: "Descargar CSV" }))
    expect(onExport).toHaveBeenCalledWith(expect.objectContaining({ format: "csv" }))
    expect(onExport.mock.calls[0]?.[0].body).toContain("Puesta de caldera")
  })
})
