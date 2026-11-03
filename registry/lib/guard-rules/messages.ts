import type { Evaluation, GuardLocale, MessageCatalog, TerminalDecision } from "./types"
import { REASON } from "./types"

export const GUARD_MESSAGES: MessageCatalog = {
  [REASON.unvalidatedOffer]: {
    es: "No se puede prometer un monto, una tasa o una aprobación sin un dato validado.",
    en: "An amount, a rate, or an approval cannot be promised without a validated fact.",
  },
  [REASON.secrets]: {
    es: "No pidas ni repitas el NSS, la CURP ni la contraseña de Infonavit.",
    en: "Do not ask for or repeat an NSS, a CURP, or an Infonavit password.",
  },
  [REASON.offTopic]: {
    es: "Esa respuesta se sale del tema de Mejoravit.",
    en: "That reply leaves the Mejoravit topic.",
  },
  [REASON.stage]: {
    es: "Cambiar a esta etapa necesita la aprobación de un asesor.",
    en: "Moving to this stage needs an advisor's approval.",
  },
  [REASON.document]: {
    es: "Enviar ese documento o contrato necesita la aprobación de un asesor.",
    en: "Sending that document or contract needs an advisor's approval.",
  },
  [REASON.discount]: {
    es: "Ese descuento necesita la aprobación de un asesor.",
    en: "That discount needs an advisor's approval.",
  },
  [REASON.unsolicited]: {
    es: "Ese mensaje sale a un número que no inició la conversación. Un asesor tiene que aprobarlo.",
    en: "That message goes to a number that did not start the conversation. An advisor has to approve it.",
  },
  [REASON.complaint]: {
    es: "La persona está quejándose. Pásala con alguien del equipo.",
    en: "The person is complaining. Hand the conversation to a teammate.",
  },
  [REASON.legal]: {
    es: "Mencionan a un abogado o a Profeco. Pásala con alguien del equipo.",
    en: "They mention a lawyer or Profeco. Hand the conversation to a teammate.",
  },
  [REASON.human]: {
    es: "Pidieron hablar con una persona.",
    en: "They asked to talk to a person.",
  },
  [REASON.stuck]: {
    es: "La conversación lleva demasiados mensajes atorados. Pásala con alguien del equipo.",
    en: "The conversation has too many stuck messages. Hand it to a teammate.",
  },
  [REASON.log]: {
    es: "Quedó en la bitácora.",
    en: "Recorded in the audit log.",
  },
  [REASON.missing]: {
    es: "Falta un dato que la regla necesita. No se permite seguir en automático. Un asesor tiene que revisarlo.",
    en: "A fact the rule needs is missing. Automatic allow is not permitted. An advisor has to review it.",
  },
  [REASON.none]: {
    es: "Ninguna regla de guarda cambió la decisión.",
    en: "No guard rule changed the decision.",
  },
  [REASON.noRuleset]: {
    es: "No hay un conjunto de reglas activo para esta cuenta.",
    en: "This account has no active ruleset.",
  },
  [REASON.gitMerge]: {
    es: "El merge necesita aprobación humana.",
    en: "The merge needs a human approval.",
  },
}

const DECISION_LABELS: Record<TerminalDecision, { es: string; en: string }> = {
  allow: { es: "Permitir", en: "Allow" },
  require_approval: { es: "Requiere aprobación", en: "Needs approval" },
  block: { es: "Bloquear", en: "Block" },
  handoff_to_human: { es: "Pasar a una persona", en: "Hand off to a person" },
}

export function guardMessage(key: string, locale: GuardLocale, extra?: MessageCatalog): string {
  const catalog = extra?.[key] ?? GUARD_MESSAGES[key]
  if (!catalog) return locale === "es" ? `Regla ${key}.` : `Rule ${key}.`
  return catalog[locale]
}

export function decisionLabel(decision: TerminalDecision, locale: GuardLocale): string {
  return DECISION_LABELS[decision][locale]
}

export function explain(evaluation: Evaluation, locale: GuardLocale, extra?: MessageCatalog): string {
  const parts: string[] = []
  if (evaluation.failClosed) {
    const base = guardMessage(REASON.missing, locale, extra)
    const paths = evaluation.missingPaths.join(", ")
    parts.push(paths ? `${base} (${paths})` : base)
  }
  for (const fired of evaluation.fired) {
    if (fired.decision === "log") continue
    parts.push(guardMessage(fired.reasonKey, locale, extra))
  }
  if (parts.length === 0) parts.push(guardMessage(REASON.none, locale, extra))
  return parts.join(" ")
}

export function formatGuardTime(ms: number, locale: GuardLocale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(ms))
}
