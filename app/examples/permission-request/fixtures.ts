import type { SceneLocale } from "@/app/catalog/scene-types"
import type { PermissionDecision, PermissionPreview, PermissionRequestLabels, PermissionRisk, PermissionScope } from "@/registry/ui/permission-request"

export type OrderMeta = { pedido: string }

type PreviewSeed = { id: string; meta?: string; es: string; en: string }

export type PermissionFixture = {
  agent?: string
  action?: { es: string; en: string }
  target?: string
  risk?: PermissionRisk
  reason?: { es: string; en: string }
  preview?: readonly PreviewSeed[]
  scope?: PermissionScope
  decision?: PermissionDecision | null
  loading?: boolean
  banner?: { es: string; en: string }
  allowError?: { es: string; en: string }
}

const preview: PreviewSeed[] = [
  { id: "correo", es: "Correo a Ramón Solís", en: "Mail to Ramón Solís", meta: "pedidos@bajio.example" },
  { id: "asunto", es: "Asunto: el horno 2 no enciende", en: "Subject: kiln 2 will not light" },
  { id: "adjunto", es: "Adjunto cotizacion-PED-990.pdf", en: "Attach cotizacion-PED-990.pdf" },
  { id: "anticipo", es: "No cambia el anticipo de $18,400.00 MXN", en: "The $18,400.00 MXN deposit stays put" },
]

export const filled: PermissionFixture = {
  agent: "Bruma",
  action: { es: "mandar el correo a Celaya", en: "send the Celaya mail" },
  target: "PED-990 · Cerámica del Bajío",
  risk: "risky",
  reason: {
    es: "El correo del pedido PED-990 no salió y el horno 2 sigue apagado.",
    en: "Mail for order PED-990 did not go out and kiln 2 is still off.",
  },
  preview,
  scope: "once",
}

export const empty: PermissionFixture = {}

export const loading: PermissionFixture = { ...filled, loading: true }

export const error: PermissionFixture = {
  ...filled,
  banner: {
    es: "No se permitió el correo. Sigue en espera.",
    en: "The mail was not allowed. It is still waiting.",
  },
  allowError: {
    es: "No se permitió el correo. Sigue en espera.",
    en: "The mail was not allowed. It is still waiting.",
  },
}

export const allowed: PermissionFixture = { ...filled, decision: { allow: true, scope: "once" } }

export const denied: PermissionFixture = { ...filled, decision: { allow: false } }

export const destructive: PermissionFixture = {
  agent: "Caja",
  action: { es: "borrar el anticipo viejo de $16,200.00", en: "delete the old $16,200.00 deposit" },
  target: "PED-1048 · Cerámica del Bajío",
  risk: "destructive",
  reason: {
    es: "Esa cifra ya no vale. El anticipo vigente es $18,400.00 MXN.",
    en: "That figure is no longer valid. The deposit that stands is $18,400.00 MXN.",
  },
  preview: [{ id: "linea", es: "Quitar la línea de $16,200.00 MXN", en: "Remove the $16,200.00 MXN line" }],
  scope: "once",
}

export const timed: PermissionFixture = { ...filled, decision: { allow: true, scope: "timed", left: "42 min" } }

export function permissionLabels(locale: SceneLocale): Partial<PermissionRequestLabels> {
  if (locale === "en") return {}
  return {
    title: (name, action) => `${name} quiere ${action}`,
    reason: "Por qué",
    preview: "Qué va a pasar",
    more: (count) => (count === 1 ? "1 más" : `${count} más`),
    less: "Ver menos",
    scope: "Por cuánto",
    scopes: { once: "Una vez", timed: "Un rato", always: "Siempre" },
    allowNamed: (scope, duration) => (scope === "once" ? "Permitir una vez" : scope === "always" ? "Permitir siempre" : `Permitir ${duration}`),
    deny: "No permitir",
    allowed: (scope, duration) => (scope === "once" ? "Permitido una vez" : scope === "always" ? "Permitido siempre" : `Permitido ${duration}`),
    denied: "No se permitió",
    left: (label) => `Quedan ${label}`,
    revoke: "Revocar",
    again: "Volver a pedir",
    empty: "Nadie está pidiendo permiso.",
    loading: "Cargando la petición",
    risk: { safe: "Seguro", risky: "Delicado", destructive: "Destructivo" },
  }
}

export function durationLabel(locale: SceneLocale) {
  return locale === "en" ? "1 hour" : "1 hora"
}

export function previewFrom(rows: readonly PreviewSeed[] | undefined, locale: SceneLocale): PermissionPreview<OrderMeta>[] {
  return (rows ?? []).map((row) => ({ id: row.id, label: row[locale], meta: row.meta, itemMeta: { pedido: "PED-990" } }))
}
