"use client"

/** Adapted from Arc UI (MIT). */

import { useId, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { Check, Minus } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { comparisonColumns, comparisonSections } from "./comparison-table-data"
import type { ComparisonColumn, ComparisonSection, ComparisonValue } from "./comparison-table-data"

export type { ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue } from "./comparison-table-data"

export interface ComparisonTableProps {
  title?: string
  description?: string
  columns?: ComparisonColumn[]
  sections?: ComparisonSection[]
  /** Hide rows where every visible column has the same value (controlled). */
  differencesOnly?: boolean
  defaultDifferencesOnly?: boolean
  onDifferencesOnlyChange?: (value: boolean) => void
  /** Label for the differences switch. */
  differencesLabel?: string
  /** Competitor shown beside yours in the stacked phone layout (controlled). */
  compareWith?: string
  onCompareWithChange?: (id: string) => void
  /** Call to action in your column. */
  cta?: { label: string; href?: string; onClick?: () => void; doneLabel?: string }
  /** Offset for the sticky header, such as the height of a fixed site header. Defaults to 0. */
  stickyTop?: number
  /** Caps the table height and scrolls it inside the block, with the header sticking to its top. */
  maxHeight?: number | string
  /** Width below which the table stacks into a two column comparison. Defaults to 640. */
  stackBelow?: number
  className?: string
  classNames?: ComparisonTableClassNames
}

export type ComparisonTableClassNames = {
  root?: string
  header?: string
  title?: string
  table?: string
  feature?: string
  cell?: string
  cta?: string
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial)
  const current = value !== undefined ? value : inner
  const set = (next: T) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function normalize(value: ComparisonValue | undefined) {
  if (value === undefined) return { value: false as const, note: undefined }
  if (typeof value === "object") return value
  return { value, note: undefined }
}

const keyOf = (value: ComparisonValue | undefined) => `${normalize(value).value}`

function Mark({ value, own, index, reduced }: { value: ComparisonValue | undefined; own: boolean; index: number; reduced: boolean }) {
  const { value: mark, note } = normalize(value)
  if (typeof mark === "string" && mark !== "partial") {
    return <span className={cn("text-sm tabular-nums", own ? "font-medium" : "text-muted-foreground")}>{mark}</span>
  }
  if (mark === true) {
    return (
      <span className="inline-grid justify-items-center gap-0.5">
        <svg className="size-5" viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="10" className={own ? "fill-primary" : "fill-muted"} />
          <motion.path
            d="M6.6 11.3l3 3 5.9-6.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={own ? "text-primary-foreground" : "text-foreground"}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: [...motionPresets.ease.enter], delay: own && !reduced ? 0.06 + Math.min(index, 12) * 0.035 : 0 }}
          />
        </svg>
        <span className="sr-only">Included</span>
      </span>
    )
  }
  if (mark === "partial") {
    return (
      <span className="inline-grid justify-items-center gap-0.5">
        <svg className="size-5 text-muted-foreground" viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 1.75a9.25 9.25 0 0 1 0 18.5z" fill="currentColor" />
        </svg>
        <span className="sr-only">Partial</span>
        {note ? <span className="max-w-28 text-center text-xs text-pretty text-muted-foreground">{note}</span> : null}
      </span>
    )
  }
  return (
    <span className="inline-grid justify-items-center">
      <Minus className="text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  )
}

/**
 * A feature comparison. Below `stackBelow` (and at 320px) it keeps your column and one competitor, with a keyboard-reachable picker for the rest.
 */
export function ComparisonTable({
  title = "How Relay compares",
  description = "Everything a growing team needs, without the enterprise price or the spreadsheet sprawl.",
  columns = comparisonColumns,
  sections = comparisonSections,
  differencesOnly: differencesProp,
  defaultDifferencesOnly = false,
  onDifferencesOnlyChange,
  differencesLabel = "Only differences",
  compareWith: compareProp,
  onCompareWithChange,
  cta,
  stickyTop = 0,
  maxHeight,
  stackBelow = 640,
  className,
  classNames,
}: ComparisonTableProps) {
  const reduced = !!useReducedMotion()
  const uid = useId()
  const rootRef = useRef<HTMLElement>(null)
  const [narrow, setNarrow] = useState(false)
  const [differencesOnly, setDifferencesOnly] = useControllable(differencesProp, defaultDifferencesOnly, onDifferencesOnlyChange)
  const own = columns.find((column) => column.highlight) ?? columns[0]
  const others = columns.filter((column) => column !== own)
  const [compareWith, setCompareWith] = useControllable(compareProp, others[0]?.id ?? own?.id ?? "", onCompareWithChange)
  const [ctaDone, setCtaDone] = useState(false)

  useLayoutEffect(() => {
    const node = rootRef.current
    if (!node) return
    const read = () => {
      const box = node.clientWidth
      const parent = node.parentElement?.clientWidth ?? box
      const viewport = window.innerWidth || box
      const width = Math.min(box || viewport, parent || viewport, viewport)
      setNarrow(width < stackBelow)
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [stackBelow])

  const visible = narrow ? columns.filter((column) => column === own || column.id === compareWith) : columns
  const differs = (values: Record<string, ComparisonValue>) => new Set(visible.map((column) => keyOf(values[column.id]))).size > 1
  const gridStyle = { gridTemplateColumns: `minmax(0, 1.4fr) repeat(${Math.max(visible.length, 1)}, minmax(0, 1fr))` } as CSSProperties
  let rowIndex = 0

  function onPickerKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (index + 1) % others.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (index - 1 + others.length) % others.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? others.length - 1
              : -1
    if (next < 0 || !others[next]) return
    event.preventDefault()
    setCompareWith(others[next].id)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(others[next].id)}"]`)?.focus()
  }

  return (
    <section
      ref={rootRef}
      data-slot="comparison-table"
      data-narrow={narrow ? "" : undefined}
      className={cn("@container/compare w-full max-w-full min-w-0 overflow-x-clip bg-background text-foreground", className, classNames?.root)}
      aria-labelledby={`${uid}-title`}
    >
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 @min-[640px]/compare:gap-8 @min-[640px]/compare:px-6 @min-[640px]/compare:py-12">
        <header data-slot="comparison-table-header" className={cn("flex flex-wrap items-end justify-between gap-6", classNames?.header)}>
          <div className="grid max-w-xl gap-3">
            <h2 id={`${uid}-title`} className={cn("m-0 font-heading text-3xl font-medium tracking-tight text-balance @min-[640px]/compare:text-4xl", classNames?.title)}>
              {title}
            </h2>
            {description ? <p className="m-0 text-pretty text-muted-foreground">{description}</p> : null}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground has-[:checked]:text-foreground">
            <span>{differencesLabel}</span>
            <Switch id={`${uid}-diff`} checked={differencesOnly} onCheckedChange={setDifferencesOnly} aria-label={differencesLabel} />
          </label>
        </header>

        {narrow && others.length > 1 ? (
          <div data-slot="comparison-table-picker" className="-mx-4 flex gap-0.5 overflow-x-auto px-4 [scrollbar-width:none]" role="group" aria-label={own ? `Compare ${own.name} with` : "Compare with"}>
            <LayoutGroup id={`${uid}-picker`}>
              {others.map((column, index) => {
                const pressed = column.id === compareWith
                return (
                  <button
                    key={column.id}
                    type="button"
                    data-value={column.id}
                    className="relative isolate h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:text-foreground"
                    aria-pressed={pressed}
                    tabIndex={pressed ? 0 : -1}
                    onClick={() => setCompareWith(column.id)}
                    onKeyDown={(event) => onPickerKey(event, index)}
                  >
                    {pressed ? (
                      <motion.span layoutId={`${uid}-pick`} className="absolute inset-0 -z-10 rounded-full bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.morph} />
                    ) : null}
                    <span className="relative">{column.name}</span>
                  </button>
                )
              })}
            </LayoutGroup>
          </div>
        ) : null}

        <div
          data-slot="comparison-table-scroller"
          className="relative min-w-0 overscroll-contain"
          style={maxHeight !== undefined ? { maxHeight, overflowY: "auto" } : undefined}
          tabIndex={maxHeight !== undefined ? 0 : undefined}
          aria-label={maxHeight !== undefined ? title : undefined}
          role={maxHeight !== undefined ? "region" : undefined}
        >
          <div role="table" aria-labelledby={`${uid}-title`} data-slot="comparison-table-grid" className={cn("grid min-w-0", classNames?.table)}>
            <div role="rowgroup" className="sticky z-10 bg-background/95 backdrop-blur" style={{ top: stickyTop }}>
              <div role="row" className="grid border-b border-border" style={gridStyle}>
                <div role="columnheader" className="min-h-16">
                  <span className="sr-only">Feature</span>
                </div>
                {visible.map((column) => (
                  <div key={column === own ? "own" : narrow ? "other" : column.id} role="columnheader" data-own={column === own ? "" : undefined} className={cn("grid min-h-16 place-items-end justify-items-center overflow-hidden px-2 py-4 text-center", column === own && "rounded-t-xl bg-primary/10")}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={column.id}
                        className="grid gap-0.5"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
                      >
                        <span className={cn("text-base font-medium break-words", column === own && "text-primary")}>{column.name}</span>
                        {column.caption ? <span className="text-xs text-muted-foreground tabular-nums">{column.caption}</span> : null}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {sections.map((section) => {
              const rows = differencesOnly ? section.rows.filter((row) => differs(row.values)) : section.rows
              return (
                <div role="rowgroup" key={section.id} className="contents">
                  <AnimatePresence initial={false}>
                    {rows.length > 0 ? (
                      <motion.div
                        key="title"
                        role="row"
                        className="grid overflow-hidden"
                        style={gridStyle}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
                      >
                        <div role="rowheader" className="px-0 pt-8 pb-2 text-xs font-medium text-muted-foreground">
                          {section.title}
                        </div>
                        {visible.map((column) => (
                          <div key={column.id} role="cell" data-own={column === own ? "" : undefined} className={cn(column === own && "bg-primary/10")} />
                        ))}
                      </motion.div>
                    ) : null}
                    {rows.map((row) => {
                      const index = rowIndex++
                      return (
                        <motion.div
                          key={row.id}
                          role="row"
                          className="grid overflow-hidden"
                          style={gridStyle}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
                        >
                          <div role="rowheader" data-slot="comparison-table-feature" className={cn("grid min-w-0 content-center gap-0.5 border-b border-border py-3 pr-3 text-sm font-medium break-words", classNames?.feature)}>
                            <span>{row.feature}</span>
                            {row.hint ? <span className="text-xs font-normal text-muted-foreground">{row.hint}</span> : null}
                          </div>
                          {visible.map((column) => (
                            <div key={column === own ? "own" : narrow ? "other" : column.id} role="cell" data-slot="comparison-table-cell" data-own={column === own ? "" : undefined} className={cn("grid place-items-center border-b border-border p-2 text-center", column === own && "bg-primary/10", classNames?.cell)}>
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                  key={column.id}
                                  className="grid place-items-center"
                                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                                  transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}
                                >
                                  <Mark value={row.values[column.id]} own={column === own} index={index} reduced={reduced} />
                                </motion.span>
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )
            })}

            <div role="rowgroup">
              <div role="row" className="grid" style={gridStyle}>
                <div role="cell" className="flex flex-col flex-wrap gap-2 pt-5 pr-4 text-xs text-muted-foreground @min-[640px]/compare:flex-row">
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="size-4" viewBox="0 0 22 22" aria-hidden="true">
                      <circle cx="11" cy="11" r="10" className="fill-muted" />
                      <path d="M6.6 11.3l3 3 5.9-6.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                    Included
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 22 22" aria-hidden="true">
                      <circle cx="11" cy="11" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M11 1.75a9.25 9.25 0 0 1 0 18.5z" fill="currentColor" />
                    </svg>
                    Partial
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Minus className="size-3.5" aria-hidden="true" />
                    Not included
                  </span>
                </div>
                {visible.map((column) => (
                  <div key={column.id} role="cell" data-own={column === own ? "" : undefined} className={cn("grid place-items-center px-1 pt-5 pb-5", column === own && "rounded-b-xl bg-primary/10")}>
                    {column === own && cta ? (
                      cta.href && !cta.onClick ? (
                        <a data-slot="comparison-table-cta" className={cn("inline-flex h-8 max-w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground no-underline hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", classNames?.cta)} href={cta.href}>
                          {cta.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          data-slot="comparison-table-cta"
                          data-done={ctaDone ? "" : undefined}
                          className={cn(
                            "inline-flex h-8 max-w-full items-center justify-center overflow-hidden rounded-full px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            ctaDone ? "bg-primary/15 text-primary" : "bg-primary text-primary-foreground hover:bg-primary/80",
                            classNames?.cta,
                          )}
                          onClick={() => {
                            cta.onClick?.()
                            if (cta.doneLabel) setCtaDone(true)
                          }}
                        >
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={ctaDone ? "done" : "idle"}
                              className="inline-flex items-center gap-1.5"
                              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: `blur(${motionPresets.blur.subtle}px)` }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: `blur(${motionPresets.blur.subtle}px)` }}
                              transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}
                            >
                              {ctaDone ? (
                                <>
                                  <Check aria-hidden="true" />
                                  {cta.doneLabel}
                                </>
                              ) : (
                                cta.label
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </button>
                      )
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {differencesOnly ? "Showing only rows that differ" : "Showing all rows"}
        </p>
      </div>
    </section>
  )
}
