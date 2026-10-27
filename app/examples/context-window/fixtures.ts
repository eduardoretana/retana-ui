import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ContextWindowLabels, WindowItem, WindowPart } from "@/registry/ui/context-window"

export type OrderMeta = { pedido: string }

export type ItemSeed = {
  id: string
  tokens: number
  es: string
  en: string
}

export type PartSeed = {
  id: string
  tokens?: number
  items?: readonly ItemSeed[]
  locked?: boolean
  compactable?: boolean
  compact?: boolean
  compactTokens?: number
  es: string
  en: string
}

export type WindowFixture = {
  parts: readonly PartSeed[]
  limit: number
  note?: { es: string; en: string }
  loading?: boolean
  banner?: { es: string; en: string }
  removeError?: { es: string; en: string }
}

export const WINDOW_LIMIT = 24_000

const files: ItemSeed[] = [
  { id: "cotizacion", tokens: 4200, es: "Cotización PED-1048", en: "Quote PED-1048" },
  { id: "foto", tokens: 1800, es: "Foto del horno 2", en: "Photo of kiln 2" },
  { id: "celaya", tokens: 900, es: "Nota a Celaya", en: "Note to Celaya" },
]

function part(id: string, es: string, en: string, extra: Omit<PartSeed, "id" | "es" | "en">): PartSeed {
  return { id, es, en, ...extra }
}

const base: PartSeed[] = [
  part("sistema", "Sistema", "System", { tokens: 1800, locked: true }),
  part("herramientas", "Herramientas", "Tools", { tokens: 2400, locked: true }),
  part("archivos", "Archivos", "Files", { items: files }),
  part("charla", "Charla", "Conversation", { tokens: 5000, compactable: true, compactTokens: 1600 }),
  part("memoria", "Memoria", "Memory", { tokens: 900, locked: true }),
]

export const filled: WindowFixture = {
  parts: base,
  limit: WINDOW_LIMIT,
  note: { es: "Ventana del taller", en: "Workshop window" },
}

export const empty: WindowFixture = { parts: [], limit: WINDOW_LIMIT }

export const loading: WindowFixture = { ...filled, loading: true }

export const error: WindowFixture = {
  ...filled,
  banner: {
    es: "No se quitó el archivo. Sigue en la ventana.",
    en: "The file was not removed. It is still in the window.",
  },
  removeError: {
    es: "No se quitó el archivo. Sigue en la ventana.",
    en: "The file was not removed. It is still in the window.",
  },
}

export const tight: WindowFixture = {
  ...filled,
  parts: base.map((seed) => (seed.id === "charla" ? { ...seed, tokens: 9000 } : seed)),
}

export const full: WindowFixture = {
  ...filled,
  parts: base.map((seed) => (seed.id === "charla" ? { ...seed, tokens: 12_000 } : seed)),
}

export const compacted: WindowFixture = {
  ...filled,
  parts: base.map((seed) => (seed.id === "charla" ? { ...seed, tokens: 1600, compact: true } : seed)),
}

export function windowLabels(locale: SceneLocale): Partial<ContextWindowLabels> {
  if (locale === "en") return {}
  return {
    title: "Ventana de contexto",
    summary: (used, limit, percent) => `${used.toLocaleString("es-MX")} de ${limit.toLocaleString("es-MX")} tokens, ${percent}%`,
    tokens: (count) => `${count.toLocaleString("es-MX")} tokens`,
    pressure: { room: "Cabe más", tight: "Se está llenando", full: "La ventana está llena" },
    left: (count) => `Quedan ${count.toLocaleString("es-MX")} tokens`,
    open: (label) => `Abrir “${label}”`,
    remove: "Quitar",
    removeNamed: (label) => `Quitar “${label}”`,
    compact: "Compactar",
    compactNamed: (label) => `Compactar “${label}”`,
    compacted: "Compactada",
    removed: (label) => `Quitaste “${label}”`,
    compacting: (label) => `Compactando “${label}”`,
    empty: "Esta ventana no tiene nada.",
    loading: "Cargando la ventana",
  }
}

export function partsFrom(
  seeds: readonly PartSeed[],
  locale: SceneLocale,
  removed: Readonly<Record<string, true>> = {},
  compact: Readonly<Record<string, true>> = {},
): WindowPart<OrderMeta>[] {
  return seeds.map((seed) => {
    const squeezed = seed.compact || compact[seed.id] === true
    const items: WindowItem<OrderMeta>[] | undefined = seed.items
      ?.filter((item) => !removed[item.id])
      .map((item) => ({
        id: item.id,
        label: item[locale],
        tokens: item.tokens,
        meta: { pedido: item.id === "celaya" ? "PED-990" : "PED-1048" },
      }))
    return {
      id: seed.id,
      label: seed[locale],
      tokens: squeezed ? seed.compactTokens : seed.tokens,
      items,
      locked: seed.locked,
      compactable: seed.compactable,
      compact: squeezed,
    }
  })
}
