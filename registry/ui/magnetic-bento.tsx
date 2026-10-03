"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import {
  MAGNETIC_BENTO_DURATION,
  MAGNETIC_BENTO_EASE,
  useMagneticIndicator,
} from "@/registry/retana/hooks/use-magnetic-indicator"

/**
 * One shared highlight for a bento grid.
 * The anchor-positioning idea is credited in NOTICE (jh3yy). This file is an independent implementation.
 */

export const MAGNETIC_BENTO_ACCENTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "primary"] as const

export type MagneticBentoAccent = (typeof MAGNETIC_BENTO_ACCENTS)[number]

export type MagneticBentoSpan = {
  col?: number
  row?: number
}

export type MagneticBentoClassNames = {
  root?: string
  grid?: string
  indicator?: string
  item?: string
  icon?: string
  index?: string
  title?: string
  description?: string
  cta?: string
}

const ACCENT_VAR: Record<MagneticBentoAccent, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
  primary: "var(--primary)",
}

const COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-2",
  3: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-3",
  4: "col-span-1 @min-[36rem]/mb:col-span-2 @min-[56rem]/mb:col-span-4",
}

const ROW_SPAN: Record<number, string> = {
  1: "row-span-1 min-h-40",
  2: "row-span-2 min-h-80",
  3: "row-span-3 min-h-96",
}

function clampSpan(value: number | undefined, max: number) {
  const next = Math.round(value ?? 1)
  if (!Number.isFinite(next)) return 1
  return Math.min(max, Math.max(1, next))
}

type BentoContextValue = {
  active: string | null
  select: (value: string | null) => void
  roving: boolean
  classNames: MagneticBentoClassNames
}

type ItemContextValue = {
  active: boolean
  classNames: MagneticBentoClassNames
}

const BentoContext = createContext<BentoContextValue | null>(null)
const ItemContext = createContext<ItemContextValue | null>(null)

function useBento() {
  const value = useContext(BentoContext)
  if (!value) throw new Error("Magnetic bento items belong inside MagneticBento.")
  return value
}

function useItem() {
  const value = useContext(ItemContext)
  if (!value) throw new Error("Magnetic bento slots belong inside MagneticBentoItem.")
  return value
}

function indicatorCss(scope: string, anchorName: string) {
  const indicator = `[data-mb="${scope}"] [data-slot="magnetic-bento-indicator"]`
  return `
    [data-mb="${scope}"] { --mb-dur: ${MAGNETIC_BENTO_DURATION}; --mb-ease: ${MAGNETIC_BENTO_EASE}; }
    ${indicator} {
      position: absolute;
      z-index: 0;
      pointer-events: none;
      left: 0;
      top: 0;
      position-anchor: ${anchorName};
      inset: anchor(inside);
      transition: inset var(--mb-dur) var(--mb-ease), background-color 200ms linear;
      background: color-mix(in oklch, var(--mb-accent, var(--primary)) 18%, var(--background));
    }
    .dark ${indicator} {
      background: color-mix(in oklch, var(--mb-accent, var(--primary)) 40%, var(--background));
    }
    ${indicator}[data-on="false"] { opacity: 0; }
    @media (prefers-reduced-motion: reduce) {
      ${indicator} { transition: opacity 120ms linear; }
    }
  `
}

export type MagneticBentoProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Controlled active card. `null` hides the highlight. */
  active?: string | null
  /** Card to light before the pointer or keyboard arrives. */
  defaultActive?: string | null
  onActiveChange?: (value: string | null) => void
  /** Keep the last card lit when the pointer leaves the grid. Default true. */
  persist?: boolean
  /** Arrow keys move the highlight. Default true. */
  roving?: boolean
  /** Accessible name for the group. */
  label?: string
  classNames?: MagneticBentoClassNames
}

export function MagneticBento({
  active,
  defaultActive = null,
  onActiveChange,
  persist = true,
  roving = true,
  label,
  className,
  classNames,
  style,
  children,
  onPointerLeave,
  onKeyDown,
  ...rest
}: MagneticBentoProps) {
  const controlled = active !== undefined
  const [internal, setInternal] = useState<string | null>(defaultActive)
  const current = controlled ? active : internal
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const { anchorName, supported, reduced } = useMagneticIndicator(gridRef, indicatorRef, current)
  const scope = anchorName.slice(2)

  const select = useCallback(
    (next: string | null) => {
      if (next === current) return
      if (!controlled) setInternal(next)
      onActiveChange?.(next)
    },
    [controlled, current, onActiveChange],
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    const grid = gridRef.current
    if (!root || !grid || !current) return
    const item = grid.querySelector<HTMLElement>(`[data-slot="magnetic-bento-item"][data-value="${CSS.escape(current)}"]`)
    const accent = item?.dataset.accent
    if (accent && accent in ACCENT_VAR) {
      root.style.setProperty("--mb-accent", ACCENT_VAR[accent as MagneticBentoAccent])
    }
  }, [current])

  const context = useMemo<BentoContextValue>(
    () => ({ active: current, select, roving, classNames: classNames ?? {} }),
    [classNames, current, roving, select],
  )

  const leave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event)
    if (event.defaultPrevented || persist) return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    if (event.currentTarget.contains(document.activeElement)) return
    select(null)
  }

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !roving) return
    const key = event.key
    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowUp" && key !== "ArrowDown" && key !== "Home" && key !== "End") return
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.closest("input, textarea, select, [contenteditable='true']")) return
    const grid = gridRef.current
    if (!grid) return
    const items = [...grid.querySelectorAll<HTMLElement>("[data-slot='magnetic-bento-item']")]
    const from = target.closest<HTMLElement>("[data-slot='magnetic-bento-item']")
    const index = from ? items.indexOf(from) : -1
    if (index < 0) return
    event.preventDefault()
    const rtl = getComputedStyle(grid).direction === "rtl"
    let next = index
    if (key === "Home") next = 0
    else if (key === "End") next = items.length - 1
    else {
      const horizontal = key === "ArrowLeft" || key === "ArrowRight"
      let direction = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1
      if (horizontal && rtl) direction *= -1
      next = (index + direction + items.length) % items.length
    }
    const item = items[next]
    const value = item?.dataset.value
    if (!item || value === undefined) return
    select(value)
    item.focus()
  }

  return (
    <BentoContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="magnetic-bento"
        data-mb={scope}
        data-anchor={anchorName}
        data-indicator={supported ? "anchor" : "fallback"}
        data-motion={reduced ? "reduce" : "ok"}
        role="group"
        aria-label={label}
        className={cn("@container/mb w-full min-w-0 text-foreground", className, classNames?.root)}
        style={style}
        {...rest}
        onPointerLeave={leave}
        onKeyDown={keyDown}
      >
        <style>{indicatorCss(scope, anchorName)}</style>
        <div
          ref={gridRef}
          data-slot="magnetic-bento-grid"
          className={cn(
            "relative isolate grid grid-cols-1 gap-4 @min-[36rem]/mb:grid-cols-2 @min-[56rem]/mb:grid-cols-4",
            classNames?.grid,
          )}
        >
          <div
            ref={indicatorRef}
            data-slot="magnetic-bento-indicator"
            data-on={current ? "true" : "false"}
            aria-hidden="true"
            className={cn("rounded-lg", classNames?.indicator)}
          />
          {children}
        </div>
      </div>
    </BentoContext.Provider>
  )
}

export type MagneticBentoItemProps = ComponentProps<"article"> & {
  value: string
  span?: MagneticBentoSpan
  accent?: MagneticBentoAccent
}

export function MagneticBentoItem({
  value,
  span,
  accent = "primary",
  className,
  style,
  children,
  onPointerEnter,
  onFocus,
  onClick,
  onKeyDown,
  ...rest
}: MagneticBentoItemProps) {
  const { active, select, roving, classNames } = useBento()
  const lit = active === value
  const col = clampSpan(span?.col, 4)
  const row = clampSpan(span?.row, 3)
  const itemStyle = {
    "--mb-item-accent": ACCENT_VAR[accent],
    ...style,
  } as CSSProperties

  return (
    <ItemContext.Provider value={{ active: lit, classNames }}>
      <article
        data-slot="magnetic-bento-item"
        data-value={value}
        data-accent={accent}
        data-active={lit ? "true" : "false"}
        tabIndex={roving ? (lit || active == null ? 0 : -1) : 0}
        className={cn(
          "relative z-10 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 rounded-lg border border-border bg-transparent p-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
          COL_SPAN[col],
          ROW_SPAN[row],
          className,
          classNames.item,
        )}
        style={itemStyle}
        {...rest}
        onPointerEnter={(event) => {
          select(value)
          onPointerEnter?.(event)
        }}
        onFocus={(event) => {
          select(value)
          onFocus?.(event)
        }}
        onClick={(event) => {
          select(value)
          onClick?.(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || event.key !== "Enter" || event.target !== event.currentTarget) return
          const cta = event.currentTarget.querySelector<HTMLElement>("[data-slot='magnetic-bento-cta']")
          if (!cta) return
          event.preventDefault()
          cta.click()
        }}
      >
        {children}
      </article>
    </ItemContext.Provider>
  )
}

export function MagneticBentoIcon({ className, children }: { className?: string; children?: ReactNode }) {
  const { active, classNames } = useItem()
  return (
    <div
      data-slot="magnetic-bento-icon"
      className={cn(
        "col-start-1 row-start-1 text-muted-foreground transition-colors duration-200 motion-reduce:transition-none",
        active && "text-[color:var(--mb-item-accent)]",
        className,
        classNames.icon,
      )}
    >
      {children}
    </div>
  )
}

export function MagneticBentoIndex({ className, children }: { className?: string; children?: ReactNode }) {
  const { classNames } = useItem()
  return (
    <div
      data-slot="magnetic-bento-index"
      className={cn("col-start-2 row-start-1 justify-self-end font-mono text-xs text-muted-foreground tabular-nums", className, classNames.index)}
    >
      {children}
    </div>
  )
}

export function MagneticBentoTitle({ className, children }: { className?: string; children?: ReactNode }) {
  const { classNames } = useItem()
  return (
    <h3
      data-slot="magnetic-bento-title"
      className={cn("col-span-2 row-start-2 text-base font-semibold tracking-tight wrap-anywhere", className, classNames.title)}
    >
      {children}
    </h3>
  )
}

export function MagneticBentoDescription({ className, children }: { className?: string; children?: ReactNode }) {
  const { classNames } = useItem()
  return (
    <p
      data-slot="magnetic-bento-description"
      className={cn("col-span-2 row-start-3 text-sm text-pretty text-muted-foreground wrap-anywhere", className, classNames.description)}
    >
      {children}
    </p>
  )
}

export type MagneticBentoCtaProps = ComponentProps<"a"> & {
  /** Render the child element, such as a router link, instead of an anchor. */
  asChild?: boolean
}

export function MagneticBentoCta({ asChild = false, className, children, ...rest }: MagneticBentoCtaProps) {
  const { active, classNames } = useItem()
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="magnetic-bento-cta"
      tabIndex={-1}
      className={cn(
        "col-span-2 row-start-4 inline-flex w-fit translate-y-1 items-center gap-1 self-end text-sm font-medium text-[color:var(--mb-item-accent)] opacity-0 transition-[opacity,transform] duration-[250ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-opacity",
        active && "translate-y-0 opacity-100",
        !active && "pointer-events-none",
        className,
        classNames.cta,
      )}
      {...rest}
    >
      {children}
    </Comp>
  )
}
