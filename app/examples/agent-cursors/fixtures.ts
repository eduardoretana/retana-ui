import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentCursorsLabels, CursorMark, CursorParagraph, CursorSuggestion } from "@/registry/ui/agent-cursors"

export type OrderMeta = { pedido: string }

export type CursorFixture = {
  paragraphs: readonly CursorParagraph[]
  cursors: readonly (Omit<CursorMark<OrderMeta>, "name" | "note"> & { es: { name: string; note?: string }; en: { name: string; note?: string } })[]
  suggestions: readonly { id: string; cursorId: string; accepted?: boolean; es: string; en: string }[]
  loading?: boolean
  banner?: { es: string; en: string }
}

const paragraphs: CursorParagraph[] = [
  { id: "pedido", text: "Cotización del esmalte cobalto. Pedido PED-1048 para Cerámica del Bajío." },
  { id: "precio", text: "Anticipo de $18,400.00 MXN, antes de las 14:00." },
  { id: "foto", text: "Foto del horno 2 para la nota del viernes 30 de octubre." },
  { id: "leon", text: "Entrega a Mariana Ruiz en León, por la tarde." },
]

const bruma = {
  id: "bruma",
  x: 62,
  y: 18,
  meta: { pedido: "PED-1048" } as OrderMeta,
  es: { name: "Bruma", note: "En el precio" },
  en: { name: "Bruma", note: "On the price" },
}

const horno = {
  id: "horno",
  x: 28,
  y: 58,
  es: { name: "Horno", note: "En la foto" },
  en: { name: "Horno", note: "On the photo" },
}

const caja = {
  id: "caja",
  x: 70,
  y: 78,
  away: true,
  es: { name: "Caja", note: "Salió a cobrar" },
  en: { name: "Caja", note: "Out collecting" },
}

const suggestion = {
  id: "precio",
  cursorId: "bruma",
  es: "Dejar el anticipo en $18,400.00 MXN, no en $16,200.00.",
  en: "Leave the deposit at $18,400.00 MXN, not $16,200.00.",
}

export const filled: CursorFixture = {
  paragraphs,
  cursors: [bruma, horno, caja],
  suggestions: [suggestion],
}

export const empty: CursorFixture = { paragraphs: [], cursors: [], suggestions: [] }

export const loading: CursorFixture = { ...filled, loading: true }

export const error: CursorFixture = {
  paragraphs: [],
  cursors: [],
  suggestions: [],
  banner: {
    es: "No pudimos abrir la nota del pedido. Intenta de nuevo en un momento.",
    en: "The order note could not be opened. Try again in a moment.",
  },
}

export const accepted: CursorFixture = {
  paragraphs,
  cursors: [bruma, horno],
  suggestions: [{ ...suggestion, accepted: true }],
}

export const away: CursorFixture = {
  paragraphs,
  cursors: [
    { ...bruma, away: true },
    { ...horno, away: true },
    caja,
  ],
  suggestions: [],
}

export function cursorLabels(locale: SceneLocale): Partial<AgentCursorsLabels> {
  if (locale === "en") return {}
  return {
    title: "Sobre la nota",
    present: (count) => (count === 1 ? "1 aquí" : `${count} aquí`),
    away: "Ausente",
    here: "Aquí",
    pointer: (name, note) => (note ? `${name}, ${note}` : name),
    suggestions: "Sugerencias",
    accept: "Aceptar",
    acceptNamed: (name) => `Aceptar la sugerencia de ${name}`,
    accepted: "Aceptada",
    acceptedLive: (text) => `Aceptaste “${text}”`,
    emptyPointers: "Nadie más está en esta nota.",
    emptyNote: "La nota está en blanco.",
    loading: "Cargando la nota",
  }
}

export function cursorsFrom(fixture: CursorFixture, locale: SceneLocale): CursorMark<OrderMeta>[] {
  return fixture.cursors.map((cursor) => ({
    id: cursor.id,
    name: cursor[locale].name,
    x: cursor.x,
    y: cursor.y,
    note: cursor[locale].note,
    away: cursor.away,
    meta: cursor.meta,
  }))
}

export function suggestionsFrom(fixture: CursorFixture, locale: SceneLocale, acceptedIds: Record<string, boolean> = {}): CursorSuggestion[] {
  return fixture.suggestions.map((suggestion) => ({
    id: suggestion.id,
    cursorId: suggestion.cursorId,
    text: suggestion[locale],
    accepted: acceptedIds[suggestion.id] ?? suggestion.accepted,
  }))
}
