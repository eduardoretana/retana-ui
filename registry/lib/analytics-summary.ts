import type {
  AnalyticsClick,
  AnalyticsSnapshot,
  AnalyticsView,
  DailyMetric,
  LabeledValue,
} from "@/registry/retana/lib/admin-types"
import { inRange } from "@/registry/retana/lib/date-range"

const DAY = 86_400_000

function dateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function hostOf(referrer: string | null): string {
  if (!referrer) return "Directo"
  try {
    const url = referrer.includes("://") ? new URL(referrer) : new URL(`https://${referrer}`)
    return url.host.replace(/^www\./, "") || "Directo"
  } catch {
    return referrer
  }
}

function bump(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by)
}

function top(map: Map<string, number>, limit: number): LabeledValue[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

/**
 * Turn raw page views and clicks into the snapshot the chart pieces render.
 * The window is inclusive. Empty days inside the window stay in `daily`.
 */
export function summarizeAnalytics(
  views: readonly AnalyticsView[],
  clicks: readonly AnalyticsClick[],
  from: number,
  to: number,
): AnalyticsSnapshot {
  const inWindow = views.filter((view) => inRange(view.ts, from, to))
  const clicksInWindow = clicks.filter((click) => inRange(click.ts, from, to))

  const visitorsByDay = new Map<string, Set<string>>()
  const viewsByDay = new Map<string, number>()
  const clicksByDay = new Map<string, number>()
  const sources = new Map<string, number>()
  const sessions = new Set<string>()
  const pricingSessions = new Set<string>()
  const clickSessions = new Set<string>()
  const heat: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  const scroll = { s25: 0, s50: 0, s75: 0, s90: 0, s100: 0 }

  for (const view of inWindow) {
    const key = dateKey(view.ts)
    const set = visitorsByDay.get(key) ?? new Set<string>()
    set.add(view.visitor)
    visitorsByDay.set(key, set)
    bump(viewsByDay, key)
    bump(sources, hostOf(view.referrer))
    sessions.add(view.session)
    if (view.path.includes("precio") || view.path.includes("pricing") || view.path.includes("planes")) {
      pricingSessions.add(view.session)
    }
    const date = new Date(view.ts)
    const mondayIndex = (date.getUTCDay() + 6) % 7
    const hour = date.getUTCHours()
    const row = heat[mondayIndex]
    if (row) row[hour] = (row[hour] ?? 0) + 1
    if (view.scrollPct >= 25) scroll.s25 += 1
    if (view.scrollPct >= 50) scroll.s50 += 1
    if (view.scrollPct >= 75) scroll.s75 += 1
    if (view.scrollPct >= 90) scroll.s90 += 1
    if (view.scrollPct >= 100) scroll.s100 += 1
  }

  for (const click of clicksInWindow) {
    bump(clicksByDay, dateKey(click.ts))
    clickSessions.add(click.session)
  }

  const daily: DailyMetric[] = []
  const start = Date.parse(`${dateKey(from)}T00:00:00.000Z`)
  const end = Date.parse(`${dateKey(to)}T00:00:00.000Z`)
  for (let ts = start; ts <= end; ts += DAY) {
    const key = dateKey(ts)
    daily.push({
      date: key,
      visitors: visitorsByDay.get(key)?.size ?? 0,
      views: viewsByDay.get(key) ?? 0,
      clicks: clicksByDay.get(key) ?? 0,
    })
  }

  const total = inWindow.length || 1
  const scrollBars: LabeledValue[] = [
    { label: "25%", value: scroll.s25 / total },
    { label: "50%", value: scroll.s50 / total },
    { label: "75%", value: scroll.s75 / total },
    { label: "90%", value: scroll.s90 / total },
    { label: "100%", value: scroll.s100 / total },
  ]

  return {
    daily,
    sources: top(sources, 6),
    funnel: [
      { label: "Sesiones", value: sessions.size },
      { label: "Vieron precios", value: pricingSessions.size },
      { label: "Hicieron clic", value: clickSessions.size },
    ],
    scroll: scrollBars,
    heat,
  }
}

export function sumDaily(daily: readonly DailyMetric[]) {
  return daily.reduce(
    (acc, day) => ({
      visitors: acc.visitors + day.visitors,
      views: acc.views + day.views,
      clicks: acc.clicks + day.clicks,
    }),
    { visitors: 0, views: 0, clicks: 0 },
  )
}
