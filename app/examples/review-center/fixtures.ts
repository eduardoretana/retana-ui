import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ReviewCenterLabels, ReviewFile, ReviewFilter, ReviewItem, ReviewSpan } from "@/registry/ui/review-center"

export type OrderMeta = { pedido: string }

type Copy = { title: string; type: string; reasoning: string; body: ReviewSpan[]; files?: ReviewFile<OrderMeta>[] }

type ItemSeed = {
  id: string
  agent: string
  risk: ReviewItem["risk"]
  confidence: number
  waiting: string
  late?: boolean
  meta?: OrderMeta
  es: Copy
  en: Copy
}

export type ReviewFixture = {
  items: readonly ItemSeed[]
  reviewed: number
  total: number
  selectedId?: string
  filter?: ReviewFilter
  skippedIds?: readonly string[]
  loading?: boolean
  banner?: { es: string; en: string }
  decideError?: { es: string; en: string }
}

const celaya: ItemSeed = {
  id: "celaya",
  agent: "Bruma",
  risk: "high",
  confidence: 0.62,
  waiting: "28 min",
  late: true,
  meta: { pedido: "PED-990" },
  es: {
    title: "Mandar el correo a Celaya del pedido PED-990",
    type: "Correo",
    reasoning: "El correo no salió y el horno 2 sigue apagado. Lo reenviaría con el anticipo de $18,400.00 MXN.",
    body: [
      { text: "El horno 2 no enciende. " },
      { text: "El anticipo sigue en $18,400.00 MXN", note: "Confirmar que no volvió a $16,200.00." },
      { text: " La entrega a Mariana Ruiz en León pasa al lunes 2 de noviembre." },
    ],
  },
  en: {
    title: "Send the Celaya mail for order PED-990",
    type: "Mail",
    reasoning: "The mail did not go out and kiln 2 is still off. I would resend it with the $18,400.00 MXN deposit.",
    body: [
      { text: "Kiln 2 will not light. " },
      { text: "The deposit stays at $18,400.00 MXN", note: "Check that it did not slip back to $16,200.00." },
      { text: " Delivery to Mariana Ruiz in León moves to Monday 2 November." },
    ],
  },
}

const entrega: ItemSeed = {
  id: "entrega",
  agent: "Horno",
  risk: "medium",
  confidence: 0.84,
  waiting: "18 min",
  meta: { pedido: "PED-1048" },
  es: {
    title: "Mover la entrega del viernes 30 de octubre",
    type: "Pedido",
    reasoning: "Mariana Ruiz espera la pieza en León. El viernes ya no alcanza.",
    body: [{ text: "La entrega de PED-1048 pasa del viernes 30 de octubre al lunes 2 de noviembre." }],
  },
  en: {
    title: "Move the Friday 30 October delivery",
    type: "Order",
    reasoning: "Mariana Ruiz expects the piece in León. Friday is no longer possible.",
    body: [{ text: "Delivery of PED-1048 moves from Friday 30 October to Monday 2 November." }],
  },
}

const cobalto: ItemSeed = {
  id: "cobalto",
  agent: "Caja",
  risk: "low",
  confidence: 0.91,
  waiting: "6 min",
  es: {
    title: "Anotar que el cobalto sale distinto en el horno 1",
    type: "Nota",
    reasoning: "La bitácora todavía dice que el esmalte sale igual.",
    body: [{ text: "El esmalte cobalto no se quema en el horno 1: sale distinto." }],
    files: [
      {
        path: "bitacora/horno-2.txt",
        added: 1,
        removed: 1,
        lines: [
          { kind: "same", number: 4, text: "Horno 2: no enciende." },
          { kind: "remove", number: 5, text: "Cobalto: igual que siempre." },
          { kind: "add", number: 5, text: "Cobalto: sale distinto en el horno 1." },
        ],
      },
    ],
  },
  en: {
    title: "Note that cobalt comes out different in kiln 1",
    type: "Note",
    reasoning: "The log still says the glaze comes out the same.",
    body: [{ text: "The cobalt glaze is not fired in kiln 1: it comes out different." }],
    files: [
      {
        path: "bitacora/horno-2.txt",
        added: 1,
        removed: 1,
        lines: [
          { kind: "same", number: 4, text: "Kiln 2: it will not light." },
          { kind: "remove", number: 5, text: "Cobalt: the same as always." },
          { kind: "add", number: 5, text: "Cobalt: it comes out different in kiln 1." },
        ],
      },
    ],
  },
}

const queue = [entrega, cobalto, celaya]

export const filled: ReviewFixture = { items: queue, reviewed: 2, total: 5, selectedId: "celaya" }

export const empty: ReviewFixture = { items: [], reviewed: 0, total: 0 }

export const loading: ReviewFixture = { ...filled, loading: true }

export const error: ReviewFixture = {
  ...filled,
  banner: {
    es: "No se aprobó el correo. Sigue en la fila.",
    en: "The mail was not approved. It is still in the queue.",
  },
  decideError: {
    es: "No se aprobó el correo. Sigue en la fila.",
    en: "The mail was not approved. It is still in the queue.",
  },
}

export const files: ReviewFixture = { ...filled, selectedId: "cobalto" }

export const unsure: ReviewFixture = { ...filled, filter: "unsure" }

export const skipped: ReviewFixture = { ...filled, skippedIds: ["cobalto"], selectedId: "entrega" }

export function reviewLabels(locale: SceneLocale): Partial<ReviewCenterLabels> {
  if (locale === "en") return {}
  return {
    title: "Revisión",
    progress: (done, total) => `${done} de ${total} revisados`,
    filter: "Fila",
    filters: { all: "Todos", high: "Riesgo alto", unsure: "En duda" },
    risk: { high: "Riesgo alto", medium: "Riesgo medio", low: "Riesgo bajo" },
    confidence: (percent) => `${percent}% de certeza`,
    unsure: "En duda",
    row: (title, type, risk, percent, waiting) => `${title}, ${type}, ${risk}, ${percent}% de certeza, espera ${waiting}`,
    why: "Por qué",
    flags: (count) => (count === 1 ? "1 tramo marcado" : `${count} tramos marcados`),
    files: "Archivos",
    approve: "Aprobar",
    edit: "Editar",
    save: "Guardar y aprobar",
    cancel: "Cancelar",
    reject: "Rechazar",
    skip: "Saltar",
    undo: "Deshacer",
    undoOffer: (title) => `Último paso, “${title}”`,
    reasons: "Por qué no",
    skipped: "Saltado",
    empty: "No hay nada esperando revisión.",
    emptyFilter: "Nada de esta fila coincide.",
    loading: "Cargando la fila",
    approved: (title) => `Aprobaste “${title}”`,
    rejected: (title) => `Rechazaste “${title}”`,
    skippedNamed: (title) => `Saltaste “${title}”`,
    undone: (title) => `Volviste “${title}”`,
    draft: "Texto editado",
  }
}

export const reviewReasons = {
  es: ["El anticipo no cuadra", "El tono no es del taller", "Todavía no sale", "Otra razón"],
  en: ["The deposit does not match", "The tone is off", "It should not go out yet", "Another reason"],
}

export function itemsFrom(fixture: ReviewFixture, locale: SceneLocale, skipped: Readonly<Record<string, true>> = {}): ReviewItem<OrderMeta>[] {
  return fixture.items.map((seed) => ({
    id: seed.id,
    title: seed[locale].title,
    agent: seed.agent,
    type: seed[locale].type,
    risk: seed.risk,
    confidence: seed.confidence,
    waiting: seed.waiting,
    late: seed.late,
    skipped: skipped[seed.id] === true,
    reasoning: seed[locale].reasoning,
    body: seed[locale].body,
    files: seed[locale].files,
    meta: seed.meta,
  }))
}
