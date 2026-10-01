"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react"
import type { CSSProperties } from "react"
import { animate, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { WORLD, stats as exampleStats, worldLand } from "./stats-band-data"
import type { Stat, StatVisual } from "./stats-band-data"

export type { Stat, StatVisual } from "./stats-band-data"

export type StatsBandLayout = "plain" | "divided"

export interface StatsBandProps {
  /** Three or four stats read best. */
  stats?: Stat[]
  /** `plain` lets the stats float on whitespace; `divided` sets them in a hairline grid ruled above and below. */
  layout?: StatsBandLayout
  title?: string
  description?: string
  /** Seconds each number takes to count up. Defaults to 1.6. */
  duration?: number
  /** Number formatting locale. Fixed by default so server and client agree. */
  locale?: string
  className?: string
  classNames?: StatsBandClassNames
}

export type StatsBandClassNames = {
  root?: string
  header?: string
  title?: string
  stat?: string
  value?: string
  label?: string
  visual?: string
}

const REDUCE = "(prefers-reduced-motion: reduce)"
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCE)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useReducedMotionSafe() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCE).matches, () => false)
}

function useFormat(stat: Stat, locale: string) {
  return useMemo(() => {
    const decimals = stat.decimals ?? 0
    const digits = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" })
    if (stat.notation !== "compact") return { unit: "", format: (value: number) => digits.format(value) }
    const size = Math.abs(stat.value)
    const scale = size >= 1e12 ? 1e12 : size >= 1e9 ? 1e9 : size >= 1e6 ? 1e6 : size >= 1e3 ? 1e3 : 1
    const unit = scale === 1 ? "" : new Intl.NumberFormat(locale, { notation: "compact", numberingSystem: "latn" }).formatToParts(scale).find((part) => part.type === "compact")?.value ?? ""
    return { unit, format: (value: number) => digits.format(value / scale) }
  }, [stat.decimals, stat.notation, stat.value, locale])
}

function CountUp({ stat, run, delay, duration, reduced, locale, className }: { stat: Stat; run: boolean; delay: number; duration: number; reduced: boolean; locale: string; className?: string }) {
  const live = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  const { unit, format } = useFormat(stat, locale)
  const final = format(stat.value)
  const suffix = `${unit}${stat.suffix ?? ""}`
  const full = `${stat.prefix ?? ""}${final}${suffix}`

  useLayoutEffect(() => {
    if (reduced || done.current || !live.current) return
    live.current.textContent = format(0)
  }, [format, reduced])

  useEffect(() => {
    const node = live.current
    if (!node) return
    if (reduced) {
      node.textContent = final
      done.current = true
      return
    }
    if (!run || done.current) return
    const controls = animate(0, stat.value, {
      duration,
      delay,
      ease: [...motionPresets.ease.enter],
      onUpdate: (latest) => {
        node.textContent = format(latest)
      },
      onComplete: () => {
        node.textContent = final
        done.current = true
      },
    })
    return () => controls.stop()
  }, [run, reduced, stat.value, delay, duration, format, final])

  return (
    <>
      <span className="sr-only">{full}</span>
      <span data-slot="stats-band-value" data-value={full} className={cn("inline-flex items-baseline font-heading text-4xl font-medium tracking-tight whitespace-nowrap tabular-nums @min-[520px]/stats:text-5xl", className)} aria-hidden="true">
        {stat.prefix ? <span className="mr-[0.08em] text-[0.5em] text-muted-foreground">{stat.prefix}</span> : null}
        <span className="inline-grid justify-items-start">
          <span className="invisible col-start-1 row-start-1">{final}</span>
          <span ref={live} className="col-start-1 row-start-1">
            {final}
          </span>
        </span>
        {suffix ? <span className="ml-[0.1em] text-[0.5em] text-muted-foreground">{suffix}</span> : null}
      </span>
    </>
  )
}

function Trend({ values }: { values: number[] }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((value, index) => [values.length > 1 ? (index / (values.length - 1)) * 100 : 100, 36 - ((value - min) / span) * 32] as const)
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")
  const [endX, endY] = points[points.length - 1] ?? [100, 20]
  return (
    <div className="relative h-full">
      <svg className="size-full overflow-visible text-current" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path className="fill-current opacity-20" d={`${line} L100 40 L0 40 Z`} />
        <path className="fill-none stroke-current" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d={line} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-background" style={{ left: `${endX}%`, top: `${(endY / 40) * 100}%` }} />
    </div>
  )
}

function Bars({ values, dense, ink }: { values: number[]; dense?: boolean; ink: (value: number, index: number) => boolean }) {
  const peak = Math.max(...values.map((value) => Math.abs(value))) || 1
  return (
    <div className={cn("flex h-full items-end", dense ? "gap-0" : "gap-0.5")}>
      {values.map((value, index) => (
        <span
          key={index}
          className={cn("h-full min-w-0 flex-1 origin-bottom bg-border", ink(value, index) && "bg-current", dense && "rounded-none")}
          style={{ transform: `scaleY(${Math.min(1, Math.max(dense ? 0.3 : 0.04, Math.abs(value) / peak))})`, transitionDelay: `calc(var(--start) + ${index / values.length} * 420ms)` }}
        />
      ))}
    </div>
  )
}

const cellOf = (lon: number, lat: number) => {
  const x = Math.floor(((((lon - WORLD.west) % 360) + 360) % 360) / (WORLD.east - WORLD.west) * WORLD.columns)
  const y = Math.floor(((WORLD.north - lat) / (WORLD.north - WORLD.south)) * WORLD.rows)
  return [Math.min(WORLD.columns - 1, Math.max(0, x)), Math.min(WORLD.rows - 1, Math.max(0, y))] as const
}

function nearestLand(lon: number, lat: number) {
  const [x, y] = cellOf(lon, lat)
  let best = y * WORLD.columns + x
  let distance = Infinity
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const cx = x + dx
      const cy = y + dy
      if (cx < 0 || cy < 0 || cx >= WORLD.columns || cy >= WORLD.rows || !worldLand[cy * WORLD.columns + cx]) continue
      const d = dx * dx + dy * dy
      if (d < distance) {
        distance = d
        best = cy * WORLD.columns + cx
      }
    }
  }
  return best
}

function WorldMap({ points }: { points: [number, number][] }) {
  const lit = useMemo(() => new Set(points.map(([lon, lat]) => nearestLand(lon, lat))), [points])
  return (
    <svg className="h-full w-auto text-current" viewBox={`0 0 ${WORLD.columns} ${WORLD.rows}`} aria-hidden="true">
      {worldLand.map((land, index) =>
        land && !lit.has(index) ? <circle key={index} className="fill-border" cx={(index % WORLD.columns) + 0.5} cy={Math.floor(index / WORLD.columns) + 0.5} r={0.3} /> : null,
      )}
      {[...lit].map((index) => (
        <circle key={index} className="fill-current" cx={(index % WORLD.columns) + 0.5} cy={Math.floor(index / WORLD.columns) + 0.5} r={0.5} />
      ))}
    </svg>
  )
}

function Visual({ visual }: { visual: StatVisual }) {
  switch (visual.kind) {
    case "trend":
      return <Trend values={visual.values} />
    case "uptime":
      return <Bars dense values={visual.days} ink={(uptime) => uptime < 100} />
    case "distribution":
      return <Bars values={visual.bins} ink={(_, index) => index * (visual.max / visual.bins.length) < visual.marker} />
    case "map":
      return <WorldMap points={visual.points} />
  }
}

/**
 * A band of headline numbers. They count up the first time the band is in view, then the optional visual draws in.
 * Hover or keyboard focus swaps the detail line for one line of context.
 */
export const StatsBand = forwardRef<HTMLElement, StatsBandProps>(function StatsBand({
  stats = exampleStats,
  layout = "plain",
  title,
  description,
  duration = 1.6,
  locale = "en-US",
  className,
  classNames,
}, ref) {
  const id = useId()
  const list = useRef<HTMLDListElement>(null)
  const inView = useInView(list, { once: true, amount: 0.4 })
  const reduced = useReducedMotionSafe()
  const shown = inView || reduced
  const withVisuals = stats.some((stat) => stat.visual)
  return (
    <section
      ref={ref}
      data-slot="stats-band"
      data-layout={layout}
      data-in-view={shown ? "" : undefined}
      className={cn("@container/stats w-full min-w-0 bg-background text-foreground", className, classNames?.root)}
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-label={title ? undefined : "Key numbers"}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 @min-[520px]/stats:px-8 @min-[520px]/stats:py-16">
        {title || description ? (
          <header data-slot="stats-band-header" className={cn("mb-10 grid items-end gap-4 @min-[800px]/stats:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] @min-[800px]/stats:gap-12", classNames?.header)}>
            {title ? (
              <h2 id={`${id}-title`} className={cn("m-0 max-w-[16ch] font-heading text-3xl font-medium tracking-tight text-balance @min-[800px]/stats:text-4xl", classNames?.title)}>
                {title}
              </h2>
            ) : null}
            {description ? <p className="m-0 max-w-[34ch] text-pretty text-muted-foreground @min-[800px]/stats:justify-self-end">{description}</p> : null}
          </header>
        ) : null}
        <dl
          ref={list}
          data-slot="stats-band-list"
          data-count={Math.min(stats.length, 4)}
          className={cn(
            "m-0 grid gap-10",
            stats.length === 3 ? "grid-cols-1" : "grid-cols-1 @min-[520px]/stats:grid-cols-2 @min-[800px]/stats:grid-cols-4",
            stats.length !== 3 && stats.length > 1 && "@min-[800px]/stats:grid-cols-4",
            layout === "divided" && "gap-0 border-y border-border",
          )}
          style={{ "--draw": `${Math.round(duration * 420)}ms` } as CSSProperties}
        >
          {stats.map((stat, index) => (
            <div
              key={`${stat.label}-${index}`}
              data-slot="stats-band-stat"
              className={cn(
                "group relative flex min-w-0 flex-col text-muted-foreground outline-none hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring",
                layout === "divided" && "border-border py-8 @min-[800px]/stats:px-8 @min-[800px]/stats:first:pl-0 @min-[800px]/stats:last:pr-0 @min-[800px]/stats:not-first:border-l",
                layout === "divided" && index > 0 && "border-t @min-[800px]/stats:border-t-0",
                classNames?.stat,
              )}
              style={{ "--i": index, "--start": `calc(${index} * 90ms + var(--draw))` } as CSSProperties}
              tabIndex={stat.context ? 0 : undefined}
            >
              <dt className={cn("text-sm font-medium text-pretty text-foreground", classNames?.label)}>{stat.label}</dt>
              <dd className="order-first m-0 mb-5">
                <CountUp stat={stat} run={inView} delay={index * 0.09} duration={duration} reduced={reduced} locale={locale} className={classNames?.value} />
              </dd>
              {stat.detail || stat.context ? (
                <dd className="m-0 grid text-sm text-pretty text-muted-foreground">
                  {stat.detail ? <span className="col-start-1 row-start-1 group-hover:opacity-0 group-focus-visible:opacity-0">{stat.detail}</span> : null}
                  {stat.context ? <span className="col-start-1 row-start-1 text-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">{stat.context}</span> : null}
                </dd>
              ) : null}
              {withVisuals ? (
                <dd data-slot="stats-band-visual" className={cn("mt-auto flex h-14 items-end pt-6", !shown && "[&_.origin-bottom]:scale-y-0", classNames?.visual)} aria-hidden="true">
                  {stat.visual ? <Visual visual={stat.visual} /> : null}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
})

StatsBand.displayName = "StatsBand"
