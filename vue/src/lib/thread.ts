/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Tipos y puertos. Sin red y sin dominio de un canal.
 */

export type ThreadStatus = "ready" | "loading" | "empty" | "error" | "offline"
export type PieceStatus = "ready" | "loading" | "empty" | "error"
export type Presence = "online" | "offline" | "away"
export type DeliveryState = "sending" | "sent" | "delivered" | "read" | "failed"

export type ThreadFilter = { value: string; label: string }
export type ConversationSection = { id: string; label: string; hint?: string }

export type ConversationItemData = {
  id: string
  title: string
  preview?: string
  time?: string
  unread?: number
  section?: string
  tags?: readonly string[]
  presence?: Presence
  role?: string
  kind?: "thread" | "contact"
  stage?: string
  windowLabel?: string
  /** Texto del canal. El anfitrión lo pasa ya traducido; la pieza no conoce WhatsApp. */
  channel?: string
}

export type ThreadNote = { title: string; detail: string; body?: string }
export type ThreadFile = { name: string; detail: string; status?: string }
export type ThreadInvoice = { title: string; amount: string; due: string }
export type ThreadMetric = {
  title: string
  chip?: string
  value: string
  caption?: string
  filled: number
  total: number
  start: string
  end: string
}

export type ThreadMessageData = {
  id: string
  side: "incoming" | "outgoing"
  author: string
  time?: string
  body?: string
  delivery?: DeliveryState
  deliveryLabel?: string
  grouped?: "single" | "start" | "middle" | "end"
  enter?: boolean
  note?: ThreadNote
  file?: ThreadFile
  invoice?: ThreadInvoice
  metric?: ThreadMetric
}

export type SuggestionItem = { id: string; label: string }
export type SecretField = { id: string; label: string; masked: string; revealed: string }
export type PartyFact = { id: string; label: string; value: string }
export type PartyMember = { id: string; name: string; role: string }
export type PartyFile = { id: string; name: string; detail: string }
export type PartyDeal = { title: string; status: string; amount: string; value: number; label: string }
export type PartyAction = { id: string; label: string }

export type PartyPanelData = {
  name: string
  meta?: string
  deal?: PartyDeal
  facts?: readonly PartyFact[]
  members?: readonly PartyMember[]
  files?: readonly PartyFile[]
  secrets?: readonly SecretField[]
  actions?: readonly PartyAction[]
}

export type ComposerLock = { title: string; action: string }

export function foldInboxText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function deskInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
  return letters || "?"
}

export function matchesConversation(item: ConversationItemData, filter: string | undefined, query: string) {
  if (filter && filter !== "all") {
    const tagged = item.tags?.includes(filter) || (filter === "unread" && (item.unread ?? 0) > 0)
    if (!tagged) return false
  }
  const needle = query.trim()
  if (!needle) return true
  const hay = [item.title, item.preview, item.role, item.stage, item.windowLabel].filter(Boolean).join(" ")
  return foldInboxText(hay).includes(foldInboxText(needle))
}

export function groupMessages(messages: readonly ThreadMessageData[]): ThreadMessageData[] {
  return messages.map((message, index) => {
    if (message.grouped) return message
    const prev = messages[index - 1]
    const next = messages[index + 1]
    const same = (other?: ThreadMessageData) =>
      Boolean(other && other.side === message.side && other.author === message.author && !other.file && !other.invoice && !other.metric && !message.file && !message.invoice && !message.metric)
    const before = same(prev)
    const after = same(next)
    const grouped = before && after ? "middle" : before ? "end" : after ? "start" : "single"
    return { ...message, grouped }
  })
}

export function motionReduced() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function presenceStyle(presence: Presence) {
  if (presence === "online") return { background: "var(--success)" }
  if (presence === "offline") return { background: "var(--muted-foreground)" }
  return { background: "var(--accent-foreground)" }
}
