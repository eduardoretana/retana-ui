import type { SceneLocale } from "@/app/catalog/scene-types"
import { applyGrowth, type PlanNode, type PlanPeriod } from "@/registry/lib/planning-grid"
import type { PlanningGridLabels } from "@/registry/ui/planning-grid"

const ids = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"] as const

const month = {
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

export function periods(locale: SceneLocale): PlanPeriod[] {
  return ids.map((id, index) => ({
    id,
    label: month[locale][index] ?? id,
    kind: index < 6 ? "actual" : "forecast",
  }))
}

export const periodWeights = Object.fromEntries(ids.map((id) => [id, 1]))

function money(base: number): Record<string, number> {
  return Object.fromEntries(ids.map((id, index) => [id, base + index * 80]))
}

export function planRows(): PlanNode[] {
  return [
    {
      id: "norte",
      label: "Norte",
      weight: 1,
      prior: 18000,
      plan: 22000,
      locked: [],
      values: money(900),
      children: [
        { id: "ana", label: "Ana Solís", weight: 2, prior: 11000, plan: 14000, locked: [], values: money(600) },
        { id: "luis", label: "Luis Peña", weight: 1, prior: 7000, plan: 8000, locked: [], values: money(300) },
      ],
    },
    {
      id: "sur",
      label: "Sur",
      weight: 1,
      prior: 9000,
      plan: 12000,
      locked: [],
      values: money(400),
      children: [{ id: "paz", label: "Paz Neri", weight: 1, prior: 9000, plan: 12000, locked: [], values: money(400) }],
    },
  ]
}

export function spreadRows(): PlanNode[] {
  return planRows().map((row) => (row.id === "norte" ? applyGrowth(row, periods("es"), 0.2, periodWeights) : row))
}

export function lockedRows(): PlanNode[] {
  return planRows().map((row) =>
    row.id === "norte"
      ? {
          ...row,
          children: row.children?.map((child) => (child.id === "ana" ? { ...child, locked: ["m7"] } : child)),
        }
      : row,
  )
}

export function changedRows(): PlanNode[] {
  return planRows().map((row) =>
    row.id === "norte"
      ? {
          ...row,
          children: row.children?.map((child) =>
            child.id === "ana" ? { ...child, values: { ...child.values, m7: (child.values.m7 ?? 0) + 500 } } : child,
          ),
        }
      : row,
  )
}

export function withNewRow(): PlanNode[] {
  return planRows().map((row) =>
    row.id === "sur"
      ? {
          ...row,
          children: [...(row.children ?? []), { id: "nueva", label: "Nueva", weight: 1, prior: 0, plan: 0, locked: [], values: money(0) }],
        }
      : row,
  )
}

export const filled = { mode: "filled" as const }
export const empty = { mode: "empty" as const }
export const loading = { mode: "loading" as const }
export const error = { mode: "error" as const }

export function gridLabels(locale: SceneLocale): Partial<PlanningGridLabels> {
  const money = (value: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value)
  if (locale === "en") return { money, fresh: "New" }
  return {
    title: "Plan",
    actualToDate: "Real a la fecha",
    forecastLeft: "Pronóstico restante",
    outlook: "Outlook vs plan",
    vsPlan: "Vs plan",
    search: "Buscar",
    save: "Guardar",
    revert: "Revertir",
    undo: "Deshacer",
    redo: "Rehacer",
    heat: "Mapa de calor",
    heatAll: "Toda la vista",
    heatRow: "Por fila",
    heatColumn: "Por columna",
    empty: "No hay nada que planear.",
    loading: "Cargando el plan",
    groupCount: (count) => `${count}`,
    totals: "Total",
    growth: "Crecimiento",
    lock: "Bloquear pronóstico",
    unlock: "Desbloquear pronóstico",
    add: "Agregar línea",
    fresh: "Nueva",
    actions: (label) => `Acciones de ${label}`,
    expand: (label) => `Abrir ${label}`,
    collapse: (label) => `Cerrar ${label}`,
    actual: "Real",
    forecast: "Pronóstico",
    bullet: "Bullet",
    prior: "Año anterior",
    plan: "Plan",
    cell: (label, period, value) => `${label}, ${period}, ${value}`,
    changed: "Cambió",
    money,
  }
}

export const errorCopy = {
  es: "No se guardó el plan. Siguen los cambios.",
  en: "The plan was not saved. The edits are still here.",
}
