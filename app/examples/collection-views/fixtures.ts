import type { SceneLocale } from "@/app/catalog/scene-types"
import type { CollectionGroup, CollectionItem, CollectionView, CollectionViewsLabels } from "@/registry/ui/collection-views"
import { collectionViewsLabelsEn } from "@/registry/ui/collection-views"

export type ItemSeed = {
  id: string
  groupId: string
  people?: readonly string[]
  start?: string
  end?: string
  es: { title: string; detail?: string }
  en: { title: string; detail?: string }
}

export type ViewsFixture = {
  view: CollectionView
  items: readonly ItemSeed[]
  query?: string
  loading?: boolean
  error?: { es: string; en: string }
}

const people = {
  nuria: "Nuria Solís",
  ivan: "Iván Paredes",
  telma: "Telma Cruz",
  omar: "Omar Beltrán",
} as const

export const groups: readonly CollectionGroup[] = [
  { id: "banco", label: "En el banco" },
  { id: "horno", label: "En el horno" },
  { id: "entrega", label: "Por entregar" },
]

export const groupsEn: readonly CollectionGroup[] = [
  { id: "banco", label: "On the bench" },
  { id: "horno", label: "In the kiln" },
  { id: "entrega", label: "Ready to ship" },
]

const orders: ItemSeed[] = [
  {
    id: "jarron",
    groupId: "banco",
    people: ["nuria", "ivan"],
    start: "2026-10-20",
    end: "2026-10-28",
    es: { title: "Jarrón cobalto", detail: "Pedido de la casa León" },
    en: { title: "Cobalt jar", detail: "Order for Casa León" },
  },
  {
    id: "tazas",
    groupId: "banco",
    people: ["telma"],
    start: "2026-10-27",
    end: "2026-11-02",
    es: { title: "Tazas del viernes", detail: "Doce piezas, esmalte mate" },
    en: { title: "Friday mugs", detail: "Twelve pieces, matte glaze" },
  },
  {
    id: "platon",
    groupId: "horno",
    people: ["omar", "nuria"],
    start: "2026-10-29",
    end: "2026-10-31",
    es: { title: "Platón de esmalte", detail: "Sale del horno el viernes" },
    en: { title: "Glaze platter", detail: "Leaves the kiln on Friday" },
  },
  {
    id: "lamparas",
    groupId: "horno",
    people: ["ivan"],
    start: "2026-11-03",
    end: "2026-11-12",
    es: { title: "Lámparas de pared", detail: "Par para el comedor" },
    en: { title: "Wall lamps", detail: "A pair for the dining room" },
  },
  {
    id: "cafe",
    groupId: "entrega",
    people: ["telma", "omar"],
    start: "2026-10-18",
    end: "2026-10-24",
    es: { title: "Set de café", detail: "Empaque listo" },
    en: { title: "Coffee set", detail: "Packing is ready" },
  },
  {
    id: "cuencos",
    groupId: "entrega",
    people: ["nuria"],
    start: "2026-11-01",
    end: "2026-11-06",
    es: { title: "Cuencos mate", detail: "Seis piezas para Regina" },
    en: { title: "Matte bowls", detail: "Six pieces for Regina" },
  },
]

export const TODAY = "2026-10-30"

export const filled: ViewsFixture = { view: "board", items: orders }

export const empty: ViewsFixture = { view: "board", items: [] }

export const loading: ViewsFixture = { ...filled, loading: true }

export const error: ViewsFixture = {
  ...filled,
  error: {
    es: "No se cargó la colección. Los pedidos siguen en el taller.",
    en: "The collection did not load. The orders are still at the studio.",
  },
}

export const list: ViewsFixture = { ...filled, view: "list" }

export const timeline: ViewsFixture = { ...filled, view: "timeline" }

export const noMatches: ViewsFixture = { ...filled, query: "zzzz" }

const token = "N".repeat(60)

export const crowded: ViewsFixture = {
  view: "board",
  items: [
    ...orders,
    ...Array.from({ length: 8 }, (_, index) => ({
      id: `extra-${index}`,
      groupId: index % 2 === 0 ? "banco" : "horno",
      people: ["nuria", "ivan", "telma", "omar"],
      start: "2026-10-26",
      end: "2026-11-08",
      es: { title: index === 0 ? token : `Pieza extra ${index + 1}`, detail: "Lote de prueba" },
      en: { title: index === 0 ? token : `Extra piece ${index + 1}`, detail: "Test batch" },
    })),
  ],
}

export function viewLabels(locale: SceneLocale): Partial<CollectionViewsLabels> {
  return locale === "en" ? collectionViewsLabelsEn : {}
}

export function groupsFor(locale: SceneLocale) {
  return locale === "en" ? groupsEn : groups
}

export function itemsFor(seeds: readonly ItemSeed[], locale: SceneLocale): CollectionItem[] {
  return seeds.map((seed) => {
    const copy = seed[locale]
    const item: CollectionItem = {
      id: seed.id,
      groupId: seed.groupId,
      title: copy.title,
      people: (seed.people ?? []).map((id) => ({ id, name: people[id as keyof typeof people] ?? id })),
    }
    if (copy.detail) item.detail = copy.detail
    if (seed.start) item.start = seed.start
    if (seed.end) item.end = seed.end
    return item
  })
}
