"use client"

import { Children, createContext, useContext, type ComponentProps, type ReactNode, type Ref } from "react"
import { motion, useReducedMotionConfig, type HTMLMotionProps, type Transition } from "motion/react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Cap on the last cell's delay, in seconds.
 * Same ceiling as stagger-list. Computed here so this branch does not import that primitive.
 */
export const BENTO_STAGGER_MAX_S = 0.4

/** Enter curve from motionPresets.ease.enter. Inlined so this item does not ship lib/motion. */
const enterEase = [0.16, 1, 0.3, 1] as [number, number, number, number]

/** motionPresets.duration.standard, in seconds. */
const BENTO_ENTER_S = 0.24

/** motionPresets.stagger.item, in seconds. */
const BENTO_STAGGER_STEP_S = 0.035

/** Delay for `index` so the last cell never waits longer than `maxTotal`. */
export function bentoStaggerDelay(
  index: number,
  count: number,
  step = BENTO_STAGGER_STEP_S,
  maxTotal = BENTO_STAGGER_MAX_S,
) {
  if (count <= 1 || index <= 0) return 0
  const last = count - 1
  const total = Math.min(Math.max(0, maxTotal), Math.max(0, step) * last)
  return (Math.min(index, last) / last) * total
}

/** A 390px container stays on one column. The next column starts at 30rem (480px). */
export const BENTO_ONE_COLUMN_UNTIL_PX = 390

/** Container width where two columns begin. 30rem = 480px. */
export const BENTO_MID_MIN_REM = 30

/** Container width where the requested column count begins. 56rem = 896px. */
export const BENTO_DESKTOP_MIN_REM = 56

export const BENTO_COLUMNS = [1, 2, 3, 4, 5, 6] as const

export type BentoColumns = (typeof BENTO_COLUMNS)[number]

export type BentoPreset = "default" | "magnetic"

export type BentoSpan = {
  col?: number
  row?: number
}

export type BentoGap = "sm" | "md" | "lg"

export type BentoStatus = "ready" | "loading" | "empty" | "error"

const GAP: Record<BentoGap, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
}

const DEFAULT_TRACK: Record<BentoColumns, string> = {
  1: "grid grid-cols-1",
  2: "grid grid-cols-1 @min-[30rem]/bento:grid-cols-2",
  3: "grid grid-cols-1 @min-[30rem]/bento:grid-cols-2 @min-[56rem]/bento:grid-cols-3",
  4: "grid grid-cols-1 @min-[30rem]/bento:grid-cols-2 @min-[56rem]/bento:grid-cols-4",
  5: "grid grid-cols-1 @min-[30rem]/bento:grid-cols-2 @min-[56rem]/bento:grid-cols-5",
  6: "grid grid-cols-1 @min-[30rem]/bento:grid-cols-2 @min-[56rem]/bento:grid-cols-6",
}

/** Published magnetic track. The named container `mb` stays on MagneticBento. */
const MAGNETIC_TRACK =
  "relative isolate grid grid-cols-1 gap-4 @min-[36rem]/mb:grid-cols-2 @min-[56rem]/mb:grid-cols-4"

const DEFAULT_COL: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 @min-[30rem]/bento:col-span-2 @min-[56rem]/bento:col-span-2",
  3: "col-span-1 @min-[30rem]/bento:col-span-2 @min-[56rem]/bento:col-span-3",
  4: "col-span-1 @min-[30rem]/bento:col-span-2 @min-[56rem]/bento:col-span-4",
  5: "col-span-1 @min-[30rem]/bento:col-span-2 @min-[56rem]/bento:col-span-5",
  6: "col-span-1 @min-[30rem]/bento:col-span-2 @min-[56rem]/bento:col-span-6",
}

const DEFAULT_ROW: Record<number, string> = {
  1: "row-span-1 min-h-40",
  2: "row-span-1 min-h-40 @min-[30rem]/bento:row-span-2 @min-[30rem]/bento:min-h-80",
  3: "row-span-1 min-h-40 @min-[30rem]/bento:row-span-2 @min-[30rem]/bento:min-h-80 @min-[56rem]/bento:row-span-3 @min-[56rem]/bento:min-h-96",
}

const MAGNETIC_COL: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-2",
  3: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-3",
  4: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-4",
}

const MAGNETIC_ROW: Record<number, string> = {
  1: "row-span-1 min-h-40",
  2: "row-span-2 min-h-80",
  3: "row-span-3 min-h-96",
}

function clampSpan(value: number | undefined, max: number) {
  const next = Math.round(value ?? 1)
  if (!Number.isFinite(next)) return 1
  return Math.min(max, Math.max(1, next))
}

export function bentoTrackClass(preset: BentoPreset, columns: BentoColumns, gap: BentoGap) {
  if (preset === "magnetic") return MAGNETIC_TRACK
  return cn(DEFAULT_TRACK[columns], GAP[gap])
}

export function bentoCellClass(span: BentoSpan | undefined, preset: BentoPreset, columns: BentoColumns) {
  const maxCol = preset === "magnetic" ? 4 : columns
  const col = clampSpan(span?.col, maxCol)
  const row = clampSpan(span?.row, 3)
  const colClass = (preset === "magnetic" ? MAGNETIC_COL : DEFAULT_COL)[col] ?? "col-span-1"
  const rowClass = (preset === "magnetic" ? MAGNETIC_ROW : DEFAULT_ROW)[row] ?? "row-span-1"
  return { col, row, className: cn("min-w-0", colClass, rowClass) }
}

type BentoContextValue = {
  preset: BentoPreset
  columns: BentoColumns
}

const BentoContext = createContext<BentoContextValue>({ preset: "default", columns: 4 })

type BentoEnter = { index: number; count: number }

const BentoEnterContext = createContext<BentoEnter | null>(null)

function useBentoGrid() {
  return useContext(BentoContext)
}

export type BentoGridClassNames = {
  root?: string
  track?: string
}

export type BentoGridProps = Omit<ComponentProps<"div">, "children"> & {
  /** Desktop column count. Default 4. Clamped to 1–6. */
  columns?: BentoColumns
  /** Accessible name for the group. */
  label?: string
  /** Spacing step. Default md (`gap-4`). */
  gap?: BentoGap
  /**
   * `magnetic` keeps the published MagneticBento track.
   * The host of that preset owns the `mb` container.
   */
  preset?: BentoPreset
  status?: BentoStatus
  emptyLabel?: string
  loadingLabel?: string
  errorLabel?: string
  trackRef?: Ref<HTMLElement>
  /** Overrides the track slot. MagneticBento passes its own. */
  trackSlot?: string
  classNames?: BentoGridClassNames
  children?: ReactNode
}

export function BentoGrid({
  columns = 4,
  label,
  gap = "md",
  preset = "default",
  status,
  emptyLabel = "Nothing to show",
  loadingLabel = "Loading",
  errorLabel = "Something went wrong",
  trackRef,
  trackSlot,
  className,
  classNames,
  children,
  ...rest
}: BentoGridProps) {
  const safeColumns = clampSpan(columns, 6) as BentoColumns
  const count = Children.count(children)
  const resolved: BentoStatus =
    status === "loading" || status === "error" || status === "empty" ? status : count === 0 ? "empty" : "ready"
  const context = { preset, columns: safeColumns }

  if (preset === "magnetic") {
    return (
      <BentoContext.Provider value={context}>
        <div
          ref={trackRef as Ref<HTMLDivElement>}
          data-slot={trackSlot ?? "bento-grid-track"}
          data-bento-preset="magnetic"
          className={cn(bentoTrackClass("magnetic", safeColumns, gap), className, classNames?.track)}
          {...rest}
        >
          {children}
        </div>
      </BentoContext.Provider>
    )
  }

  const trackClass = cn(bentoTrackClass("default", safeColumns, gap), "m-0 list-none p-0", classNames?.track)

  return (
    <BentoContext.Provider value={context}>
      <div
        data-slot="bento-grid"
        data-columns={safeColumns}
        data-state={resolved}
        role="group"
        aria-label={label}
        aria-busy={resolved === "loading" ? true : undefined}
        className={cn("@container/bento w-full min-w-0 text-foreground", className, classNames?.root)}
        {...rest}
      >
        {resolved === "empty" ? (
          <p data-slot="bento-grid-empty" className="max-w-[17.5rem] text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : null}
        {resolved === "error" ? (
          <p role="alert" data-slot="bento-grid-error" className="max-w-[17.5rem] text-sm font-medium text-destructive">
            {errorLabel}
          </p>
        ) : null}
        {resolved === "loading" ? (
          <div className="flex flex-col gap-3">
            <p className="max-w-[17.5rem] text-sm text-muted-foreground">{loadingLabel}</p>
            <ul data-slot="bento-grid-track" data-bento-preset="default" aria-hidden="true" className={trackClass}>
              <li className="min-h-40 rounded-xl bg-muted" />
              <li className="min-h-40 rounded-xl bg-muted" />
            </ul>
          </div>
        ) : null}
        {resolved === "ready" ? (
          <ul
            ref={trackRef as Ref<HTMLUListElement>}
            data-slot={trackSlot ?? "bento-grid-track"}
            data-bento-preset="default"
            data-stagger-max={BENTO_STAGGER_MAX_S}
            className={trackClass}
          >
            {Children.map(children, (child, index) => (
              <BentoEnterContext.Provider value={{ index, count }}>
                {child}
              </BentoEnterContext.Provider>
            ))}
          </ul>
        ) : null}
      </div>
    </BentoContext.Provider>
  )
}

export type BentoCellProps = Omit<ComponentProps<"li">, "children"> & {
  span?: BentoSpan
  /** Render the child element instead of a list item. */
  asChild?: boolean
  children?: ReactNode
}

export function BentoCell({ span, asChild = false, className, style, children, ...rest }: BentoCellProps) {
  const { preset, columns } = useBentoGrid()
  const enter = useContext(BentoEnterContext)
  const reduced = useReducedMotionConfig() === true
  const laid = bentoCellClass(span, preset, columns)
  const animateEnter = preset === "default" && enter != null && !asChild
  const delay = animateEnter ? bentoStaggerDelay(enter.index, enter.count) : 0
  const cellClass = cn(laid.className, preset === "default" && "h-full", className)

  if (animateEnter) {
    const transition: Transition = reduced
      ? { duration: 0 }
      : { duration: BENTO_ENTER_S, ease: enterEase, delay }
    return (
      <motion.li
        data-slot="bento-cell"
        data-bento-cell="true"
        data-col={laid.col}
        data-row={laid.row}
        data-motion={reduced ? "reduced" : "full"}
        data-enter-delay={delay}
        className={cellClass}
        style={style}
        {...(rest as HTMLMotionProps<"li">)}
        initial={reduced ? false : { opacity: 0, y: "0.7em" }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.li>
    )
  }

  const Comp = asChild ? Slot.Root : "li"
  return (
    <Comp
      {...(preset === "magnetic" ? {} : { "data-slot": "bento-cell" })}
      data-bento-cell="true"
      data-col={laid.col}
      data-row={laid.row}
      className={cellClass}
      style={style}
      {...rest}
    >
      {children}
    </Comp>
  )
}
