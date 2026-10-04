import type { AttentionItem } from "@/registry/ui/attention-list"
import type { TrendSeries } from "@/registry/ui/annotated-trend-chart"
import type { RankedBarItem } from "@/registry/ui/ranked-bars"
import type { BreakdownSegment } from "@/registry/ui/breakdown-bar"
import type { RecordTimelineEvent } from "@/registry/ui/record-timeline"
import type { StatStripItem } from "@/registry/ui/stat-strip"
import type { SuggestedChoice, SuggestedChoiceField } from "@/registry/ui/suggested-choice-dialog"
import type { TierDistributionTier } from "@/registry/ui/tier-distribution"

/** Fictional QA desk for Marea, a made-up software studio. */
export const deskNow = new Date("2026-04-08T09:30:00")

export const deskStats: StatStripItem[] = [
  {
    id: "open",
    label: "Open defects",
    value: 18,
    format: "number",
    delta: { value: 4, direction: "up", good: "down", label: "+4" },
    caption: "versus the previous 30 days",
  },
  {
    id: "reopen",
    label: "Reopen rate",
    value: 0.062,
    format: "percent",
    delta: { value: -0.8, format: "points", direction: "down", good: "down" },
    caption: "target 4%",
  },
]

export const deskTrend: TrendSeries[] = [
  {
    id: "queue",
    label: "This queue",
    emphasis: "primary",
    points: [
      { x: "Jan 6", y: 0.041 },
      { x: "Jan 20", y: 0.038 },
      { x: "Feb 3", y: 0.044 },
      { x: "Feb 17", y: 0.051 },
      { x: "Mar 3", y: 0.048 },
      { x: "Mar 17", y: 0.057 },
      { x: "Mar 31", y: 0.062 },
    ],
  },
  {
    id: "other",
    label: "Other queue",
    emphasis: "muted",
    points: [
      { x: "Jan 6", y: 0.033 },
      { x: "Jan 20", y: 0.035 },
      { x: "Feb 3", y: 0.034 },
      { x: "Feb 17", y: 0.036 },
      { x: "Mar 3", y: 0.039 },
      { x: "Mar 17", y: 0.037 },
      { x: "Mar 31", y: 0.04 },
    ],
  },
]

export const deskAttention: AttentionItem[] = [
  {
    id: "qa-184",
    title: "Checkout stays pending after deploy",
    description: "Three shops reported the same timeout on release 4.2.",
    tone: "critical",
    chips: [
      { type: "priority", level: "critical" },
      { type: "date", label: "Apr 2" },
      { type: "progress", done: 1, total: 4 },
    ],
    onSelect: () => undefined,
  },
  {
    id: "qa-179",
    title: "Retry job double-charges a card",
    description: "Logs show two captures for one intent.",
    tone: "neutral",
    chips: [
      { type: "priority", level: "high" },
      { type: "status", label: "Needs repro", tone: "bad" },
    ],
    onSelect: () => undefined,
  },
  {
    id: "qa-166",
    title: "Invoice PDF misses the tax line",
    description: "Only shops on the new template.",
    tone: "positive",
    chips: [
      { type: "priority", level: "medium" },
      { type: "status", label: "Patch ready", tone: "good" },
    ],
    onSelect: () => undefined,
  },
]

export const deskCauses: RankedBarItem[] = [
  { id: "cache", label: "Stale cache", value: 7, meta: "7 · $1,840" },
  { id: "retry", label: "Retry race", value: 4, meta: "4 · $960" },
  { id: "template", label: "Template drift", value: 3, meta: "3 · $410" },
  { id: "auth", label: "Expired session", value: 2, meta: "2 · $220" },
]

export const deskCosts: BreakdownSegment[] = [
  { id: "engineering", label: "Engineering time", value: 2400 },
  { id: "credits", label: "Customer credits", value: 860 },
  { id: "vendor", label: "Vendor fees", value: 310 },
]

export const deskTimeline: RecordTimelineEvent[] = [
  {
    id: "opened",
    title: "Defect opened",
    date: "2026-03-28T15:10:00",
    description: "Shop reported a spinner that never finishes.",
    meta: "Inés · 12 min · 1 note",
    status: "default",
  },
  {
    id: "alert",
    title: "Customer wrote back",
    date: "2026-04-01T11:05:00",
    description: "The same order was still pending the next morning.",
    meta: "Nora · 4 min",
    status: "alert",
  },
  {
    id: "note",
    title: "Cache key compared",
    date: "2026-04-03T18:40:00",
    description: "The key ignored the release id.",
    status: "done",
  },
  {
    id: "wait",
    title: "Waiting on a canary",
    date: "2026-04-07T09:00:00",
    status: "pending",
  },
]

export const deskChoices: SuggestedChoice[] = [
  { id: "cache", label: "Stale cache after deploy", description: "Release id is missing from the key.", suggested: true },
  { id: "gateway", label: "Gateway timeout", description: "The provider answered after the client gave up." },
  { id: "data", label: "Bad fixture data", description: "Only the seed shop can reproduce it." },
]

export const deskFields: SuggestedChoiceField[] = [
  {
    id: "area",
    label: "Area",
    options: [
      { value: "checkout", label: "Checkout" },
      { value: "billing", label: "Billing" },
    ],
  },
  {
    id: "factor",
    label: "Contributing factor",
    options: [
      { value: "deploy", label: "Deploy" },
      { value: "load", label: "Load" },
    ],
  },
]

export const deskTiers: TierDistributionTier[] = [
  { id: "low", label: "Low", value: 6, tone: "chart-1" },
  { id: "medium", label: "Medium", value: 9, tone: "chart-2" },
  { id: "high", label: "High", value: 4, tone: "chart-4" },
  { id: "critical", label: "Critical", value: 2, tone: "destructive" },
]
