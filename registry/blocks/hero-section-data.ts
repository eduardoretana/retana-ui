/** Adapted from Arc UI (MIT). Sample numbers for the dashboard variant. */

export type DashboardRange = "30d" | "90d" | "12m"

export const dashboardRanges: { value: DashboardRange; label: string }[] = [
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
]

export interface DashboardPoint {
  key: string
  label: string
  axisLabel?: string
  now: number
  before: number
}

/** A smooth, deterministic walk: a trend, one slow wave, and a little noise that repeats for the same seed. */
function walk(count: number, start: number, end: number, wave: number, seed: number) {
  let state = seed
  const rand = () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647 - 0.5
  }
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1)
    return Math.round(start + (end - start) * (t * t * 0.35 + t * 0.65) + Math.sin(t * Math.PI * 2.3) * wave + rand() * wave * 0.6)
  })
}

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]

function series(range: DashboardRange): DashboardPoint[] {
  if (range === "12m") {
    const now = walk(12, 9800, 36400, 2600, 7)
    const before = walk(12, 6200, 21900, 2200, 19)
    return months.map((month, index) => ({
      key: `m${index}`,
      label: `${month} ${index < 3 ? 2025 : 2026}`,
      axisLabel: index % 2 === 0 ? month : undefined,
      now: now[index],
      before: before[index],
    }))
  }
  const days = range === "30d" ? 30 : 13
  const step = range === "30d" ? 1 : 7
  const now = walk(days, range === "30d" ? 640 : 4300, range === "30d" ? 1960 : 9800, range === "30d" ? 260 : 900, range === "30d" ? 3 : 11)
  const before = walk(days, range === "30d" ? 520 : 3600, range === "30d" ? 1180 : 6100, range === "30d" ? 220 : 700, 29)
  const end = new Date(Date.UTC(2026, 8, 24))
  return now.map((value, index) => {
    const date = new Date(end.getTime() - (days - 1 - index) * step * 86_400_000)
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    const every = range === "30d" ? 7 : 3
    return {
      key: date.toISOString().slice(0, 10),
      label,
      axisLabel: (days - 1 - index) % every === 0 ? label : undefined,
      now: value,
      before: before[index],
    }
  })
}

export const dashboardSeries: Record<DashboardRange, DashboardPoint[]> = {
  "30d": series("30d"),
  "90d": series("90d"),
  "12m": series("12m"),
}

export interface DashboardKpi {
  id: string
  label: string
  tone: "accent" | "success" | "warning" | "danger"
  byRange: Record<DashboardRange, { value: string; change: string; data: number[] }>
}

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "mrr",
    label: "MRR",
    tone: "accent",
    byRange: {
      "30d": { value: "$482.9K", change: "+8.2%", data: walk(12, 446, 483, 4, 5) },
      "90d": { value: "$482.9K", change: "+19.9%", data: walk(12, 402, 483, 6, 9) },
      "12m": { value: "$482.9K", change: "+51.7%", data: walk(12, 318, 483, 8, 13) },
    },
  },
  {
    id: "nrr",
    label: "Net retention",
    tone: "success",
    byRange: {
      "30d": { value: "118%", change: "+3 pts", data: walk(12, 112, 118, 1.5, 17) },
      "90d": { value: "116%", change: "+5 pts", data: walk(12, 109, 116, 1.8, 21) },
      "12m": { value: "114%", change: "+9 pts", data: walk(12, 103, 114, 2.4, 23) },
    },
  },
  {
    id: "new",
    label: "New customers",
    tone: "success",
    byRange: {
      "30d": { value: "214", change: "+12%", data: walk(12, 5, 9, 2, 31) },
      "90d": { value: "602", change: "+18%", data: walk(12, 38, 56, 6, 37) },
      "12m": { value: "2,140", change: "+34%", data: walk(12, 120, 214, 16, 41) },
    },
  },
  {
    id: "churn",
    label: "Churned MRR",
    tone: "success",
    byRange: {
      "30d": { value: "$6.1K", change: "−14%", data: walk(12, 9, 6, 1.2, 43) },
      "90d": { value: "$21.4K", change: "−9%", data: walk(12, 26, 21, 2, 47) },
      "12m": { value: "$96.8K", change: "−22%", data: walk(12, 12, 7, 1.4, 53) },
    },
  },
]

export interface DashboardMover {
  name: string
  change: string
  amount: number
}

export const dashboardMovers: DashboardMover[] = [
  { name: "Linear", change: "Moved to Enterprise", amount: 4200 },
  { name: "Raycast", change: "Added 120 seats", amount: 2850 },
  { name: "Vercel", change: "Annual prepay", amount: 1900 },
  { name: "Loom", change: "Removed 40 seats", amount: -1240 },
  { name: "Supabase", change: "Added forecasting", amount: 980 },
  { name: "Framer", change: "Upgraded to Scale", amount: 760 },
]

export const dashboardInsight: Record<DashboardRange, { lead: string; rest: string }> = {
  "30d": { lead: "MRR grew $36.4K this month.", rest: "62% came from 14 expansions on the Scale plan, led by Linear." },
  "90d": { lead: "MRR grew $80.6K this quarter.", rest: "Expansion outpaced new business for the first time since March." },
  "12m": { lead: "MRR grew $164.5K in twelve months.", rest: "Net retention above 110% did more than new logos did." },
}

export const editorialBrands = ["Linear", "Vercel", "Raycast", "Notion", "Figma", "Stripe", "Loom"]
