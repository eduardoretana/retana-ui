import type { ApprovalDecision, ApprovalRisk, ToolApprovalLabels } from "@/registry/ui/tool-approval"

export type ToolChange = { id: string; kind: "add" | "edit"; title: string; detail?: string }

export type ToolCopy = {
  title: string
  reason?: string
  approve: string
  deny: string
  hint?: string
  args: Record<string, string>
  changes: ToolChange[]
  choice?: string
  error: string
}

export type ToolFixture = {
  toolName: string
  risk?: ApprovalRisk
  versionLabel?: string
  decision?: ApprovalDecision | null
  busy?: boolean
  es: ToolCopy
  en: ToolCopy
}

const payment = {
  es: {
    title: "Hace falta tu aprobación",
    reason: "Transfiere el anticipo del pedido de esmalte antes de las 18:00.",
    approve: "Aprobar",
    deny: "Rechazar",
    hint: "El pago sale de la cuenta del taller.",
    args: {
      proveedor: "Cerámica del Bajío",
      monto: "$18,400.00 MXN",
      cuenta: "CLABE ··4821",
      pedido: "PED-1048",
      cuando: "hoy, antes de las 18:00",
    },
    changes: [
      { id: "anticipo", kind: "add" as const, title: "Anticipo 50%", detail: "$18,400.00 MXN a Cerámica del Bajío" },
      { id: "entrega", kind: "edit" as const, title: "Fecha de entrega", detail: "viernes 30 de octubre" },
    ],
    choice: "La factura ya está en el expediente",
    error: "El banco no tomó el pago. La herramienta sigue en espera.",
  },
  en: {
    title: "Approval needed",
    reason: "Send the glaze order deposit before 6:00 p.m.",
    approve: "Approve",
    deny: "Deny",
    hint: "The payment leaves the workshop account.",
    args: {
      supplier: "Cerámica del Bajío",
      amount: "$18,400.00 MXN",
      account: "CLABE ··4821",
      order: "PED-1048",
      when: "today, before 6:00 p.m.",
    },
    changes: [
      { id: "anticipo", kind: "add" as const, title: "50% deposit", detail: "$18,400.00 MXN to Cerámica del Bajío" },
      { id: "entrega", kind: "edit" as const, title: "Delivery date", detail: "Friday, October 30" },
    ],
    choice: "The invoice is already on file",
    error: "The bank did not take the payment. The tool is still waiting.",
  },
}

/** A real payment waiting on a person at Taller Ladrillo. */
export const filled: ToolFixture = {
  toolName: "pagar_proveedor",
  risk: "high",
  versionLabel: "v3",
  es: payment.es,
  en: payment.en,
}

/** A note with no arguments, no risk, and nothing to review. */
export const empty: ToolFixture = {
  toolName: "anotar_bitacora",
  es: {
    title: "Hace falta tu aprobación",
    approve: "Aprobar",
    deny: "Rechazar",
    args: {},
    changes: [],
    error: "No se pudo anotar. Inténtalo de nuevo.",
  },
  en: {
    title: "Approval needed",
    approve: "Approve",
    deny: "Deny",
    args: {},
    changes: [],
    error: "The note did not save. Try again.",
  },
}

/** The same payment, already sent and waiting on the bank. */
export const loading: ToolFixture = {
  ...filled,
  busy: true,
  es: { ...filled.es, hint: "Enviando el anticipo al banco…" },
  en: { ...filled.en, hint: "Sending the deposit to the bank…" },
}

/** The bank rejected the CLABE. Approve tries again. */
export const error: ToolFixture = {
  ...filled,
  es: {
    ...filled.es,
    hint: "El banco rechazó la CLABE ··4821.",
  },
  en: {
    ...filled.en,
    hint: "The bank rejected CLABE ··4821.",
  },
}

export const approved: ToolFixture = {
  ...filled,
  decision: "approved",
}

export const denied: ToolFixture = {
  ...filled,
  decision: "rejected",
}

export function toolLabels(locale: "es" | "en"): Partial<ToolApprovalLabels> | undefined {
  if (locale === "en") return undefined
  return {
    risk: (risk) => (risk === "high" ? "Riesgo alto" : risk === "medium" ? "Riesgo medio" : "Riesgo bajo"),
    changes: "Cambios",
    alwaysAllow: "Permitir siempre esta herramienta",
    approved: "Aprobado",
    denied: "Rechazado",
    showMore: "Ver más",
    showLess: "Ver menos",
    waiting: (toolName) => `Esperando una decisión sobre ${toolName}`,
    approvedFor: (toolName) => `${toolName} aprobado`,
    deniedFor: (toolName) => `${toolName} rechazado`,
  }
}
