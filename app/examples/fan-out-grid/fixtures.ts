import type { SceneLocale } from "@/app/catalog/scene-types"
import type { FanCell, FanOutGridLabels, FanStatus } from "@/registry/ui/fan-out-grid"

export type OrderMeta = { pedido: string }

export type FanSeed = {
  id: string
  status: FanStatus
  worker?: string
  meta?: OrderMeta
  es: { title: string; detail?: string }
  en: { title: string; detail?: string }
}

export type FanFixture = {
  job: { es: string; en: string }
  seeds: readonly FanSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
  retryError?: { es: string; en: string }
}

function piece(id: string, status: FanStatus, worker: string | undefined, es: string, en: string, detailEs?: string, detailEn?: string): FanSeed {
  return {
    id,
    status,
    worker,
    meta: { pedido: "PED-1051" },
    es: { title: es, detail: detailEs },
    en: { title: en, detail: detailEn },
  }
}

const samples: FanSeed[] = [
  piece("azul", "done", "Horno", "Azul profundo", "Deep blue", "Quedó en la caja de León.", "Packed for León."),
  piece("medio", "done", "Horno", "Cobalto medio", "Mid cobalt"),
  piece("borde", "done", "Horno", "Borde claro", "Light rim"),
  piece("leon", "running", "Horno", "Muestra de León", "León sample", "Mariana Ruiz la espera hoy.", "Mariana Ruiz expects it today."),
  piece("reposicion", "retrying", "Caja", "Reposición", "Replacement", "La primera salió rajada.", "The first one cracked."),
  piece("tapa", "failed", "Caja", "Tapa del empaque", "Pack lid", "No cerró.", "It did not close."),
  piece("envio", "waiting", undefined, "Caja de envío", "Shipping box"),
  piece("nota", "waiting", undefined, "Nota de muestras", "Sample note"),
]

export const filled: FanFixture = {
  job: {
    es: "Ocho muestras del esmalte cobalto para León. Pedido PED-1051.",
    en: "Eight cobalt glaze samples for León. Order PED-1051.",
  },
  seeds: samples,
}

export const empty: FanFixture = { job: { es: "", en: "" }, seeds: [] }

export const loading: FanFixture = { ...filled, loading: true }

export const error: FanFixture = {
  job: { es: "", en: "" },
  seeds: [],
  banner: {
    es: "No pudimos leer las muestras. Intenta de nuevo en un momento.",
    en: "The samples could not be read. Try again in a moment.",
  },
}

export const retrying: FanFixture = {
  job: filled.job,
  seeds: [samples[5]!, samples[4]!],
  retryError: {
    es: "La tapa volvió a fallar. Sigue en la rejilla.",
    en: "The lid failed again. It is still on the grid.",
  },
}

export const clear: FanFixture = {
  job: filled.job,
  seeds: samples.map((seed) => ({ ...seed, status: "done" as const, worker: "Horno" })),
}

export function fanLabels(locale: SceneLocale): Partial<FanOutGridLabels> {
  if (locale === "en") return {}
  return {
    title: "Abanico",
    done: (done, total) => `${done} de ${total} listas`,
    status: { waiting: "En espera", running: "En curso", retrying: "Reintentando", done: "Lista", failed: "Falló" },
    worker: (name) => `Con ${name}`,
    open: (title) => `Abrir “${title}”`,
    retry: "Reintentar",
    retryNamed: (title) => `Reintentar “${title}”`,
    empty: "Este trabajo todavía no tiene piezas.",
    loading: "Cargando la rejilla",
    retried: (title) => `Reintentando “${title}”`,
  }
}

export function cellsFrom(seeds: readonly FanSeed[], locale: SceneLocale, status: Record<string, FanStatus> = {}): FanCell<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: seed[locale].title,
    detail: seed[locale].detail,
    worker: seed.worker,
    status: status[seed.id] ?? seed.status,
    meta: seed.meta,
  }))
}
