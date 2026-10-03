"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type Segment = {
  value: string
  label: string
  accessory?: React.ReactNode
}

export type SegmentedControlClassNames = {
  root?: string
  track?: string
  option?: string
  selection?: string
  label?: string
}

export type SegmentedControlProps = {
  options: Segment[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  onOptionIntent?: (value: string) => void
  className?: string
  classNames?: SegmentedControlClassNames
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  onOptionIntent,
  className,
  classNames,
}: SegmentedControlProps) {
  const id = React.useId()
  const reduced = useReducedMotion()
  const track = React.useRef<HTMLDivElement>(null)
  const [internal, setInternal] = React.useState(defaultValue ?? options[0]?.value ?? "")
  const selected = value ?? internal

  React.useLayoutEffect(() => {
    const node = track.current
    if (!node) return
    const edges = () => {
      const rest = node.scrollWidth - node.clientWidth - node.scrollLeft
      node.toggleAttribute("data-fade-start", node.scrollLeft > 1)
      node.toggleAttribute("data-fade-end", rest > 1)
    }
    edges()
    node.addEventListener("scroll", edges, { passive: true })
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(edges)
    observer?.observe(node)
    return () => {
      node.removeEventListener("scroll", edges)
      observer?.disconnect()
    }
  }, [options.length])

  const first = React.useRef(true)
  React.useEffect(() => {
    const node = track.current
    const button = node?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!node || !button || node.scrollWidth <= node.clientWidth) {
      first.current = false
      return
    }
    const room = 20
    const start = button.offsetLeft - room
    const end = button.offsetLeft + button.offsetWidth + room - node.clientWidth
    const left = node.scrollLeft > start ? start : node.scrollLeft < end ? end : node.scrollLeft
    if (left !== node.scrollLeft) node.scrollTo({ left: Math.max(0, left), behavior: first.current || reduced ? "auto" : "smooth" })
    first.current = false
  }, [selected, reduced])

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selected))

  function change(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1
    const target =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? selectedIndex === last
          ? 0
          : selectedIndex + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? selectedIndex === 0
            ? last
            : selectedIndex - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1
    if (target < 0 || !options[target]) return
    event.preventDefault()
    change(options[target].value)
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[target].value)}"]`)?.focus({ preventScroll: true })
  }

  return (
    <div
      data-slot="segmented-control"
      className={cn("inline-flex min-w-0 max-w-full shrink", className, classNames?.root)}
      role="group"
      aria-label={label}
    >
      <LayoutGroup id={id}>
        <motion.div
          ref={track}
          layoutScroll
          data-slot="segmented-control-track"
          className={cn(
            "flex min-w-0 gap-0.5 overflow-x-auto rounded-lg bg-muted p-0.5 [scrollbar-width:none]",
            classNames?.track,
          )}
        >
          {options.map((option, index) => {
            const pressed = selected === option.value
            return (
              <button
                key={option.value}
                id={`${id}-${option.value}`}
                type="button"
                data-slot="segmented-control-option"
                data-value={option.value}
                className={cn(
                  "relative min-h-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:text-foreground",
                  classNames?.option,
                )}
                aria-pressed={pressed}
                tabIndex={index === selectedIndex ? 0 : -1}
                onClick={() => change(option.value)}
                onKeyDown={onKeyDown}
                onPointerEnter={onOptionIntent ? () => onOptionIntent(option.value) : undefined}
                onFocus={onOptionIntent ? () => onOptionIntent(option.value) : undefined}
              >
                {pressed ? (
                  <motion.span
                    data-slot="segmented-control-selection"
                    className={cn("absolute inset-0 z-0 rounded-md border border-border bg-background shadow-sm", classNames?.selection)}
                    layoutId="selection"
                    layoutDependency={selected}
                    transition={reduced ? { duration: 0 } : motionPresets.spring.morph}
                    aria-hidden="true"
                  />
                ) : null}
                <span data-slot="segmented-control-label" className={cn("relative z-10 inline-flex items-center gap-1.5", classNames?.label)}>
                  {option.label}
                  {option.accessory}
                </span>
              </button>
            )
          })}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
