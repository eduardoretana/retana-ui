"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type StepperOrientation = "horizontal" | "vertical"
export type StepperStatus = "complete" | "current" | "upcoming" | "error"

export type StepperStep = {
  id: string
  label: string
  description?: string
  /** Short mono line under the label, such as a date. */
  meta?: string
  error?: string
}

export type StepperClassNames = {
  root?: string
  list?: string
  item?: string
  marker?: string
  label?: string
  description?: string
  connector?: string
}

export type StepperProps = {
  steps: StepperStep[]
  current: number
  orientation?: StepperOrientation
  onStepSelect?: (index: number) => void
  details?: "all" | "current"
  compact?: boolean
  label?: string
  completeLabel?: string
  /** milestone draws a check, a filled current dot, and hollow upcoming steps. */
  marker?: "default" | "milestone"
  className?: string
  classNames?: StepperClassNames
}

type GlyphKind = "number" | "check" | "error" | "dot"

const blur = (radius: number) => `blur(${radius}px)`
const still = { duration: 0 } as const
const leave = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } as const
const settle = { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } as const
const textFrom = { opacity: 0, y: "0.3em", filter: blur(motionPresets.blur.soft) }
const textRest = { opacity: 1, y: 0, filter: blur(0) }
const textGone = { opacity: 0, y: "-0.3em", filter: blur(motionPresets.blur.subtle) }
const glyphFrom = { opacity: 0, scale: 0.5, filter: blur(motionPresets.blur.subtle) }
const glyphRest = { opacity: 1, scale: 1, filter: blur(0) }

const statusText: Record<StepperStatus, string> = {
  complete: "Completed",
  current: "",
  upcoming: "Not started",
  error: "Error",
}

function SwapText({ text, className, reduced }: { text?: string; className: string; reduced: boolean }) {
  const inner = React.useRef<HTMLSpanElement>(null)
  const armedUntil = React.useRef(0)
  const height = useMotionValue<number | "auto">("auto")
  React.useLayoutEffect(() => {
    armedUntil.current = performance.now() + 700
  }, [text])
  React.useEffect(() => {
    const node = inner.current
    const slot = node?.parentElement
    if (!node || !slot || typeof ResizeObserver === "undefined") return
    let measured = false
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight
      if (!measured || reduced || performance.now() > armedUntil.current) {
        measured = true
        height.jump(next)
        return
      }
      animate(height, next, motionPresets.spring.smooth)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [height, reduced])
  return (
    <motion.span className="block" style={{ height }}>
      <span ref={inner} className="relative block">
        <AnimatePresence mode="popLayout" initial={false}>
          {text ? (
            <motion.span
              key={`${className}:${text}`}
              className={className}
              initial={textFrom}
              animate={textRest}
              exit={{ ...textGone, transition: reduced ? still : leave }}
              transition={reduced ? still : settle}
            >
              {text}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

function Glyph({ kind, number, delay, reduced }: { kind: GlyphKind; number: number; delay: number; reduced: boolean }) {
  const pop = reduced
    ? still
    : {
        scale: { ...motionPresets.spring.snappy, delay },
        opacity: { duration: motionPresets.duration.fast, delay },
        filter: { duration: motionPresets.duration.fast, delay },
      }
  const exit = { ...glyphFrom, transition: reduced ? still : leave }
  const draw = reduced ? still : { duration: 0.32, ease: motionPresets.ease.enter, delay: delay + 0.04 }
  if (kind === "dot") {
    return (
      <motion.span className="col-start-1 row-start-1 size-1.5 rounded-full bg-current" initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop} />
    )
  }
  if (kind === "number") {
    return (
      <motion.span className="col-start-1 row-start-1 grid place-items-center" initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop}>
        {number}
      </motion.span>
    )
  }
  return (
    <motion.svg
      className="col-start-1 row-start-1 size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={glyphFrom}
      animate={glyphRest}
      exit={exit}
      transition={pop}
      aria-hidden="true"
    >
      {kind === "check" ? (
        <motion.path d="M5.5 12.5l4.25 4.25L18.5 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
      ) : (
        <>
          <motion.path d="M12 6.75v6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
          <motion.circle
            cx={12}
            cy={17.4}
            r={1.4}
            fill="currentColor"
            stroke="none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduced ? still : { ...motionPresets.spring.snappy, delay: delay + 0.16 }}
          />
        </>
      )}
    </motion.svg>
  )
}

function Marker({
  number,
  kind,
  current,
  glyphDelay,
  ringDelay,
  reduced,
  className,
}: {
  number: number
  kind: GlyphKind
  current: boolean
  glyphDelay: number
  ringDelay: number
  reduced: boolean
  className?: string
}) {
  return (
    <span data-slot="stepper-marker" className={cn("relative grid size-7 shrink-0 place-items-center", className)} aria-hidden="true">
      <AnimatePresence initial={false}>
        {current ? (
          <motion.span
            key="ring"
            className="absolute -inset-1 rounded-full bg-primary/15 group-data-[status=error]/step:bg-destructive/15"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: reduced ? still : leave }}
            transition={
              reduced
                ? still
                : { scale: { ...motionPresets.spring.snappy, delay: ringDelay }, opacity: { duration: motionPresets.duration.fast, delay: ringDelay } }
            }
          />
        ) : null}
      </AnimatePresence>
      <span
        className={cn(
          "relative grid size-full place-items-center rounded-full bg-card text-xs font-medium text-muted-foreground tabular-nums shadow-[inset_0_0_0_1px_var(--border)] transition-colors",
          "group-data-[status=current]/step:text-foreground group-data-[status=current]/step:shadow-[inset_0_0_0_1.5px_var(--primary)]",
          "group-data-[marker=milestone]/step:group-data-[status=current]/step:bg-foreground group-data-[marker=milestone]/step:group-data-[status=current]/step:text-background group-data-[marker=milestone]/step:group-data-[status=current]/step:shadow-none",
          "group-data-[status=complete]/step:bg-primary group-data-[status=complete]/step:text-primary-foreground group-data-[status=complete]/step:shadow-[inset_0_0_0_1px_var(--primary)]",
          "group-data-[status=error]/step:bg-destructive/10 group-data-[status=error]/step:text-destructive group-data-[status=error]/step:shadow-[inset_0_0_0_1.5px_var(--destructive)]",
          "group-data-[clickable]/head:group-active/head:scale-[0.92] motion-reduce:group-active/head:scale-100",
        )}
      >
        <AnimatePresence initial={false}>
          <Glyph key={kind} kind={kind} number={number} delay={glyphDelay} reduced={reduced} />
        </AnimatePresence>
      </span>
    </span>
  )
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onStepSelect,
  details = "all",
  compact = false,
  label = "Progress",
  completeLabel = "All steps complete",
  marker = "default",
  className,
  classNames,
}: StepperProps) {
  const reduced = useReducedMotion() ?? false
  const count = steps.length
  const active = Math.min(Math.max(Math.round(current), 0), count)
  const [travel, setTravel] = React.useState({ to: active, from: active })
  if (travel.to !== active) setTravel({ to: active, from: travel.to })
  const from = travel.from
  const gap = motionPresets.stagger.line
  const delayAt = (index: number) => {
    if (reduced) return 0
    if (active > from) return index >= from && index < active ? (index - from) * gap : 0
    return index >= active && index < from ? (from - 1 - index) * gap : 0
  }
  const ringDelay = reduced ? 0 : Math.max(0, Math.abs(active - from) - 1) * gap + 0.12
  const interactive = Boolean(onStepSelect)
  const vertical = orientation === "vertical"
  const done = active >= count
  const now = done ? undefined : steps[active]

  function onKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    const rtl = !vertical && getComputedStyle(event.currentTarget).direction === "rtl"
    const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"]
    const ahead = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"]
    if (![...back, ...ahead, "Home", "End"].includes(event.key)) return
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-reachable]"))
    const at = targets.indexOf(event.target as HTMLButtonElement)
    if (at < 0) return
    event.preventDefault()
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? targets.length - 1
          : back.includes(event.key)
            ? Math.max(0, at - 1)
            : Math.min(targets.length - 1, at + 1)
    targets[next]?.focus()
  }

  const Root = (interactive ? "nav" : "div") as React.ElementType
  return (
    <Root
      data-slot="stepper"
      data-orientation={orientation}
      data-marker={marker}
      data-compact={compact ? "" : undefined}
      aria-label={label}
      role={interactive ? undefined : "group"}
      className={cn("min-w-0 text-foreground", !vertical && "w-full @container/stepper", className, classNames?.root)}
    >
      <ol
        data-slot="stepper-list"
        className={cn("m-0 grid list-none p-0", classNames?.list)}
        style={vertical ? undefined : { gridTemplateColumns: count > 1 ? `repeat(${count - 1}, minmax(0, 1fr)) auto` : "auto" }}
        onKeyDown={interactive ? onKeyDown : undefined}
      >
        {steps.map((step, index) => {
          const isCurrent = index === active
          const status: StepperStatus = step.error ? "error" : index < active ? "complete" : isCurrent ? "current" : "upcoming"
          const clickable = interactive && index < active
          const detail = step.error ?? (details === "all" || isCurrent ? step.description : undefined)
          const kind: GlyphKind = step.error ? "error" : index < active ? "check" : marker === "milestone" && isCurrent ? "dot" : "number"
          const content = (
            <>
              <Marker
                number={index + 1}
                kind={kind}
                current={isCurrent}
                glyphDelay={delayAt(index)}
                ringDelay={ringDelay}
                reduced={reduced}
                className={classNames?.marker}
              />
              <span
                className={cn(
                  "grid min-w-0",
                  vertical && "pt-1",
                  compact && "sr-only",
                  !vertical && "@max-[30rem]/stepper:sr-only",
                )}
              >
                <span
                  data-slot="stepper-label"
                  className={cn(
                    "block text-sm leading-5 font-medium wrap-anywhere text-muted-foreground",
                    status === "complete" && "text-muted-foreground",
                    (status === "current" || status === "error") && "text-foreground",
                    classNames?.label,
                  )}
                >
                  {step.label}
                  {step.meta ? <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{step.meta}</span> : null}
                </span>
                {statusText[status] ? <span className="sr-only">, {statusText[status]}</span> : null}
                <SwapText
                  text={detail}
                  reduced={reduced}
                  className={cn(
                    "block pt-0.5 text-xs leading-normal font-normal wrap-anywhere",
                    step.error ? "text-destructive" : "text-muted-foreground",
                    classNames?.description,
                  )}
                />
              </span>
            </>
          )
          return (
            <li
              key={step.id}
              data-slot="stepper-item"
              data-status={status}
              data-marker={marker}
              className={cn(
                "group/step relative min-w-0",
                !vertical && index < count - 1 && "pe-4",
                vertical && index < count - 1 && (compact ? "pb-6" : "pb-5"),
                classNames?.item,
              )}
            >
              {index < count - 1 ? (
                <span
                  data-slot="stepper-connector"
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute overflow-hidden rounded-full bg-border",
                    vertical
                      ? "start-[calc(0.875rem-1px)] top-[calc(1.75rem+6px)] bottom-[6px] w-0.5"
                      : "end-[calc(4px+0.25rem)] top-[calc(0.875rem-1px)] start-[calc(1.75rem+4px+0.25rem)] h-0.5",
                    classNames?.connector,
                  )}
                >
                  <motion.span
                    key={orientation}
                    className={cn("absolute inset-0 rounded-full bg-primary", vertical ? "origin-top" : "origin-left rtl:origin-right")}
                    initial={false}
                    animate={vertical ? { scaleY: index < active ? 1 : 0 } : { scaleX: index < active ? 1 : 0 }}
                    transition={reduced ? still : { ...motionPresets.spring.smooth, delay: delayAt(index) }}
                  />
                </span>
              ) : null}
              {interactive ? (
                <button
                  type="button"
                  data-clickable={clickable || undefined}
                  data-reachable={index <= active || undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-disabled={clickable ? undefined : true}
                  tabIndex={clickable ? undefined : -1}
                  onClick={clickable ? () => onStepSelect?.(index) : undefined}
                  className={cn(
                    "group/head m-0 cursor-default border-0 bg-transparent p-0 text-start font-inherit text-inherit",
                    "rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                    clickable && "cursor-pointer",
                    vertical ? "grid w-full items-start gap-x-3" : "grid w-fit max-w-full justify-items-start gap-y-3",
                    vertical && (compact ? "grid-cols-[1.75rem]" : "grid-cols-[1.75rem_minmax(0,1fr)]"),
                  )}
                >
                  {content}
                </button>
              ) : (
                <span
                  className={cn(
                    "m-0 grid border-0 bg-transparent p-0 text-start",
                    vertical ? "w-full items-start gap-x-3" : "w-fit max-w-full justify-items-start gap-y-3",
                    vertical && (compact ? "grid-cols-[1.75rem]" : "grid-cols-[1.75rem_minmax(0,1fr)]"),
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {vertical ? null : (
        <span className={cn("mt-3", compact ? "grid" : "hidden @max-[30rem]/stepper:grid")} aria-hidden="true">
          <SwapText text={now?.label ?? completeLabel} className="block text-sm leading-5 font-medium wrap-anywhere text-foreground" reduced={reduced} />
          <SwapText
            text={now?.error ?? now?.description}
            className={cn("block pt-0.5 text-xs wrap-anywhere", now?.error ? "text-destructive" : "text-muted-foreground")}
            reduced={reduced}
          />
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {now ? `Step ${active + 1} of ${count}: ${now.label}` : completeLabel}
      </span>
    </Root>
  )
}
