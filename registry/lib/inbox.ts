/**
 * Shared types for the desk pieces. No fetching, no theme.
 * Dates are calendar days (`YYYY-MM-DD`). The host owns locale and timezone.
 */

export const DESK_PRESENCES = ["online", "offline", "away"] as const

export type DeskPresence = (typeof DESK_PRESENCES)[number]

export type DeskMessage = {
  id: string
  author: string
  body: string
  /** Preformatted time. */
  time: string
  side: "incoming" | "outgoing"
  note?: boolean
  receipt?: "seen" | "unseen"
}

export type DeskOption = {
  value: string
  label: string
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function foldInboxText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function isCalendarDate(value: string | undefined): value is string {
  return Boolean(value && DATE_RE.test(value))
}

/** True when `due` is a calendar day before `today`. */
export function isOverdueDate(due: string | undefined, today: string): boolean {
  if (!isCalendarDate(due) || !isCalendarDate(today)) return false
  return due < today
}

export function formatDeskDate(iso: string, locale?: string): string {
  if (!isCalendarDate(iso)) return iso
  const [year, month, day] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  )
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
