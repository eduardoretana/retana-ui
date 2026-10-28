import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ActualStatus, ActualStep, PlanVsActualLabels } from "@/registry/ui/plan-vs-actual"

export type OrderMeta = { pedido: string }

export type ActualSeed = {
  id: string
  status: ActualStatus
  plannedMin: number
  actualMin: number
  meta?: OrderMeta
  es: { title: string; detail?: string }
  en: { title: string; detail?: string }
}

export type ActualFixture = {
  seeds: readonly ActualSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
}

const cotizacion: ActualSeed = {
  id: "cotizacion",
  status: "done",
  plannedMin: 15,
  actualMin: 12,
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización del esmalte cobalto", detail: "Salió antes de lo previsto." },
  en: { title: "Quote for the cobalt glaze", detail: "Finished earlier than planned." },
}

const anticipo: ActualSeed = {
  id: "anticipo",
  status: "running",
  plannedMin: 10,
  actualMin: 16,
  meta: { pedido: "PED-1048" },
  es: { title: "Anticipo a Cerámica del Bajío", detail: "La transferencia de $18,400.00 MXN se alargó." },
  en: { title: "Deposit to Cerámica del Bajío", detail: "The $18,400.00 MXN transfer ran long." },
}

const foto: ActualSeed = {
  id: "foto",
  status: "pending",
  plannedMin: 20,
  actualMin: 0,
  meta: { pedido: "PED-1048" },
  es: { title: "Foto del horno 2", detail: "Todavía no empieza. El horno 2 sigue ocupado." },
  en: { title: "Photo of kiln 2", detail: "Not started. Kiln 2 is still busy." },
}

const nota: ActualSeed = {
  id: "nota",
  status: "pending",
  plannedMin: 15,
  actualMin: 0,
  meta: { pedido: "PED-1033" },
  es: { title: "Nota para Mariana Ruiz", detail: "León, viernes 30 de octubre por la tarde." },
  en: { title: "Note for Mariana Ruiz", detail: "León, Friday 30 October in the afternoon." },
}

export const filled: ActualFixture = { seeds: [cotizacion, anticipo, foto, nota] }

export const empty: ActualFixture = { seeds: [] }

export const loading: ActualFixture = { ...filled, loading: true }

export const error: ActualFixture = {
  seeds: [],
  banner: {
    es: "No pudimos comparar el plan con lo que pasó. Intenta de nuevo en un momento.",
    en: "The plan could not be compared with what happened. Try again in a moment.",
  },
}

export const ahead: ActualFixture = {
  seeds: [
    { ...cotizacion, actualMin: 10 },
    { ...anticipo, status: "done", actualMin: 8, es: { ...anticipo.es, detail: "La transferencia salió de una vez." }, en: { ...anticipo.en, detail: "The transfer went out in one pass." } },
    { ...foto, status: "done", actualMin: 14, es: { ...foto.es, detail: "La foto quedó a la primera." }, en: { ...foto.en, detail: "The photo landed on the first try." } },
    { ...nota, status: "done", actualMin: 11 },
  ],
}

export const stuck: ActualFixture = {
  seeds: [
    cotizacion,
    { ...anticipo, actualMin: 28, es: { ...anticipo.es, detail: "El banco detuvo la SPEI y hubo que rehacerla." }, en: { ...anticipo.en, detail: "The bank held the SPEI and it had to be redone." } },
    foto,
    nota,
  ],
}

export function actualLabels(locale: SceneLocale): Partial<PlanVsActualLabels> {
  if (locale === "en") return {}
  return {
    title: "Plan y lo que pasó",
    planned: (minutes) => `Plan ${minutes} min`,
    expected: (minutes) => `Cierra en ${minutes} min`,
    slip: (minutes) => `${minutes} min de más`,
    ahead: (minutes) => `${minutes} min de ventaja`,
    onTime: "En el plan",
    row: (title, planned, spent) => `${title}, plan ${planned} min, usados ${spent} min`,
    ghost: "Planeado",
    spent: "Usado",
    status: { pending: "Sin empezar", running: "En curso", done: "Listo" },
    overrun: "Pasó el plan",
    empty: "Todavía no hay un plan que comparar.",
    loading: "Cargando la comparación",
    minutes: (minutes) => `${minutes} min`,
  }
}

export function stepsFrom(seeds: readonly ActualSeed[], locale: SceneLocale): ActualStep<OrderMeta>[] {
  return seeds.map((seed) => {
    const copy = seed[locale]
    return {
      id: seed.id,
      title: copy.title,
      detail: copy.detail,
      plannedMin: seed.plannedMin,
      actualMin: seed.actualMin,
      status: seed.status,
      meta: seed.meta,
    }
  })
}
