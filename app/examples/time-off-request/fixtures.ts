import type { SceneLocale } from "@/app/catalog/scene-types"
import { mexicoStatutoryHolidays } from "@/registry/lib/time-off"
import type { TimeOffRequestLabels } from "@/registry/ui/time-off-request"

export const holidays = mexicoStatutoryHolidays(2026)

export const filled = { available: 12, pending: 2, start: "2026-10-05", end: "2026-10-07", kindId: "vacation" }
export const empty = { available: null as number | null, pending: 0, start: "", end: "", kindId: "vacation" }
export const loading = { ...filled, loading: true }
export const error = { ...filled, fail: true }
export const zero = { available: 0, pending: 0, start: "2026-10-05", end: "2026-10-07", kindId: "vacation" }
export const holiday = { available: 12, pending: 0, start: "2026-09-14", end: "2026-09-18", kindId: "vacation" }
export const half = { available: 12, pending: 0, start: "2026-10-05", end: "2026-10-05", kindId: "half" }

export function requestLabels(locale: SceneLocale): Partial<TimeOffRequestLabels> {
  const amount = (value: number) => (locale === "en" ? `${value} days` : `${value} días`)
  if (locale === "en") return { amount }
  return {
    title: "Pedir ausencia",
    kind: "Tipo",
    start: "Desde",
    end: "Hasta",
    note: "Notas",
    notePlaceholder: "Opcional",
    summary: "Días solicitados vs saldo disponible",
    requested: "Solicitados",
    available: "Disponible",
    pending: "Ya pendientes",
    remaining: "Quedarían",
    skipped: "No cuenta",
    weekend: "Fin de semana",
    shortfall: "El saldo no alcanza.",
    none: "Ese rango no tiene un día hábil.",
    submit: "Enviar solicitud",
    empty: "No hay saldo contra el cual pedir.",
    loading: "Cargando la solicitud",
    vacation: "Vacaciones",
    personal: "Personal",
    sick: "Enfermedad",
    half: "Medio día",
    amount,
  }
}

export const errorCopy = {
  es: "No se envió la solicitud. Sigue en el formulario.",
  en: "The request was not sent. It is still in the form.",
}
