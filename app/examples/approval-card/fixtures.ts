import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ApprovalCardLabels, ApprovalProposal, GateRisk, GateStatus } from "@/registry/ui/approval-card"

export type OrderMeta = { pedido: string }

export type GateSeed = {
  id: string
  risk: GateRisk
  secondsLeft: number
  status: GateStatus
  meta?: OrderMeta
  es: { title: string; preview: string; detail?: string }
  en: { title: string; preview: string; detail?: string }
}

export type GateFixture = {
  seed?: GateSeed
  loading?: boolean
  banner?: { es: string; en: string }
  approveError?: { es: string; en: string }
}

const anticipo: GateSeed = {
  id: "anticipo",
  risk: "high",
  secondsLeft: 4 * 60,
  status: "open",
  meta: { pedido: "PED-1048" },
  es: {
    title: "Mandar el anticipo",
    preview: "Transferencia SPEI de $18,400.00 MXN a Cerámica del Bajío.",
    detail: "Pedido PED-1048 · Mariana Ruiz en León · viernes 30 de octubre.",
  },
  en: {
    title: "Send the deposit",
    preview: "SPEI transfer of $18,400.00 MXN to Cerámica del Bajío.",
    detail: "Order PED-1048 · Mariana Ruiz in León · Friday 30 October.",
  },
}

export const filled: GateFixture = { seed: anticipo }

export const empty: GateFixture = {}

export const loading: GateFixture = { ...filled, loading: true }

export const error: GateFixture = {
  seed: anticipo,
  banner: {
    es: "No pudimos guardar el visto. El anticipo sigue sin salir.",
    en: "The approval could not be saved. The deposit has not gone out.",
  },
  approveError: {
    es: "El anticipo no se aprobó. Sigue en la compuerta.",
    en: "The deposit was not approved. It is still at the gate.",
  },
}

export const held: GateFixture = { seed: { ...anticipo, status: "held" } }

export const elapsed: GateFixture = { seed: { ...anticipo, secondsLeft: 0 } }

export function gateLabels(locale: SceneLocale): Partial<ApprovalCardLabels> {
  if (locale === "en") return {}
  return {
    title: "Antes de que salga",
    risk: { low: "Poco en juego", guarded: "Conviene mirarlo", high: "Difícil de deshacer" },
    held: "Reloj en pausa",
    approved: "Aprobado",
    declined: "Rechazado",
    expired: "Se acabó el reloj",
    expiredDetail: "No se mandó nada. Se queda aquí hasta que lo apruebes.",
    approve: "Aprobar",
    approveAnyway: "Aprobar de todos modos",
    decline: "Rechazar",
    leave: "Dejarlo",
    hold: "Pausar el reloj",
    release: "Reanudar el reloj",
    clock: (label) => `quedan ${label}`,
    empty: "Nada espera para salir.",
    loading: "Cargando la compuerta",
    approvedLive: (title) => `Aprobaste “${title}”`,
    declinedLive: (title) => `Rechazaste “${title}”`,
    heldLive: "Reloj en pausa",
    releasedLive: "El reloj sigue",
  }
}

export function proposalFrom(seed: GateSeed | undefined, locale: SceneLocale, status?: GateStatus): ApprovalProposal<OrderMeta> | null {
  if (!seed) return null
  const copy = seed[locale]
  return {
    id: seed.id,
    title: copy.title,
    preview: copy.preview,
    detail: copy.detail,
    risk: seed.risk,
    secondsLeft: seed.secondsLeft,
    status: status ?? seed.status,
    meta: seed.meta,
  }
}
