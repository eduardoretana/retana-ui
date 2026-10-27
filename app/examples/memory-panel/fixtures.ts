import type { SceneLocale } from "@/app/catalog/scene-types"
import type { MemoryEntry, MemoryPanelLabels } from "@/registry/ui/memory-panel"

export type OrderMeta = { pedido: string }

export type MemorySeed = {
  id: string
  paused?: boolean
  meta?: OrderMeta
  es: { text: string; category: string; source: string; date: string }
  en: { text: string; category: string; source: string; date: string }
}

export type MemoryFixture = {
  seeds: readonly MemorySeed[]
  categories: { es: string; en: string }[]
  enabled?: boolean
  forgottenId?: string
  loading?: boolean
  banner?: { es: string; en: string }
  forgetError?: { es: string; en: string }
}

const cliente: MemorySeed = {
  id: "leon",
  meta: { pedido: "PED-1048" },
  es: { text: "Mariana Ruiz está en León y espera la pieza el viernes 30 de octubre.", category: "Clientes", source: "De la nota", date: "27 oct" },
  en: { text: "Mariana Ruiz is in León and expects the piece on Friday 30 October.", category: "Clients", source: "From the note", date: "27 Oct" },
}

const anticipo: MemorySeed = {
  id: "anticipo",
  meta: { pedido: "PED-1048" },
  es: { text: "El anticipo del pedido PED-1048 quedó en $18,400.00 MXN.", category: "Pedidos", source: "De la cotización", date: "27 oct" },
  en: { text: "The deposit for order PED-1048 stayed at $18,400.00 MXN.", category: "Orders", source: "From the quote", date: "27 Oct" },
}

const celaya: MemorySeed = {
  id: "celaya",
  meta: { pedido: "PED-990" },
  es: { text: "El correo a Celaya del pedido PED-990 no salió.", category: "Pedidos", source: "De la bandeja", date: "27 oct" },
  en: { text: "Mail to Celaya for order PED-990 did not go out.", category: "Orders", source: "From the tray", date: "27 Oct" },
}

const horno: MemorySeed = {
  id: "horno",
  es: { text: "El horno 2 no enciende y el esmalte cobalto se queda ahí.", category: "Horno", source: "De la bitácora", date: "27 oct" },
  en: { text: "Kiln 2 will not light and the cobalt glaze stays there.", category: "Kiln", source: "From the log", date: "27 Oct" },
}

const categories = [
  { es: "Clientes", en: "Clients" },
  { es: "Pedidos", en: "Orders" },
  { es: "Horno", en: "Kiln" },
]

export const filled: MemoryFixture = { seeds: [cliente, anticipo, celaya, horno], categories, enabled: true }

export const empty: MemoryFixture = { seeds: [], categories, enabled: true }

export const loading: MemoryFixture = { ...filled, loading: true }

export const error: MemoryFixture = {
  ...filled,
  banner: {
    es: "No se olvidó el recuerdo. Sigue en la lista.",
    en: "The memory was not forgotten. It is still on the list.",
  },
  forgetError: {
    es: "No se olvidó el recuerdo. Sigue en la lista.",
    en: "The memory was not forgotten. It is still on the list.",
  },
}

export const paused: MemoryFixture = {
  ...filled,
  seeds: filled.seeds.map((seed) => (seed.id === "celaya" ? { ...seed, paused: true } : seed)),
}

export const off: MemoryFixture = { ...filled, enabled: false }

export const forgotten: MemoryFixture = { ...filled, forgottenId: "celaya" }

export function memoryLabels(locale: SceneLocale): Partial<MemoryPanelLabels> {
  if (locale === "en") return {}
  return {
    title: "Memoria",
    count: (count) => (count === 1 ? "1 recuerdo" : `${count} recuerdos`),
    use: "Usar la memoria",
    off: "Los chats nuevos no van a usar estos recuerdos. Aquí no se borra nada.",
    all: "Todos",
    paused: "En pausa",
    pause: "Pausar",
    pauseNamed: (text) => `Pausar “${text}”`,
    resume: "Reanudar",
    resumeNamed: (text) => `Reanudar “${text}”`,
    edit: "Editar",
    editNamed: (text) => `Editar “${text}”`,
    save: "Guardar",
    cancel: "Cancelar",
    forget: "Olvidar",
    forgetNamed: (text) => `Olvidar “${text}”`,
    forgot: (text) => `Olvidaste “${text}”`,
    restore: "Deshacer",
    add: "Nuevo recuerdo",
    addNamed: "Texto del recuerdo",
    added: (text) => `Agregaste “${text}”`,
    empty: "Todavía no hay recuerdos.",
    emptyGroup: "En este grupo no hay recuerdos.",
    loading: "Cargando los recuerdos",
    saved: (text) => `Guardaste “${text}”`,
  }
}

export function memoriesFrom(
  fixture: MemoryFixture,
  locale: SceneLocale,
  state: { forgotten?: string | null; paused?: Readonly<Record<string, boolean>>; texts?: Readonly<Record<string, string>> } = {},
): MemoryEntry<OrderMeta>[] {
  return fixture.seeds
    .filter((seed) => seed.id !== state.forgotten)
    .map((seed) => ({
      id: seed.id,
      text: state.texts?.[seed.id] ?? seed[locale].text,
      category: seed[locale].category,
      source: seed[locale].source,
      date: seed[locale].date,
      paused: state.paused?.[seed.id] ?? seed.paused,
      meta: seed.meta,
    }))
}

export function undoFrom(fixture: MemoryFixture, locale: SceneLocale, forgottenId?: string | null) {
  const id = forgottenId ?? fixture.forgottenId
  const seed = fixture.seeds.find((item) => item.id === id)
  return seed ? { text: seed[locale].text } : null
}
