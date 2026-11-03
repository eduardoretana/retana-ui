import type { Condition, GuardLocale, TerminalDecision } from "./types"

export type FieldKind = "string" | "number" | "boolean" | "list" | "enum"

export type FieldOption = {
  value: string
  es: string
  en: string
}

export type GuardField = {
  path: string
  es: string
  en: string
  kind: FieldKind
  options?: readonly FieldOption[]
}

/** Display catalog. `path` is the value the engine reads. Labels never replace it. */
export const GUARD_FIELDS: readonly GuardField[] = [
  {
    path: "offer.kind",
    es: "Tipo de oferta",
    en: "Offer type",
    kind: "enum",
    options: [
      { value: "none", es: "Ninguna", en: "None" },
      { value: "amount", es: "Monto", en: "Amount" },
      { value: "rate", es: "Tasa", en: "Rate" },
      { value: "approval", es: "Aprobación", en: "Approval" },
    ],
  },
  { path: "offer.validated", es: "Oferta validada", en: "Validated offer", kind: "boolean" },
  { path: "offer.label", es: "Etiqueta de la oferta", en: "Offer label", kind: "string" },
  { path: "topic", es: "Tema", en: "Topic", kind: "string" },
  { path: "text", es: "Texto del mensaje", en: "Message text", kind: "string" },
  {
    path: "direction",
    es: "Dirección",
    en: "Direction",
    kind: "enum",
    options: [
      { value: "outbound", es: "Saliente", en: "Outbound" },
      { value: "inbound", es: "Entrante", en: "Inbound" },
    ],
  },
  { path: "contactInitiated", es: "El número inició la conversación", en: "The number started the chat", kind: "boolean" },
  { path: "destinationPhone", es: "Número destino", en: "Destination number", kind: "string" },
  { path: "requestedSecrets", es: "Datos sensibles pedidos", en: "Requested secrets", kind: "list" },
  {
    path: "stage",
    es: "Etapa",
    en: "Stage",
    kind: "enum",
    options: [
      { value: "contacto", es: "Contacto", en: "Contact" },
      { value: "contrato", es: "Contrato", en: "Contract" },
      { value: "firma", es: "Firma", en: "Signature" },
      { value: "dispersion", es: "Dispersión", en: "Disbursement" },
    ],
  },
  {
    path: "documentType",
    es: "Tipo de documento",
    en: "Document type",
    kind: "enum",
    options: [
      { value: "contrato", es: "Contrato", en: "Contract" },
      { value: "pagare", es: "Pagaré", en: "Promissory note" },
      { value: "identificacion", es: "Identificación", en: "Identification" },
    ],
  },
  { path: "discountRequested", es: "Pide descuento", en: "Discount requested", kind: "boolean" },
  { path: "discountAmount", es: "Monto del descuento", en: "Discount amount", kind: "number" },
  { path: "amount", es: "Monto", en: "Amount", kind: "number" },
  {
    path: "intent",
    es: "Intención",
    en: "Intent",
    kind: "enum",
    options: [
      { value: "none", es: "Ninguna", en: "None" },
      { value: "complaint", es: "Queja", en: "Complaint" },
      { value: "legal", es: "Legal", en: "Legal" },
      { value: "human", es: "Quiere una persona", en: "Wants a person" },
    ],
  },
  { path: "mentions", es: "Menciones", en: "Mentions", kind: "list" },
  { path: "requestedHuman", es: "Pidió una persona", en: "Asked for a person", kind: "boolean" },
  { path: "stuckCount", es: "Mensajes atorados", en: "Stuck messages", kind: "number" },
  { path: "checksGreen", es: "Checks en verde", en: "Checks are green", kind: "boolean" },
  { path: "repository", es: "Repositorio", en: "Repository", kind: "string" },
  { path: "pullRequest", es: "Pull request", en: "Pull request", kind: "number" },
]

export const ACTION_KINDS: readonly { kind: string; es: string; en: string }[] = [
  { kind: "whatsapp.before_send", es: "Antes de enviar", en: "Before sending" },
  { kind: "whatsapp.before_stage_change", es: "Antes de cambiar de etapa", en: "Before a stage change" },
  { kind: "whatsapp.before_document_send", es: "Antes de enviar un documento", en: "Before sending a document" },
  { kind: "whatsapp.before_discount", es: "Antes de un descuento", en: "Before a discount" },
  { kind: "whatsapp.inbound_message", es: "Mensaje recibido", en: "Inbound message" },
  { kind: "git.merge", es: "Merge de git", en: "Git merge" },
  { kind: "*", es: "Cualquier acción", en: "Any action" },
]

const KIND_FIELDS: Record<string, readonly string[]> = {
  "whatsapp.before_send": ["text", "topic", "offer.kind", "offer.validated", "requestedSecrets", "direction", "contactInitiated", "destinationPhone"],
  "whatsapp.before_stage_change": ["stage"],
  "whatsapp.before_document_send": ["documentType"],
  "whatsapp.before_discount": ["discountRequested", "discountAmount"],
  "whatsapp.inbound_message": ["text", "intent", "mentions", "requestedHuman", "stuckCount"],
  "git.merge": ["checksGreen", "repository", "pullRequest"],
}

export function guardField(path: string): GuardField | undefined {
  return GUARD_FIELDS.find((field) => field.path === path)
}

export function fieldLabel(path: string, locale: GuardLocale): string {
  return guardField(path)?.[locale] ?? path
}

export function optionLabel(path: string, value: string, locale: GuardLocale): string {
  const option = guardField(path)?.options?.find((item) => item.value === value)
  return option?.[locale] ?? value
}

export function fieldsForKind(kind: string): readonly GuardField[] {
  const paths = KIND_FIELDS[kind] ?? []
  return paths.map((path) => guardField(path)).filter((field): field is GuardField => field !== undefined)
}

export function kindLabel(kind: string, locale: GuardLocale): string {
  return ACTION_KINDS.find((item) => item.kind === kind)?.[locale] ?? kind
}

export const OP_LABELS: Record<Condition["op"], { es: string; en: string }> = {
  and: { es: "Todas se cumplen", en: "All match" },
  or: { es: "Alguna se cumple", en: "Any match" },
  not: { es: "No se cumple", en: "Does not match" },
  eq: { es: "es igual a", en: "is equal to" },
  neq: { es: "no es", en: "is not" },
  gt: { es: "es mayor que", en: "is greater than" },
  gte: { es: "es al menos", en: "is at least" },
  lt: { es: "es menor que", en: "is less than" },
  lte: { es: "es como máximo", en: "is at most" },
  in: { es: "está en", en: "is one of" },
  exists: { es: "existe", en: "exists" },
  missing: { es: "falta", en: "is missing" },
  includes: { es: "incluye", en: "includes" },
  text_includes: { es: "el texto incluye", en: "the text includes" },
}

export function opLabel(op: Condition["op"], locale: GuardLocale): string {
  return OP_LABELS[op][locale]
}

export const TRACE_STATUS_LABELS = {
  fired: { es: "Se activó", en: "Fired" },
  matched_false: { es: "No aplicó", en: "Did not apply" },
  skipped: { es: "Omitida", en: "Skipped" },
  missing: { es: "Faltó un dato", en: "Missing fact" },
} as const

export function traceStatusLabel(status: keyof typeof TRACE_STATUS_LABELS, locale: GuardLocale): string {
  return TRACE_STATUS_LABELS[status][locale]
}

export function decisionWord(decision: TerminalDecision | "log", locale: GuardLocale): string {
  const words = {
    allow: { es: "Permitir", en: "Allow" },
    require_approval: { es: "Requiere aprobación", en: "Needs approval" },
    block: { es: "Bloquear", en: "Block" },
    handoff_to_human: { es: "Pasar a una persona", en: "Hand off to a person" },
    log: { es: "Anotar", en: "Log" },
  } as const
  return words[decision][locale]
}
