import { buildResources, type Absence, type DispatchModel, type Job, type JobStatus, type Resource } from "@/registry/lib/dispatch-board"

export type Copy = { es: string; en: string }
export type SceneLocale = "es" | "en"

type Named = { id: string; label: Copy }
type FixResource = { id: string; name: Copy; groupId: string; skills: string[]; capacityHours: number; initials: string }
type FixJob = {
  id: string
  title: Copy
  statusId: string
  startsAt: string
  endsAt: string
  location?: Copy
  skillId?: string
  resourceId?: string
  marker?: string
  markerLabel?: Copy
}
export type DispatchFixture = {
  groups: Named[]
  skills: Named[]
  statuses: { id: string; label: Copy; tone: JobStatus["tone"] }[]
  resources: FixResource[]
  jobs: FixJob[]
  absences: { id: string; resourceId: string; startsAt: string; endsAt: string; label: Copy }[]
  error: Copy
  rejection: Copy
}

export const now = "2026-11-04T19:46:00.000Z"
export const anchor = "2026-11-04"
export const timeZone = "America/Mexico_City"

function at(day: number, hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 10, day, hour + 6, minute)).toISOString()
}

const groups: Named[] = [
  { id: "asesor", label: { es: "Asesores de campo", en: "Field advisors" } },
  { id: "responsable", label: { es: "Responsables", en: "Leads" } },
  { id: "despacho", label: { es: "Despacho", en: "Dispatch" } },
]
const skills: Named[] = [
  { id: "caldera", label: { es: "Caldera", en: "Boiler" } },
  { id: "medidor", label: { es: "Medidor", en: "Meter" } },
  { id: "cableado", label: { es: "Cableado", en: "Wiring" } },
  { id: "altura", label: { es: "Altura", en: "Heights" } },
]
const statuses: DispatchFixture["statuses"] = [
  { id: "rejected", label: { es: "Rechazado", en: "Rejected" }, tone: "critical" },
  { id: "travel", label: { es: "Traslado", en: "Travel" }, tone: "warning" },
  { id: "arrive", label: { es: "Llegada", en: "Arrive" }, tone: "info" },
  { id: "accepted", label: { es: "Aceptado", en: "Accepted" }, tone: "positive" },
]
const people: FixResource[] = [
  { id: "ines", name: { es: "Inés Soler", en: "Inés Soler" }, groupId: "asesor", skills: ["caldera", "medidor"], capacityHours: 7, initials: "IS" },
  { id: "nuria", name: { es: "Nuria Paz", en: "Nuria Paz" }, groupId: "asesor", skills: ["caldera"], capacityHours: 7, initials: "NP" },
  { id: "bruno", name: { es: "Bruno Hale", en: "Bruno Hale" }, groupId: "asesor", skills: ["altura"], capacityHours: 7, initials: "BH" },
  { id: "teo", name: { es: "Teo Lira", en: "Teo Lira" }, groupId: "asesor", skills: ["medidor"], capacityHours: 7, initials: "TL" },
  { id: "alma", name: { es: "Alma Ríos", en: "Alma Ríos" }, groupId: "responsable", skills: ["caldera", "altura"], capacityHours: 7, initials: "AR" },
  { id: "vera", name: { es: "Vera Quintero", en: "Vera Quintero" }, groupId: "responsable", skills: ["cableado"], capacityHours: 7, initials: "VQ" },
  { id: "lena", name: { es: "Lena Ortiz", en: "Lena Ortiz" }, groupId: "despacho", skills: ["cableado"], capacityHours: 7, initials: "LO" },
  { id: "cosme", name: { es: "Cosme Duarte", en: "Cosme Duarte" }, groupId: "despacho", skills: ["caldera"], capacityHours: 7, initials: "CD" },
]

function visit(id: string, es: string, en: string, statusId: string, resourceId: string | undefined, skillId: string, start: number, end: number, placeEs: string, placeEn: string): FixJob {
  return {
    id,
    title: { es, en },
    statusId,
    ...(resourceId ? { resourceId } : {}),
    skillId,
    startsAt: at(4, start),
    endsAt: at(4, end),
    location: { es: placeEs, en: placeEn },
    marker: "V",
    markerLabel: { es: "Visita", en: "Visit" },
  }
}

const visits: FixJob[] = [
  visit("puesta", "Puesta de caldera", "Boiler setup", "accepted", "ines", "caldera", 10, 12, "Calle Roble 18", "Oak street 18"),
  visit("lectura", "Lectura de medidor", "Meter reading", "arrive", "ines", "medidor", 13, 14, "Andador Norte 4", "North walk 4"),
  visit("revision", "Revisión de tiro", "Flue check", "travel", "nuria", "caldera", 11, 13, "Cerrada Palma 9", "Palm close 9"),
  visit("segundo", "Segunda visita", "Second visit", "accepted", "nuria", "caldera", 12, 14, "Cerrada Palma 9", "Palm close 9"),
  visit("ruta", "Ruta de medidores", "Meter route", "travel", "teo", "medidor", 9, 10, "Avenida Loma 120", "Loma avenue 120"),
  visit("cierre", "Cierre con el cliente", "Client close-out", "accepted", "alma", "caldera", 14, 16, "Plaza Ejemplo 2", "Example square 2"),
  visit("jornada", "Jornada de cableado", "Wiring shift", "accepted", "vera", "cableado", 9, 16, "Taller interno", "Internal shop"),
  visit("aviso", "Aviso de corte", "Shutoff notice", "rejected", "lena", "cableado", 15, 16, "Calle Sur 7", "South street 7"),
]
const queue: FixJob[] = [
  visit("cola-1", "Fuga en retorno", "Return leak", "travel", undefined, "caldera", 11, 12, "Privada Cedro 3", "Cedar court 3"),
  visit("cola-2", "Medidor sin señal", "Silent meter", "arrive", undefined, "medidor", 13, 14, "Calle Fresno 40", "Ash street 40"),
  visit("cola-3", "Tablero húmedo", "Damp panel", "accepted", undefined, "cableado", 10, 11, "Andador Este 8", "East walk 8"),
  visit("cola-4", "Revisión en azotea", "Roof check", "travel", undefined, "altura", 15, 16, "Edificio Demo 5", "Demo building 5"),
  visit("cola-5", "Puesta pendiente", "Pending setup", "rejected", undefined, "caldera", 9, 10, "Calle Roble 22", "Oak street 22"),
]
const away = [{ id: "curso", resourceId: "bruno", startsAt: at(4, 9), endsAt: at(4, 16), label: { es: "Curso interno", en: "Internal course" } }]
const errorCopy = { es: "No se pudo cargar el tablero de Campo Norte.", en: "The Campo Norte board could not be loaded." }
const rejectionCopy = { es: "Le falta la habilidad Altura. Elige a alguien que la tenga.", en: "Missing the Heights skill. Pick someone who has it." }

export const filled: DispatchFixture = { groups, skills, statuses, resources: people, jobs: [...visits, ...queue], absences: away, error: errorCopy, rejection: rejectionCopy }
export const empty: DispatchFixture = { ...filled, resources: [], jobs: [], absences: [] }
export const loading: DispatchFixture = filled
export const error: DispatchFixture = filled
export const conflicts: DispatchFixture = filled
export const timeOff: DispatchFixture = { ...filled, absences: [...away, { id: "permiso", resourceId: "cosme", startsAt: at(4, 9), endsAt: at(4, 13), label: { es: "Permiso de la mañana", en: "Morning leave" } }] }
export const unassignedQueue: DispatchFixture = filled
export const readonly: DispatchFixture = filled
export const filters: DispatchFixture = filled
export const rejected: DispatchFixture = filled
export const rows500: DispatchFixture = {
  ...filled,
  groups: [{ id: "asesor", label: { es: "Asesores de campo", en: "Field advisors" } }],
  resources: Array.from({ length: 500 }, (_, index) => ({
    id: `asesor-${index + 1}`,
    name: { es: `Asesor ${index + 1}`, en: `Advisor ${index + 1}` },
    groupId: "asesor",
    skills: [skills[index % skills.length]!.id],
    capacityHours: 7,
    initials: "A",
  })),
  jobs: [visit("lote", "Lectura del lote", "Batch reading", "accepted", "asesor-2", "medidor", 10, 12, "Calle Roble 18", "Oak street 18")],
  absences: [],
}

export function stressResources(count: number): Resource[] {
  return buildResources(count, { id: "asesor", label: "Asesores" }, [{ id: "caldera", label: "Caldera" }])
}

export function modelOf(fixture: DispatchFixture, locale: SceneLocale): DispatchModel {
  return {
    groups: fixture.groups.map((group) => ({ id: group.id, label: group.label[locale] })),
    skills: fixture.skills.map((skill) => ({ id: skill.id, label: skill.label[locale] })),
    statuses: fixture.statuses.map((status) => ({ id: status.id, label: status.label[locale], ...(status.tone ? { tone: status.tone } : {}) })),
    resources: fixture.resources.map((resource) => ({ id: resource.id, name: resource.name[locale], groupId: resource.groupId, skills: resource.skills, capacityHours: resource.capacityHours, initials: resource.initials })),
    jobs: fixture.jobs.map((item): Job => ({
      id: item.id,
      title: item.title[locale],
      statusId: item.statusId,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      ...(item.location ? { location: item.location[locale] } : {}),
      ...(item.skillId ? { skillId: item.skillId } : {}),
      ...(item.resourceId ? { resourceId: item.resourceId } : {}),
      ...(item.marker ? { marker: item.marker } : {}),
      ...(item.markerLabel ? { markerLabel: item.markerLabel[locale] } : {}),
    })),
    absences: fixture.absences.map((absence): Absence => ({ id: absence.id, resourceId: absence.resourceId, startsAt: absence.startsAt, endsAt: absence.endsAt, label: absence.label[locale] })),
  }
}
