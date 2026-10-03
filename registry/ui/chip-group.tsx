"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type TargetAndTransition,
  type Transition,
} from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ChipOption = {
  value: string
  label: string
}

export type ChipGroupClassNames = {
  root?: string
  chip?: string
  more?: string
  label?: string
}

export type ChipGroupProps = {
  options: ChipOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  /** Accessible name of the group, such as “Topics”. */
  label: string
  /** Allow several chips at once. In single mode the selected chip can still be cleared. */
  multiple?: boolean
  /** Chips shown before the rest fold behind a “+N more” chip. Chips selected when it folds stay in view. */
  maxVisible?: number
  className?: string
  classNames?: ChipGroupClassNames
}

const MORE = "\u0000more"
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const enterEase = [...motionPresets.ease.enter] as [number, number, number, number]
const fade: Transition = { duration: motionPresets.duration.fast, ease: standard }
const reducedFade: Transition = { duration: 0.15, ease: standard }
const exitFast: Transition = { duration: motionPresets.duration.fast, ease: standard }
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" }
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }
const textOut: TargetAndTransition = {
  opacity: 0,
  y: "-0.3em",
  filter: `blur(${motionPresets.blur.subtle}px)`,
  transition: exitFast,
}

const SLOT = 18

function useWidthLag(node: React.RefObject<HTMLElement | null>, key: string, reduce: boolean) {
  const lag = useMotionValue(0)
  const width = React.useRef<number | null>(null)
  React.useLayoutEffect(() => {
    const element = node.current
    if (!element) return
    const next = element.offsetWidth
    const previous = width.current
    width.current = next
    if (previous === null || previous === next) return
    if (reduce) {
      lag.jump(0)
      return
    }
    const velocity = lag.getVelocity()
    lag.jump(lag.get() + previous - next)
    animate(lag, 0, { ...motionPresets.spring.morph, velocity })
  }, [key, lag, node, reduce])
  React.useEffect(() => {
    const element = node.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      width.current = element.offsetWidth
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [node])
  return lag
}

function HeightFrame({ morphKey, reduce, children }: { morphKey: string; reduce: boolean; children: React.ReactNode }) {
  const frame = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | "auto">("auto")
  const changedAt = React.useRef(0)
  React.useLayoutEffect(() => {
    changedAt.current = performance.now()
  }, [morphKey])
  React.useEffect(() => {
    const node = content.current
    if (!node || typeof ResizeObserver === "undefined") return
    let last: number | undefined
    let controls: { stop: () => void } | undefined
    const settle = () => {
      height.jump("auto")
      if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto", minHeight: "" })
    }
    const unfollow = height.on("change", (value) => {
      if (frame.current) frame.current.style.minHeight = typeof value === "number" ? `${value}px` : ""
    })
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      const current = height.get()
      const from = typeof current === "number" ? current : last
      last = next
      controls?.stop()
      if (reduce || from === undefined || Math.abs(from - next) < 0.5 || performance.now() - changedAt.current > 160) return settle()
      if (frame.current) Object.assign(frame.current.style, { overflow: "clip", height: `${from}px`, minHeight: `${from}px` })
      controls = animate(height, [from, next], { ...motionPresets.spring.smooth, onComplete: settle })
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      unfollow()
      controls?.stop()
    }
  }, [height, reduce])
  return (
    <motion.div ref={frame} className="min-w-0" style={{ height }}>
      <div ref={content} className="relative">
        {children}
      </div>
    </motion.div>
  )
}

function Swap({ follow, style, ...props }: HTMLMotionProps<"span"> & { follow?: MotionValue<number> }) {
  const present = useIsPresent()
  const held = useMotionValue(0)
  React.useLayoutEffect(() => {
    if (!present && follow) held.jump(follow.get())
  }, [present, follow, held])
  return (
    <motion.span
      {...props}
      style={follow ? { ...style, x: present ? follow : held } : style}
      aria-hidden={present ? props["aria-hidden"] : true}
    />
  )
}

function Chip({
  option,
  selected,
  tabbable,
  reduce,
  delay,
  className,
  labelClassName,
  onToggle,
  onFocusChip,
}: {
  option: ChipOption
  selected: boolean
  tabbable: boolean
  reduce: boolean
  delay: number
  className?: string
  labelClassName?: string
  onToggle: (value: string) => void
  onFocusChip: (value: string) => void
}) {
  const present = useIsPresent()
  const body = React.useRef<HTMLSpanElement>(null)
  const lag = useWidthLag(body, String(selected), reduce)
  const slot = React.useRef(selected ? SLOT : 0)
  const grown = useMotionValue(selected ? 1 : 0)
  const edge = useTransform(lag, (value) => -value)
  const checkScale = useTransform(grown, (value) => Math.min(value, 1.1))
  const checkOpacity = useTransform(grown, (value) => Math.min(1, value * 1.4))
  const checkBlur = useTransform(grown, (value) =>
    value >= 1 ? "none" : `blur(${((1 - value) * motionPresets.blur.subtle).toFixed(2)}px)`,
  )
  const checkDraw = useTransform(grown, (value) => Math.min(1, Math.max(0.001, value)))
  React.useLayoutEffect(() => {
    slot.current = selected ? SLOT : 0
    const update = () => grown.set(Math.max(0, (slot.current + lag.get()) / SLOT))
    update()
    return lag.on("change", update)
  }, [selected, lag, grown])
  const enter: Transition = reduce
    ? { layout: { duration: 0 }, default: reducedFade }
    : { layout: motionPresets.spring.morph, default: { ...motionPresets.spring.snappy, delay }, opacity: { ...fade, delay } }
  return (
    <motion.button
      type="button"
      className={cn(
        "group relative z-10 inline-flex max-w-full cursor-pointer rounded-full border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:text-foreground motion-reduce:transition-none",
        className,
      )}
      data-chip={option.value}
      data-slot="chip-group-chip"
      aria-pressed={selected}
      aria-hidden={present ? undefined : true}
      tabIndex={present && tabbable ? 0 : -1}
      onClick={() => onToggle(option.value)}
      onFocus={() => onFocusChip(option.value)}
      layout="position"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        reduce
          ? { opacity: 0, transition: reducedFade }
          : { opacity: 0, scale: 0.9, transition: { duration: motionPresets.duration.instant, ease: standard } }
      }
      transition={enter}
    >
      <span
        ref={body}
        className="relative isolate inline-flex h-8 min-w-0 items-center px-3.5 transition-transform group-active:scale-[0.97] motion-reduce:transition-none motion-reduce:group-active:scale-100"
        data-selected={selected || undefined}
      >
        <motion.span
          className={cn(
            "absolute inset-y-0 left-0 -z-10 rounded-full border border-border bg-background",
            selected && "border-primary bg-primary/10",
          )}
          style={{ right: edge }}
          aria-hidden="true"
        />
        <motion.span
          className="absolute top-[calc(50%-7px)] left-3 grid size-3.5 origin-left place-items-center text-primary"
          style={{ scale: checkScale, opacity: checkOpacity, filter: checkBlur }}
          aria-hidden="true"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M4 12.5 9.5 18 20 6.5" style={{ pathLength: checkDraw }} />
          </svg>
        </motion.span>
        <span className={cn("w-0 shrink-0", selected && "w-[18px]")} aria-hidden="true" />
        <motion.span className={cn("min-w-0 truncate", labelClassName)} style={{ x: lag }}>
          {option.label}
        </motion.span>
      </span>
    </motion.button>
  )
}

function MoreChip({
  hidden,
  expanded,
  tabbable,
  reduce,
  className,
  onToggle,
  onFocusChip,
}: {
  hidden: number
  expanded: boolean
  tabbable: boolean
  reduce: boolean
  className?: string
  onToggle: () => void
  onFocusChip: (value: string) => void
}) {
  const body = React.useRef<HTMLSpanElement>(null)
  const text = expanded ? "Show less" : `+${hidden} more`
  const lag = useWidthLag(body, text, reduce)
  const edge = useTransform(lag, (value) => -value)
  const centre = useTransform(lag, (value) => value / 2)
  return (
    <motion.button
      type="button"
      className={cn(
        "relative inline-flex max-w-full cursor-pointer rounded-full border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      data-more=""
      data-slot="chip-group-more"
      aria-expanded={expanded}
      tabIndex={tabbable ? 0 : -1}
      onClick={onToggle}
      onFocus={() => onFocusChip(MORE)}
      layout="position"
      transition={{ layout: reduce ? { duration: 0 } : motionPresets.spring.morph }}
    >
      <span ref={body} className="relative isolate inline-flex h-8 min-w-0 items-center px-3.5">
        <motion.span className="absolute inset-y-0 left-0 -z-10 rounded-full border border-border bg-muted" style={{ right: edge }} aria-hidden="true" />
        <span className="relative inline-flex justify-center tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <Swap
              key={text}
              follow={centre}
              className="block whitespace-nowrap"
              initial={reduce ? { opacity: 0 } : textIn}
              animate={shown}
              exit={reduce ? { opacity: 0, transition: reducedFade } : textOut}
              transition={reduce ? reducedFade : { duration: 0.22, ease: enterEase }}
            >
              {text}
            </Swap>
          </AnimatePresence>
        </span>
      </span>
    </motion.button>
  )
}

export function ChipGroup({
  options,
  value,
  onValueChange,
  label,
  multiple = true,
  maxVisible = Infinity,
  className,
  classNames,
}: ChipGroupProps) {
  const id = React.useId()
  const reduce = !!useReducedMotion()
  const [expanded, setExpanded] = React.useState(false)
  const [pinned, setPinned] = React.useState<string[]>(value)
  const [active, setActive] = React.useState<string | null>(null)
  const foldable = options.length > maxVisible
  const visible =
    !foldable || expanded
      ? options
      : options.filter((option, index) => index < maxVisible || pinned.includes(option.value) || value.includes(option.value))
  const hidden = options.length - visible.length
  const showMore = foldable && (expanded || hidden > 0)
  const keys = [...visible.map((option) => option.value), ...(showMore ? [MORE] : [])]
  const tabStop = active !== null && keys.includes(active) ? active : (visible.find((option) => value.includes(option.value))?.value ?? keys[0])

  function toggle(next: string) {
    const on = value.includes(next)
    if (!multiple) return onValueChange(on ? [] : [next])
    onValueChange(
      options.filter((option) => (option.value === next ? !on : value.includes(option.value))).map((option) => option.value),
    )
  }

  function toggleMore() {
    if (expanded) setPinned(value)
    setExpanded(!expanded)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(":is(button[data-chip], button[data-more]):not([aria-hidden='true'])"),
    )
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (index < 0) return
    const last = buttons.length - 1
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    buttons[moves[event.key]].focus()
  }

  return (
    <LayoutGroup id={id}>
      <HeightFrame morphKey={`${expanded}|${value.join(",")}`} reduce={reduce}>
        <div
          data-slot="chip-group"
          className={cn("relative isolate flex min-w-0 max-w-full flex-wrap gap-2", className, classNames?.root)}
          role="group"
          aria-label={label}
          onKeyDown={onKeyDown}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((option, index) => (
              <Chip
                key={option.value}
                option={option}
                selected={value.includes(option.value)}
                tabbable={tabStop === option.value}
                reduce={reduce}
                delay={expanded ? Math.min(Math.max(0, index - maxVisible) * motionPresets.stagger.item, 0.3) : 0}
                className={classNames?.chip}
                labelClassName={classNames?.label}
                onToggle={toggle}
                onFocusChip={setActive}
              />
            ))}
            {showMore ? (
              <MoreChip
                key={MORE}
                hidden={hidden}
                expanded={expanded}
                tabbable={tabStop === MORE}
                reduce={reduce}
                className={classNames?.more}
                onToggle={toggleMore}
                onFocusChip={setActive}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </HeightFrame>
    </LayoutGroup>
  )
}
