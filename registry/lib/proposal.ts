/**
 * Proposal workflow helpers. Data in, numbers out. No fetching and no theme.
 * Clean-room behavior: no product names, sample copy, or assets from any demo.
 */

import { moveItem } from "@/registry/retana/lib/reorder"

export const PROPOSAL_TABS = [
  "summary",
  "discovery",
  "scope",
  "similar",
  "estimate",
  "price",
  "risks",
  "proposal",
  "sow",
  "activity",
] as const

export type ProposalTabId = (typeof PROPOSAL_TABS)[number]

export type ProposalActionTone = "risk" | "price" | "low-confidence" | "follow-up"

export type ScopeOrigin = "adapted" | "edited" | "added"

export type ScopeTask = {
  id: string
  title: string
  hours: number
  origin?: ScopeOrigin
  included: boolean
}

export type ScopePhase = {
  id: string
  title: string
  tasks: readonly ScopeTask[]
}

export type ClarifyEffect = {
  id: string
  label: string
  hours: number
}

export type ClarifyOption = {
  value: string
  label: string
  effects: readonly ClarifyEffect[]
}

export type ClarifyQuestion = {
  id: string
  prompt: string
  detail?: string
  options: readonly ClarifyOption[]
}

export type ClarificationImpact = {
  previous: number
  next: number
  delta: number
  reasons: ClarifyEffect[]
  priceLow: number
  priceHigh: number
  weeksLow: number
  weeksHigh: number
}

export type EstimateLine = {
  id: string
  phase: string
  hours: number
  rate: number
  historicalHours: number
}

export type EstimateTotals = {
  hours: number
  amount: number
  historicalHours: number
}

export type PriceLineKind = "base" | "upsell" | "downsell"

export type PriceLine = {
  id: string
  label: string
  amount: number
  kind: PriceLineKind
}

export type ProposalSection = {
  id: string
  title: string
  body: string
}

export type PreflightItem = {
  id: string
  label: string
  done: boolean
}

export function scopeHours(phases: readonly ScopePhase[]): number {
  return phases.reduce(
    (sum, phase) =>
      sum + phase.tasks.reduce((inner, task) => inner + (task.included ? task.hours : 0), 0),
    0,
  )
}

export function phaseShares(phases: readonly ScopePhase[]) {
  return phases.map((phase) => ({
    key: phase.id,
    label: phase.title,
    value: phase.tasks.reduce((sum, task) => sum + (task.included ? task.hours : 0), 0),
  }))
}

export function toggleScopeTask(phases: readonly ScopePhase[], taskId: string): ScopePhase[] {
  return phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) =>
      task.id === taskId ? { ...task, included: !task.included } : task,
    ),
  }))
}

export function clarificationImpact({
  baseHours,
  questions,
  answers,
  rate,
  hoursPerWeek,
}: {
  baseHours: number
  questions: readonly ClarifyQuestion[]
  answers: Readonly<Record<string, string>>
  rate: number
  hoursPerWeek: number
}): ClarificationImpact {
  const reasons: ClarifyEffect[] = []
  for (const question of questions) {
    const chosen = answers[question.id]
    const option = question.options.find((item) => item.value === chosen)
    if (option) reasons.push(...option.effects)
  }
  const delta = reasons.reduce((sum, effect) => sum + effect.hours, 0)
  const next = Math.max(0, baseHours + delta)
  const weekly = hoursPerWeek > 0 ? hoursPerWeek : 1
  const safeRate = Number.isFinite(rate) ? rate : 0
  return {
    previous: baseHours,
    next,
    delta,
    reasons,
    priceLow: Math.round(next * safeRate * 0.92),
    priceHigh: Math.round(next * safeRate * 1.12),
    weeksLow: Math.round((next / weekly) * 10) / 10,
    weeksHigh: Math.round(((next / weekly) * 1.3) * 10) / 10,
  }
}

export function estimateAmount(line: EstimateLine): number {
  return line.hours * line.rate
}

export function estimateTotals(lines: readonly EstimateLine[]): EstimateTotals {
  return lines.reduce<EstimateTotals>(
    (totals, line) => ({
      hours: totals.hours + line.hours,
      amount: totals.amount + estimateAmount(line),
      historicalHours: totals.historicalHours + line.historicalHours,
    }),
    { hours: 0, amount: 0, historicalHours: 0 },
  )
}

export function priceTotal(lines: readonly PriceLine[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0)
}

export function clampPrice(value: number, min: number, max: number): number {
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  if (!Number.isFinite(value)) return low
  return Math.min(high, Math.max(low, value))
}

export function moveSection(sections: readonly ProposalSection[], id: string, direction: -1 | 1): ProposalSection[] {
  const from = sections.findIndex((section) => section.id === id)
  if (from < 0) return [...sections]
  return moveItem(sections, from, from + direction)
}

export function preflightReady(items: readonly PreflightItem[]): boolean {
  return items.length > 0 && items.every((item) => item.done)
}

export function shareRatio(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0
  return Math.max(0, Math.min(1, value / max))
}

export function formatHours(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)
}

export function formatMoney(value: number, locale = "en-US", currency = "USD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
