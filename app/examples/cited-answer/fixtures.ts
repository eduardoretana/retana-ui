import type { SceneLocale } from "@/app/catalog/scene-types"
import type { CitedAnswerLabels, CitedSegment, CitedSource } from "@/registry/ui/cited-answer"

export type OrderMeta = { pedido: string }

export type SourceSeed = {
  id: string
  meta?: OrderMeta
  es: { title: string; site: string; quote?: string; date?: string }
  en: { title: string; site: string; quote?: string; date?: string }
}

export type SegmentSeed = {
  id: string
  cite?: readonly string[]
  paragraph?: boolean
  es: string
  en: string
}

export type AnswerFixture = {
  segments: readonly SegmentSeed[]
  sources: readonly SourceSeed[]
  pagesRead?: number
  openId?: string | null
  loading?: boolean
  banner?: { es: string; en: string }
}

const cotizacion: SourceSeed = {
  id: "cotizacion",
  meta: { pedido: "PED-1048" },
  es: { title: "Cotización PED-1048", site: "Expediente del taller", quote: "El anticipo queda en $18,400.00 MXN, no en $16,200.00.", date: "27 oct 2026" },
  en: { title: "Quote PED-1048", site: "Workshop file", quote: "The deposit stays at $18,400.00 MXN, not $16,200.00.", date: "27 Oct 2026" },
}

const nota: SourceSeed = {
  id: "nota",
  es: { title: "Nota del viernes", site: "Libreta de Bruma", quote: "Viernes 30 de octubre, Mariana Ruiz en León.", date: "27 oct 2026" },
  en: { title: "Friday note", site: "Bruma's notebook", quote: "Friday 30 October, Mariana Ruiz in León.", date: "27 Oct 2026" },
}

const horno: SourceSeed = {
  id: "horno",
  es: { title: "Bitácora del horno 2", site: "Taller", quote: "El horno 2 no enciende. El cobalto sale distinto en el horno 1.", date: "27 oct 2026" },
  en: { title: "Kiln 2 log", site: "Workshop", quote: "Kiln 2 will not light. Cobalt comes out different in kiln 1.", date: "27 Oct 2026" },
}

const segments: SegmentSeed[] = [
  { id: "precio", cite: ["cotizacion"], es: "El anticipo del pedido PED-1048 queda en $18,400.00 MXN, antes de las 14:00.", en: "The deposit for order PED-1048 stays at $18,400.00 MXN, before 14:00." },
  {
    id: "entrega",
    cite: ["nota", "horno"],
    es: "La entrega a Mariana Ruiz en León se mueve al lunes 2 de noviembre porque el horno 2 no enciende.",
    en: "Delivery to Mariana Ruiz in León moves to Monday 2 November because kiln 2 will not light.",
  },
  {
    id: "horno1",
    paragraph: true,
    cite: ["horno"],
    es: "El esmalte cobalto no se quema en el horno 1: sale distinto.",
    en: "The cobalt glaze is not fired in kiln 1: it comes out different.",
  },
]

export const filled: AnswerFixture = { segments, sources: [cotizacion, nota, horno], pagesRead: 3 }

export const empty: AnswerFixture = { segments: [], sources: [] }

export const loading: AnswerFixture = { ...filled, loading: true }

export const error: AnswerFixture = {
  segments: [],
  sources: [],
  banner: {
    es: "No pudimos armar la respuesta. Intenta de nuevo en un momento.",
    en: "The answer could not be assembled. Try again in a moment.",
  },
}

export const open: AnswerFixture = { ...filled, openId: "cotizacion" }

export const skipped: AnswerFixture = {
  ...filled,
  segments: segments.map((segment) => (segment.id === "precio" ? { ...segment, cite: ["fantasma", "cotizacion"] } : segment)),
}

export function answerLabels(locale: SceneLocale): Partial<CitedAnswerLabels> {
  if (locale === "en") return {}
  return {
    title: "Respuesta",
    sources: (count) => (count === 1 ? "1 fuente" : `${count} fuentes`),
    pages: (count) => (count === 1 ? "1 página leída" : `${count} páginas leídas`),
    marker: (number, title) => `Fuente ${number}: ${title}`,
    chip: (number, title) => `Fuente ${number}: ${title}`,
    quote: "Pasaje usado",
    noQuote: "Esta fuente no trae pasaje.",
    open: "Abrir la fuente",
    empty: "Todavía no hay una respuesta que revisar.",
    loading: "Cargando la respuesta",
    opened: (title) => `Abriste “${title}”`,
  }
}

export function segmentsFrom(seeds: readonly SegmentSeed[], locale: SceneLocale): CitedSegment[] {
  return seeds.map((seed) => ({ id: seed.id, text: seed[locale], cite: seed.cite, paragraph: seed.paragraph }))
}

export function sourcesFrom(seeds: readonly SourceSeed[], locale: SceneLocale): CitedSource<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: seed[locale].title,
    site: seed[locale].site,
    quote: seed[locale].quote,
    date: seed[locale].date,
    meta: seed.meta,
  }))
}
