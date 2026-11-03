import type { Condition, GuardAction, GuardRule, RulesetDraft } from "./types"
import { DEFAULT_APPROVAL_TTL_MS, REASON } from "./types"

export const WHATSAPP_KINDS = {
  send: "whatsapp.before_send",
  stage: "whatsapp.before_stage_change",
  document: "whatsapp.before_document_send",
  discount: "whatsapp.before_discount",
  inbound: "whatsapp.inbound_message",
} as const

const KEY_STAGES = ["contrato", "firma", "dispersion"]
const DOCUMENT_TYPES = ["contrato", "pagare", "identificacion"]

function rule(input: Omit<GuardRule, "enabled"> & { enabled?: boolean }): GuardRule {
  return { enabled: true, ...input }
}

/**
 * Fictional Mejoravit WhatsApp preset. Threshold N is copied into the stuck rule.
 * Text matchers are a secondary signal. Structured fields decide.
 */
export function mejoravitWhatsappRuleset(input: {
  accountId: string
  id?: string
  name?: string
  stuckMessageThreshold?: number
  approvalTtlMs?: number
}): RulesetDraft {
  const stuck = input.stuckMessageThreshold ?? 4
  const ttl = input.approvalTtlMs ?? DEFAULT_APPROVAL_TTL_MS
  const send = WHATSAPP_KINDS.send
  const offer: Condition = {
    op: "and",
    conditions: [
      {
        op: "or",
        conditions: [
          { op: "eq", path: "offer.kind", value: "amount" },
          { op: "eq", path: "offer.kind", value: "rate" },
          { op: "eq", path: "offer.kind", value: "approval" },
          { op: "text_includes", path: "text", value: "$" },
          { op: "text_includes", path: "text", value: "tasa" },
          { op: "text_includes", path: "text", value: "aprobad" },
          { op: "text_includes", path: "text", value: "hasta" },
        ],
      },
      { op: "neq", path: "offer.validated", value: true },
    ],
  }
  const secrets: Condition = {
    op: "or",
    conditions: [
      { op: "includes", path: "requestedSecrets", value: "nss" },
      { op: "includes", path: "requestedSecrets", value: "curp" },
      { op: "includes", path: "requestedSecrets", value: "infonavit_password" },
      { op: "text_includes", path: "text", value: "nss" },
      { op: "text_includes", path: "text", value: "curp" },
      { op: "text_includes", path: "text", value: "contraseña" },
      { op: "text_includes", path: "text", value: "password" },
    ],
  }
  return {
    id: input.id ?? "mejoravit-whatsapp",
    accountId: input.accountId,
    name: input.name ?? "Mejoravit WhatsApp",
    rules: [
      rule({ id: "block-unvalidated-offer", name: "Monto sin validar", kinds: [send], conditions: offer, decision: "block", reasonKey: REASON.unvalidatedOffer }),
      rule({ id: "block-secrets", name: "Secretos", kinds: [send], conditions: secrets, decision: "block", reasonKey: REASON.secrets }),
      rule({
        id: "block-off-topic",
        name: "Fuera de tema",
        kinds: [send],
        conditions: { op: "neq", path: "topic", value: "mejoravit" },
        decision: "block",
        reasonKey: REASON.offTopic,
      }),
      rule({
        id: "approval-stage",
        name: "Etapa clave",
        kinds: [WHATSAPP_KINDS.stage],
        conditions: { op: "in", path: "stage", values: [...KEY_STAGES] },
        decision: "require_approval",
        reasonKey: REASON.stage,
        approvalTtlMs: ttl,
      }),
      rule({
        id: "approval-document",
        name: "Documento",
        kinds: [WHATSAPP_KINDS.document],
        conditions: { op: "in", path: "documentType", values: [...DOCUMENT_TYPES] },
        decision: "require_approval",
        reasonKey: REASON.document,
        approvalTtlMs: ttl,
      }),
      rule({
        id: "approval-discount",
        name: "Descuento",
        kinds: [WHATSAPP_KINDS.discount],
        conditions: { op: "eq", path: "discountRequested", value: true },
        decision: "require_approval",
        reasonKey: REASON.discount,
        approvalTtlMs: ttl,
      }),
      rule({
        id: "approval-unsolicited",
        name: "Número que no escribió",
        kinds: [send],
        conditions: {
          op: "and",
          conditions: [
            { op: "eq", path: "direction", value: "outbound" },
            { op: "eq", path: "contactInitiated", value: false },
          ],
        },
        decision: "require_approval",
        reasonKey: REASON.unsolicited,
        approvalTtlMs: ttl,
      }),
      rule({
        id: "handoff-complaint",
        name: "Queja",
        kinds: [WHATSAPP_KINDS.inbound],
        conditions: {
          op: "or",
          conditions: [
            { op: "eq", path: "intent", value: "complaint" },
            { op: "text_includes", path: "text", value: "queja" },
            { op: "text_includes", path: "text", value: "complaint" },
          ],
        },
        decision: "handoff_to_human",
        reasonKey: REASON.complaint,
      }),
      rule({
        id: "handoff-legal",
        name: "Abogado o Profeco",
        kinds: [WHATSAPP_KINDS.inbound],
        conditions: {
          op: "or",
          conditions: [
            { op: "eq", path: "intent", value: "legal" },
            { op: "includes", path: "mentions", value: "abogado" },
            { op: "includes", path: "mentions", value: "profeco" },
            { op: "text_includes", path: "text", value: "abogado" },
            { op: "text_includes", path: "text", value: "profeco" },
          ],
        },
        decision: "handoff_to_human",
        reasonKey: REASON.legal,
      }),
      rule({
        id: "handoff-human",
        name: "Piden una persona",
        kinds: [WHATSAPP_KINDS.inbound],
        conditions: {
          op: "or",
          conditions: [
            { op: "eq", path: "intent", value: "human" },
            { op: "eq", path: "requestedHuman", value: true },
            { op: "text_includes", path: "text", value: "asesor humano" },
            { op: "text_includes", path: "text", value: "quiero una persona" },
          ],
        },
        decision: "handoff_to_human",
        reasonKey: REASON.human,
      }),
      rule({
        id: "handoff-stuck",
        name: "Conversación atorada",
        kinds: [WHATSAPP_KINDS.inbound],
        conditions: { op: "gte", path: "stuckCount", value: stuck },
        decision: "handoff_to_human",
        reasonKey: REASON.stuck,
      }),
      rule({
        id: "log-all",
        name: "Bitácora",
        kinds: ["*"],
        conditions: { op: "and", conditions: [] },
        decision: "log",
        reasonKey: REASON.log,
      }),
    ],
  }
}

/** Fields a complete fictional WhatsApp action should carry so the preset can decide. */
export function mejoravitRequiredPaths(kind: string): readonly string[] {
  if (kind === WHATSAPP_KINDS.send) {
    return ["text", "topic", "offer.kind", "offer.validated", "requestedSecrets", "direction", "contactInitiated"]
  }
  if (kind === WHATSAPP_KINDS.stage) return ["stage"]
  if (kind === WHATSAPP_KINDS.document) return ["documentType"]
  if (kind === WHATSAPP_KINDS.discount) return ["discountRequested"]
  if (kind === WHATSAPP_KINDS.inbound) return ["text", "intent", "mentions", "requestedHuman", "stuckCount"]
  return []
}

export const SYNTHETIC_ACCOUNT = "marca-sintetica"
export const SYNTHETIC_PHONE = "+525500000000"
export const SYNTHETIC_PHONE_LABEL = "+52 55 0000 0000"

export function syntheticSafeSend(accountId = SYNTHETIC_ACCOUNT): GuardAction {
  return {
    accountId,
    kind: WHATSAPP_KINDS.send,
    text: "Hola, soy la asesora demo. Seguimos con tu solicitud de Mejoravit.",
    data: {
      direction: "outbound",
      contactInitiated: true,
      destinationPhone: SYNTHETIC_PHONE,
      topic: "mejoravit",
      offer: { kind: "none", validated: false },
      requestedSecrets: [],
    },
  }
}

export function syntheticUnvalidatedOffer(accountId = SYNTHETIC_ACCOUNT): GuardAction {
  return {
    ...syntheticSafeSend(accountId),
    text: "Te podemos ofrecer hasta $36 mil.",
    data: {
      ...syntheticSafeSend(accountId).data,
      offer: { kind: "amount", validated: false, label: "hasta $36 mil" },
    },
  }
}

export function syntheticValidatedOffer(accountId = SYNTHETIC_ACCOUNT): GuardAction {
  return {
    ...syntheticSafeSend(accountId),
    text: "El dato validado de tu expediente dice hasta $36 mil.",
    data: {
      ...syntheticSafeSend(accountId).data,
      offer: { kind: "amount", validated: true, label: "hasta $36 mil" },
    },
  }
}
