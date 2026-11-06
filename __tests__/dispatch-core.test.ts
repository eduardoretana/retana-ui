import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { findResourceConflicts, resourceLoads } from "@/registry/lib/agenda"
import {
  DEFAULT_OCCUPANCY_THRESHOLDS,
  absenceToEvent,
  boardConflicts,
  boardRows,
  buildResources,
  dispatchDates,
  dispatchLabels,
  filterBoard,
  jobToEvent,
  jobsToCsv,
  jobsToJson,
  outsideWorkingHours,
  placeResourceJobs,
  reduceGesture,
  resourceOccupancy,
  rowHeights,
  validatePlacement,
  visibleSlice,
  workingSlices,
  type Absence,
  type Job,
  type Resource,
  type Skill,
} from "@/registry/lib/dispatch-board"

const TZ = "America/Mexico_City"
const DATES = ["2026-11-04"]

function at(day: number, hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 10, day, hour + 6, minute)).toISOString()
}

const skills: Skill[] = [
  { id: "caldera", label: "Caldera" },
  { id: "altura", label: "Altura" },
]

const ines: Resource = {
  id: "ines",
  name: "Inés Soler",
  groupId: "asesor",
  skills: ["caldera"],
  capacityHours: 7,
  initials: "IS",
}

function job(partial: Pick<Job, "id" | "startsAt" | "endsAt"> & Partial<Job>): Job {
  return { title: partial.id, statusId: "accepted", ...partial }
}

function placement(partial: Partial<Parameters<typeof validatePlacement>[0]> = {}) {
  return validatePlacement({
    jobId: "nuevo",
    title: "Puesta de caldera",
    resource: ines,
    startsAt: at(4, 10),
    endsAt: at(4, 12),
    skillId: "caldera",
    jobs: [],
    absences: [],
    skills,
    dates: DATES,
    hourStart: 9,
    hourEnd: 16,
    timeZone: TZ,
    labels: dispatchLabels,
    ...partial,
  })
}

describe("dispatch validation reuses agenda conflicts", () => {
  it("accepts a shared endpoint and rejects a real overlap with the same pairs", () => {
    const adjacent = [
      job({ id: "a", resourceId: "ines", startsAt: at(4, 10), endsAt: at(4, 11) }),
      job({ id: "b", resourceId: "ines", startsAt: at(4, 11), endsAt: at(4, 12) }),
    ]
    expect(boardConflicts(adjacent)).toEqual(findResourceConflicts(adjacent.map(jobToEvent)))
    expect(placement({ jobs: adjacent, startsAt: at(4, 12), endsAt: at(4, 13) }).ok).toBe(true)
    const overlap = [job({ id: "a", resourceId: "ines", title: "Lectura", startsAt: at(4, 10), endsAt: at(4, 12) })]
    const decision = placement({ jobs: overlap, startsAt: at(4, 11), endsAt: at(4, 13) })
    expect(decision).toMatchObject({ ok: false, reason: "conflict" })
    if (!decision.ok) expect(decision.detail).toContain("Lectura")
  })

  it("treats an absence as an absence, not a job conflict", () => {
    const away: Absence = { id: "libre", resourceId: "ines", startsAt: at(4, 9), endsAt: at(4, 16), label: "Curso" }
    expect(placement({ absences: [away] })).toMatchObject({ ok: false, reason: "absence" })
    expect(
      findResourceConflicts([
        absenceToEvent(away),
        jobToEvent({ id: "nuevo", title: "x", startsAt: at(4, 10), endsAt: at(4, 12), resourceId: "ines" }),
      ]),
    ).toHaveLength(1)
  })

  it("rejects a missing skill and a shift outside the visible hours", () => {
    expect(placement({ skillId: "altura" })).toMatchObject({ ok: false, reason: "skill" })
    expect(placement({ skillId: null }).ok).toBe(true)
    expect(placement({ startsAt: at(4, 8), endsAt: at(4, 10) })).toMatchObject({ ok: false, reason: "outside-hours" })
    expect(outsideWorkingHours(at(4, 22), at(5, 2), DATES, 9, 16, TZ)).toBe(true)
  })
})

describe("occupancy, filters, window, and gesture", () => {
  it("matches resourceLoads and discounts absences", () => {
    const jobs = [job({ id: "visita", resourceId: "ines", startsAt: at(4, 10), endsAt: at(4, 12) })]
    const absences = [{ id: "mediodia", resourceId: "ines", startsAt: at(4, 12), endsAt: at(4, 14) }]
    const rows = resourceOccupancy({ resources: [ines], jobs, absences, dates: DATES, hourStart: 9, hourEnd: 16, timeZone: TZ })
    const slices = jobs.flatMap((item) => workingSlices(jobToEvent(item), DATES, 9, 16, TZ))
    const loads = resourceLoads(slices, [{ id: "ines", label: "Inés Soler", capacityHours: 7 }], DATES, TZ)
    expect(rows[0]?.scheduledMs).toBe(loads[0]?.scheduledMs)
    expect(rows[0]?.absenceMs).toBe(2 * 3_600_000)
    expect(rows[0]?.level).toBe("open")
    const full = resourceOccupancy({
      resources: [ines],
      jobs: [job({ id: "largo", resourceId: "ines", startsAt: at(4, 9), endsAt: at(4, 16) })],
      absences: [],
      dates: DATES,
      hourStart: 9,
      hourEnd: 16,
      timeZone: TZ,
      thresholds: DEFAULT_OCCUPANCY_THRESHOLDS,
    })
    expect(full[0]?.level).toBe("full")
  })

  it("filters, exports, and windows 500 rows", () => {
    const occupancy = resourceOccupancy({
      resources: [ines],
      jobs: [job({ id: "caldera", resourceId: "ines", title: "Puesta norte", startsAt: at(4, 9), endsAt: at(4, 16), statusId: "travel" })],
      absences: [],
      dates: DATES,
      hourStart: 9,
      hourEnd: 16,
      timeZone: TZ,
    })
    const filtered = filterBoard({
      groups: [],
      resources: [ines],
      jobs: [job({ id: "caldera", resourceId: "ines", title: "Puesta norte", location: "Calle Roble 18", startsAt: at(4, 9), endsAt: at(4, 16), statusId: "travel" })],
      filters: { query: "roble", groupId: "asesor", skillId: "caldera", statusId: "travel", occupancy: "full" },
      occupancy,
    })
    expect(filtered.resources.map((item) => item.id)).toEqual(["ines"])
    expect(jobsToCsv(filtered.jobs, [ines], [{ id: "travel", label: "Traslado" }], skills)).toContain("Traslado")
    expect(JSON.parse(jobsToJson(filtered.jobs))).toHaveLength(1)
    const group = { id: "asesor", label: "Asesores" }
    const rows = boardRows([group], buildResources(500, group, skills))
    const layout = rowHeights(rows, new Map())
    const slice = visibleSlice(layout.offsets, layout.sizes, 0, 640, 2)
    expect(slice.end - slice.start).toBeLessThan(40)
    expect(slice.end).toBeGreaterThan(5)
  })

  it("selects a tap, scrolls a swipe, and drags after the hold", () => {
    const down = reduceGesture({ phase: "idle" }, { type: "down", kind: "touch", x: 0, y: 0, selected: false })
    expect(reduceGesture(down.state, { type: "up" }).effect).toBe("select")
    expect(reduceGesture(down.state, { type: "move", x: 2, y: 30 }).effect).toBe("scroll")
    const held = reduceGesture(down.state, { type: "hold" })
    expect(reduceGesture(held.state, { type: "move", x: 40, y: 2 }).effect).toBe("drag")
    const selected = reduceGesture({ phase: "idle" }, { type: "down", kind: "touch", x: 0, y: 0, selected: true })
    expect(reduceGesture(selected.state, { type: "move", x: 20, y: 1 }).effect).toBe("drag")
  })

  it("clips a midnight job and keeps overlap math in the agenda core", () => {
    const placed = placeResourceJobs(
      [job({ id: "noche", resourceId: "ines", startsAt: at(4, 22), endsAt: at(5, 2) })],
      DATES,
      20,
      24,
      TZ,
    )
    expect(placed[0]?.continuesAfter).toBe(true)
    expect(dispatchDates("week", "2026-11-04")).toHaveLength(7)
    const source = readFileSync(path.join(process.cwd(), "registry/lib/dispatch-board.ts"), "utf8")
    expect(source).toContain("findResourceConflicts")
    expect(source).toContain("resourceLoads")
    expect(source).not.toContain("function findResourceConflicts")
    expect(source).not.toContain("function resourceLoads")
  })
})
