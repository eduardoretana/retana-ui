export const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "12m", label: "Last 12 months" },
] as const

export type RangeKey = (typeof RANGE_OPTIONS)[number]["key"]

export type ResolvedRange = {
  key: RangeKey
  label: string
  from: number
  to: number
  prevFrom: number
  prevTo: number
  bucket: "hour" | "day" | "month"
}

const DAY = 86_400_000

export function isRangeKey(value: string): value is RangeKey {
  return RANGE_OPTIONS.some((option) => option.key === value)
}

/** Offset of `timeZone` at `ts`, in ms. UTC is 0. */
export function timeZoneOffsetMs(timeZone: string, ts: number): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ts))
  const parts = Object.fromEntries(formatted.map((part) => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - ts
}

export function startOfZonedDay(ts: number, timeZone = "UTC"): number {
  const offset = timeZoneOffsetMs(timeZone, ts)
  const local = ts + offset
  const midnightLocal = Math.floor(local / DAY) * DAY
  const guess = midnightLocal - timeZoneOffsetMs(timeZone, midnightLocal - offset)
  const check = timeZoneOffsetMs(timeZone, guess)
  return midnightLocal - check
}

export function resolveRange(
  key: RangeKey,
  now = Date.now(),
  timeZone = "UTC",
): ResolvedRange {
  const option = RANGE_OPTIONS.find((item) => item.key === key) ?? RANGE_OPTIONS[1]
  const today = startOfZonedDay(now, timeZone)
  let from = today
  let bucket: ResolvedRange["bucket"] = "day"
  let span = DAY

  if (key === "today") {
    from = today
    bucket = "hour"
    span = DAY
  } else if (key === "12m") {
    const offset = timeZoneOffsetMs(timeZone, today)
    const local = new Date(today + offset)
    const start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 11, 1)
    from = start - timeZoneOffsetMs(timeZone, start - offset)
    bucket = "month"
    span = now - from
  } else {
    const days = key === "7d" ? 7 : key === "30d" ? 30 : 90
    from = today - (days - 1) * DAY
    span = days * DAY
    bucket = "day"
  }

  return {
    key: option.key,
    label: option.label,
    from,
    to: now,
    prevFrom: from - span,
    prevTo: now - span,
    bucket,
  }
}

/** Inclusive window. */
export function inRange(ts: number, from: number, to: number): boolean {
  return ts >= from && ts <= to
}

export function filterByRange<T>(
  rows: readonly T[],
  getTime: (row: T) => number | null,
  from: number,
  to: number,
): T[] {
  return rows.filter((row) => {
    const ts = getTime(row)
    return ts != null && inRange(ts, from, to)
  })
}

export type DatePreset = {
  key: string
  label: string
}

export const CALL_PRESETS: DatePreset[] = [
  { key: "any", label: "Any time" },
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "next7", label: "Next 7 days" },
  { key: "next30", label: "Next 30 days" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
]

/** `[from, to)` for a named preset, or null when the preset does not filter. */
export function presetBounds(
  preset: string,
  now = Date.now(),
  timeZone = "UTC",
): [number, number] | null {
  const today = startOfZonedDay(now, timeZone)
  switch (preset) {
    case "today":
      return [today, today + DAY]
    case "tomorrow":
      return [today + DAY, today + 2 * DAY]
    case "next7":
      return [now, now + 7 * DAY]
    case "next30":
      return [now, now + 30 * DAY]
    case "last7":
      return [now - 7 * DAY, now]
    case "last30":
      return [now - 30 * DAY, now]
    case "last90":
      return [now - 90 * DAY, now]
    default:
      return null
  }
}
