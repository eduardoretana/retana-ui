import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgendaCategory, AgendaEvent } from "@/registry/lib/agenda"
import { mexicoStatutoryHolidays } from "@/registry/lib/time-off"
import type { TimeOffBlockLabels, TimeOffRow } from "@/registry/blocks/time-off"

export const anchor = "2026-09-14"
export const now = "2026-09-16T16:00:00.000Z"

export const categories: AgendaCategory[] = [{ id: "taller", label: "Taller", icon: "wrench", tone: "accent" }]

export function events(locale: SceneLocale): AgendaEvent[] {
  const es = locale === "es"
  return [
    {
      id: "horno",
      title: es ? "Revisión del horno 2" : "Kiln 2 check",
      startsAt: "2026-09-15T16:00:00.000Z",
      endsAt: "2026-09-15T17:00:00.000Z",
      categoryId: "taller",
      location: "León",
    },
  ]
}

export function holidays() {
  return mexicoStatutoryHolidays(2026).map((holiday) => ({ date: holiday.date, title: holiday.name }))
}

export function requests(locale: SceneLocale): TimeOffRow[] {
  const es = locale === "es"
  return [
    {
      id: "mariana",
      who: "Mariana Ruiz",
      kind: es ? "Vacaciones" : "Vacation",
      range: es ? "14–18 sep" : "14–18 Sep",
      days: "4",
      status: "pending",
      note: "PED-1048",
    },
    {
      id: "caja",
      who: "Caja",
      kind: es ? "Personal" : "Personal",
      range: es ? "2 nov" : "2 Nov",
      days: "1",
      status: "declined",
    },
  ]
}

export const filled = { mode: "filled" as const }
export const empty = { mode: "empty" as const }
export const loading = { mode: "loading" as const }
export const error = { mode: "error" as const }
export const declined = { mode: "declined" as const }

export function blockLabels(locale: SceneLocale): Partial<TimeOffBlockLabels> {
  if (locale === "en") return {}
  return {
    title: "Ausencias",
    requests: "Solicitudes",
    empty: "No hay solicitudes.",
    loading: "Cargando solicitudes",
    approve: "Aprobar",
    decline: "Rechazar",
    pending: "Pendiente",
    approved: "Aprobada",
    declined: "Rechazada",
    who: "Quién",
    kind: "Tipo",
    range: "Fechas",
    days: "Días",
    status: "Estado",
  }
}

export const errorCopy = {
  es: "No se aprobó la solicitud. Sigue pendiente.",
  en: "The request was not approved. It stays pending.",
}
