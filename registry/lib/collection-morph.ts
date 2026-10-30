/**
 * Generic shared-element morph for a collection.
 * No domain: callers pass ids. The spring is critically damped (bounce 0,
 * no overshoot) and the visual duration stays inside 0.6–0.8s.
 * Motion runs on transform and opacity only (FLIP via layoutId).
 */

import type { Transition } from "motion/react"

export const COLLECTION_MORPH_MIN_S = 0.6
export const COLLECTION_MORPH_MAX_S = 0.8

/** ~30% of the track. The timeline sidebar uses this share. */
export const COLLECTION_TIMELINE_SIDEBAR = 0.3

const DAY_MS = 86_400_000

/**
 * Critically damped spring. `bounce: 0` is the no-overshoot setting in Motion.
 * `visualDuration` is the perceived length, inside 0.6–0.8s.
 */
export const collectionMorphSpring = {
  type: "spring" as const,
  visualDuration: 0.7,
  bounce: 0,
}

/** Card-only or row-only copy fades in this window. It does not move. */
export const collectionExclusiveFade: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
}

/** Reduced motion: opacity only, no shared layout. */
export const collectionReducedFade: Transition = {
  duration: 0.2,
  ease: [0, 0, 0.58, 1],
}

export type CollectionMorphMode = "morph" | "crossfade"

export type CollectionMorphSlot = "group" | "shell" | "title" | "people"

export function collectionMorphMode(reduced: boolean | null | undefined): CollectionMorphMode {
  return reduced ? "crossfade" : "morph"
}

export function collectionLayoutId(scope: string, slot: CollectionMorphSlot, id: string) {
  return `${scope}:${slot}:${id}`
}

export function collectionSharedMotion(reduced: boolean, scope: string, slot: CollectionMorphSlot, id: string) {
  if (reduced) return { transition: { duration: 0 } as Transition }
  const positionOnly = slot === "title" || slot === "people"
  return {
    layout: positionOnly ? ("position" as const) : true,
    layoutId: collectionLayoutId(scope, slot, id),
    transition: collectionMorphSpring,
  }
}

export function collectionExclusiveMotion(reduced: boolean) {
  const transition = reduced ? collectionReducedFade : collectionExclusiveFade
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition,
  }
}

/** Timeline bars grow on X. scaleX is a transform; position is not animated. */
export function collectionBarMotion(reduced: boolean) {
  if (reduced) return collectionExclusiveMotion(true)
  return {
    initial: { opacity: 0, scaleX: 0 },
    animate: { opacity: 1, scaleX: 1 },
    exit: { opacity: 0, scaleX: 0 },
    transition: { opacity: collectionExclusiveFade, scaleX: collectionMorphSpring },
  }
}

export function collectionSurfaceMotion(visible: boolean, reduced: boolean) {
  return {
    initial: false as const,
    animate: { opacity: visible ? 1 : 0 },
    transition: reduced ? ({ duration: 0 } as Transition) : collectionExclusiveFade,
  }
}

export function parseCollectionDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const time = Date.UTC(year, month - 1, day)
  const check = new Date(time)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null
  return time
}

export function formatCollectionDay(time: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(time))
}

export type CollectionDomain = {
  /** Inclusive start, UTC midnight. */
  start: number
  /** Exclusive end, UTC midnight. */
  end: number
}

export function collectionDomain(
  spans: readonly { start?: string | undefined; end?: string | undefined }[],
  today: number,
  padDays = 1,
): CollectionDomain {
  const times = [today, today + DAY_MS]
  for (const span of spans) {
    const start = span.start ? parseCollectionDay(span.start) : null
    const end = span.end ? parseCollectionDay(span.end) : null
    if (start != null) times.push(start)
    if (end != null) times.push(end + DAY_MS)
  }
  const pad = padDays * DAY_MS
  return { start: Math.min(...times) - pad, end: Math.max(...times) + pad }
}

export type CollectionBar = {
  origin: number
  scale: number
}

export function collectionBar(start: number, end: number, domain: CollectionDomain): CollectionBar | null {
  if (end < start) return null
  const span = domain.end - domain.start
  if (span <= 0) return null
  const visibleStart = Math.max(start, domain.start)
  const visibleEnd = Math.min(end + DAY_MS, domain.end)
  const scale = (visibleEnd - visibleStart) / span
  if (scale <= 0) return null
  const origin = (visibleStart - domain.start) / span
  return { origin: clamp01(origin), scale: clamp01(scale) }
}

export type CollectionTick = {
  time: number
  percent: number
  label: string
}

export function collectionTicks(domain: CollectionDomain, locale: string): CollectionTick[] {
  const span = domain.end - domain.start
  if (span <= 0) return []
  const days = Math.max(1, Math.round(span / DAY_MS))
  const rough = Math.ceil(days / 5)
  const step = rough > 10 ? 14 : rough > 5 ? 7 : rough > 2 ? 2 : 1
  const ticks: CollectionTick[] = []
  for (let time = domain.start; time < domain.end; time += step * DAY_MS) {
    ticks.push({
      time,
      percent: ((time - domain.start) / span) * 100,
      label: formatCollectionDay(time, locale),
    })
  }
  return ticks
}

/** Percent across the domain, or null when the instant falls outside it. */
export function collectionMark(time: number, domain: CollectionDomain): number | null {
  const span = domain.end - domain.start
  if (span <= 0 || time < domain.start || time >= domain.end) return null
  return ((time - domain.start) / span) * 100
}

export function collectionCoversDay(start: string | undefined, end: string | undefined, day: number) {
  const from = start ? parseCollectionDay(start) : null
  const to = end ? parseCollectionDay(end) : null
  if (from == null || to == null) return false
  return day >= from && day <= to
}

export function collectionQueryMatch(item: { title: string; detail?: string | undefined }, query: string) {
  const needle = query.trim().toLocaleLowerCase("es-MX")
  if (!needle) return true
  return `${item.title}\n${item.detail ?? ""}`.toLocaleLowerCase("es-MX").includes(needle)
}

function clamp01(value: number) {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}
