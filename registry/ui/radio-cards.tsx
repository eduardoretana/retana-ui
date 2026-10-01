"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type RadioCardOption = {
  value: string
  label: React.ReactNode
  /** One or two short lines under the label. */
  description?: React.ReactNode
  /** A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. */
  meta?: React.ReactNode
  /** Plain decorative icon beside the label. */
  icon?: React.ReactNode
  disabled?: boolean
  /** Short reason shown in place of the description when the option is disabled. */
  disabledReason?: React.ReactNode
}

export type RadioCardsClassNames = {
  root?: string
  card?: string
  indicator?: string
  label?: string
  description?: string
  meta?: string
}

export type RadioCardsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  options: RadioCardOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** "grid" places cards in responsive columns; "list" stacks full width rows. */
  layout?: "grid" | "list"
  /** Narrowest a grid column may get before the grid drops a column, in px. */
  minColumnWidth?: number
  /** Form field name. Renders a hidden input with the selected value. */
  name?: string
  required?: boolean
  disabled?: boolean
  classNames?: RadioCardsClassNames
}

type Bezier = [number, number, number, number]
const standard = [...motionPresets.ease.standard] as Bezier

const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}

const GLIDE = physical(0.42, 0.14)
const subscribe = () => () => {}

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export const RadioCards = React.forwardRef<HTMLDivElement, RadioCardsProps>(function RadioCards(
  {
    options,
    value,
    defaultValue = null,
    onValueChange,
    layout = "grid",
    minColumnWidth = 180,
    name,
    required,
    disabled = false,
    className,
    classNames,
    style,
    ...rest
  },
  forwardedRef,
) {
  const reduced = useReducedFlag()
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const rootRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement)
  const [internal, setInternal] = React.useState<string | null>(defaultValue)
  const selected = value !== undefined ? value : internal
  const selectedIndex = options.findIndex((option) => option.value === selected)
  const usable = (option: RadioCardOption) => !disabled && !option.disabled
  const tabStop = selectedIndex >= 0 && usable(options[selectedIndex]) ? selectedIndex : options.findIndex(usable)

  const select = (next: string) => {
    if (next === selected) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const w = useMotionValue(0)
  const h = useMotionValue(0)
  const o = useMotionValue(0)
  const placed = React.useRef(false)
  const place = React.useCallback(
    (spring: boolean) => {
      const node = selectedIndex < 0 ? null : rootRef.current?.querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`)
      if (!node) {
        o.set(0)
        placed.current = false
        return
      }
      const box = [node.offsetLeft, node.offsetTop, node.offsetWidth, node.offsetHeight]
      if (!spring || !placed.current || reduced) {
        x.jump(box[0])
        y.jump(box[1])
        w.jump(box[2])
        h.jump(box[3])
        if (!placed.current && !reduced && spring) {
          o.jump(0)
          animate(o, 1, { duration: 0.18, ease: standard })
        } else o.jump(1)
        placed.current = true
        return
      }
      animate(x, box[0], GLIDE)
      animate(y, box[1], GLIDE)
      animate(w, box[2], GLIDE)
      animate(h, box[3], GLIDE)
      o.set(1)
    },
    [h, o, reduced, selectedIndex, w, x, y],
  )

  const placeRef = React.useRef(place)
  React.useLayoutEffect(() => {
    placeRef.current = place
    place(true)
  }, [place])
  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => placeRef.current(false))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const cards = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      if (usable(options[index])) select(options[index].value)
      return
    }
    if (!step && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    const count = options.length
    const rtl = step && (event.key === "ArrowLeft" || event.key === "ArrowRight") && getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1
    let at = event.key === "Home" ? -1 : event.key === "End" ? count : index
    const dir = event.key === "Home" ? 1 : event.key === "End" ? -1 : step * rtl
    for (let tries = 0; tries < count; tries++) {
      at = (at + dir + count) % count
      if (usable(options[at])) {
        cards()[at]?.focus()
        select(options[at].value)
        return
      }
    }
  }

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      data-slot="radio-cards"
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      data-layout={layout}
      className={cn(
        "relative grid min-w-0 max-w-full gap-2.5 text-sm text-foreground",
        layout === "grid" && "grid-cols-[repeat(auto-fill,minmax(min(100%,var(--min-column,180px)),1fr))]",
        layout === "list" && "grid-cols-1 gap-2",
        className,
        classNames?.root,
      )}
      style={{ "--min-column": `${minColumnWidth}px`, ...style } as React.CSSProperties}
      {...rest}
    >
      <motion.span
        className="pointer-events-none absolute top-0 left-0 z-10 rounded-lg border-2 border-primary"
        style={{ x, y, width: w, height: h, opacity: o }}
        aria-hidden="true"
      />
      {options.map((option, index) => {
        const checked = index === selectedIndex
        const off = !usable(option)
        const labelId = `${uid}-${index}-label`
        const descriptionId = `${uid}-${index}-description`
        const description = off && option.disabledReason ? option.disabledReason : option.description
        return (
          <div
            key={option.value}
            role="radio"
            data-card={index}
            data-slot="radio-cards-card"
            className={cn(
              "relative grid min-w-0 cursor-pointer gap-x-3 gap-y-1 rounded-lg border border-border bg-card p-3.5 select-none hover:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[checked]:bg-accent aria-disabled:cursor-not-allowed aria-disabled:bg-muted",
              layout === "grid" && "grid-cols-[minmax(0,1fr)_auto] content-start [grid-template-areas:'body_indicator''meta_meta']",
              layout === "list" && "grid-cols-[auto_minmax(0,1fr)_auto] items-center py-3 pr-4 pl-3.5 [grid-template-areas:'indicator_body_meta']",
              classNames?.card,
            )}
            aria-checked={checked}
            aria-disabled={off || undefined}
            aria-labelledby={labelId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={index === tabStop ? 0 : -1}
            data-checked={checked || undefined}
            onClick={() => {
              if (!off) select(option.value)
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span
              className={cn(
                "grid size-[18px] place-items-center rounded-full border border-input [grid-area:indicator]",
                checked && "border-primary bg-primary",
                off && "border-border",
                classNames?.indicator,
              )}
              aria-hidden="true"
            >
              <motion.span
                className="size-1.5 rounded-full bg-primary-foreground"
                initial={false}
                animate={{ scale: checked ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}
              />
            </span>
            <span className="grid min-w-0 gap-0.5 [grid-area:body]">
              <span id={labelId} className={cn("flex min-w-0 items-center gap-2 font-medium", off && "text-muted-foreground", classNames?.label)}>
                {option.icon ? <span className="grid size-[18px] shrink-0 place-items-center text-muted-foreground [&_svg]:size-[18px]">{option.icon}</span> : null}
                <span className="min-w-0 truncate">{option.label}</span>
              </span>
              {description ? (
                <span id={descriptionId} className={cn("text-xs text-muted-foreground break-all", classNames?.description)}>
                  {description}
                </span>
              ) : null}
            </span>
            {option.meta ? (
              <span
                className={cn(
                  "text-foreground tabular-nums [grid-area:meta]",
                  off && "text-muted-foreground",
                  layout === "grid" && "mt-2.5 text-lg",
                  layout === "list" && "font-medium whitespace-nowrap",
                  classNames?.meta,
                )}
              >
                {option.meta}
              </span>
            ) : null}
          </div>
        )
      })}
      {name ? <input type="hidden" name={name} value={selected ?? ""} required={required} /> : null}
    </div>
  )
})
