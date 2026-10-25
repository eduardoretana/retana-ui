/**
 * Clean-room model for a collaboration thread.
 * Messages, calendar blocks, and voice notes share one list.
 * The waveform is resampled from caller data. There is no audio file.
 * `TMeta` is never read. Chrome defaults to Spanish.
 */

export const CHAT_KINDS = ["message", "event", "voice"] as const

export type ActivityChatKind = (typeof CHAT_KINDS)[number]

export type ActivityChatPerson = {
  id: string
  name: string
}

export type ActivityChatEvent = {
  title: string
  startsAt: string
  endsAt: string
  location?: string
}

export type ActivityChatVoice = {
  durationMs: number
  peaks: readonly number[]
  transcript?: string
}

export type ActivityChatEntry<TMeta = Record<string, unknown>> = {
  id: string
  kind: ActivityChatKind
  authorId: string
  createdAt: string
  body?: string
  event?: ActivityChatEvent
  voice?: ActivityChatVoice
  /** Host payload. The thread never reads it. */
  meta?: TMeta
}

export type ActivityChatLabels = {
  heading: string
  emptyTitle: string
  emptyHint: string
  loading: string
  errorTitle: string
  retry: string
  disabledNote: string
  composer: string
  composerPlaceholder: string
  send: string
  voiceNote: string
  event: string
  unknownAuthor: string
  you: string
  playVoice: (name: string) => string
  pauseVoice: (name: string) => string
  messageFrom: (name: string, when: string) => string
}

export const activityChatLabels: ActivityChatLabels = {
  heading: "Conversación",
  emptyTitle: "Todavía no hay mensajes",
  emptyHint: "Escribe abajo para empezar.",
  loading: "Cargando la conversación",
  errorTitle: "No se pudo mostrar la conversación",
  retry: "Reintentar",
  disabledNote: "La conversación está deshabilitada",
  composer: "Mensaje",
  composerPlaceholder: "Escribe un mensaje",
  send: "Enviar",
  voiceNote: "Nota de voz",
  event: "Evento",
  unknownAuthor: "Alguien",
  you: "Tú",
  playVoice: (name) => `Reproducir nota de ${name}`,
  pauseVoice: (name) => `Pausar nota de ${name}`,
  messageFrom: (name, when) => `${name}, ${when}`,
}

export const activityChatLabelsEn: ActivityChatLabels = {
  heading: "Conversation",
  emptyTitle: "No messages yet",
  emptyHint: "Write below to start.",
  loading: "Loading the conversation",
  errorTitle: "The conversation could not be shown",
  retry: "Try again",
  disabledNote: "The conversation is disabled",
  composer: "Message",
  composerPlaceholder: "Write a message",
  send: "Send",
  voiceNote: "Voice note",
  event: "Event",
  unknownAuthor: "Someone",
  you: "You",
  playVoice: (name) => `Play note from ${name}`,
  pauseVoice: (name) => `Pause note from ${name}`,
  messageFrom: (name, when) => `${name}, ${when}`,
}

export function withChatLabels(labels?: Partial<ActivityChatLabels>): ActivityChatLabels {
  return { ...activityChatLabels, ...labels }
}

export function orderEntries<T extends { createdAt: string }>(entries: readonly T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const aTime = Date.parse(a.entry.createdAt)
      const bTime = Date.parse(b.entry.createdAt)
      const aOk = Number.isFinite(aTime)
      const bOk = Number.isFinite(bTime)
      if (!aOk && !bOk) return a.index - b.index
      if (!aOk) return 1
      if (!bOk) return -1
      if (aTime === bTime) return a.index - b.index
      return aTime - bTime
    })
    .map(({ entry }) => entry)
}

export function voiceClock(ms: number) {
  const total = Math.max(0, Math.round((Number.isFinite(ms) ? ms : 0) / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

function clampPeak(value: number) {
  if (!Number.isFinite(value)) return 0.2
  return Math.min(1, Math.max(0.08, value))
}

/** Resample caller peaks into a fixed bar count. Missing data stays a quiet line. */
export function waveformLevels(peaks: readonly number[] | undefined, count: number) {
  const safe = Math.max(1, Math.round(count))
  if (!peaks?.length) return Array.from({ length: safe }, () => 0.2)
  if (peaks.length === safe) return peaks.map((value) => clampPeak(value))
  return Array.from({ length: safe }, (_, index) => {
    const position = safe === 1 ? 0 : (index / (safe - 1)) * (peaks.length - 1)
    const left = Math.floor(position)
    const right = Math.min(peaks.length - 1, left + 1)
    const mix = position - left
    return clampPeak((peaks[left] ?? 0) * (1 - mix) + (peaks[right] ?? 0) * mix)
  })
}

export function formatChatStamp(iso: string, locale: string, timeZone: string) {
  const parsed = Date.parse(iso)
  if (!Number.isFinite(parsed)) return iso
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(parsed)
}

export function formatEventWhen(event: ActivityChatEvent, locale: string, timeZone: string) {
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  if (!Number.isFinite(start)) return event.startsAt
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(start)
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(start)
  if (!Number.isFinite(end)) return `${date} · ${time}`
  const endTime = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(end)
  return `${date} · ${time}–${endTime}`
}
