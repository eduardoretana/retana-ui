"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type Transition, type Variants } from "motion/react"
import { CircleAlert, LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ConfirmMorphState = "idle" | "confirming" | "pending" | "done" | "error"

export type ConfirmMorphClassNames = {
  root?: string
  surface?: string
  face?: string
  trigger?: string
  prompt?: string
  cancel?: string
  confirm?: string
  status?: string
}

export type ConfirmMorphProps = {
  label: React.ReactNode
  icon?: React.ReactNode
  prompt?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  pendingLabel?: string
  doneLabel?: string
  errorLabel?: string
  retryLabel?: string
  undoLabel?: string
  undoingLabel?: string
  tone?: "danger" | "neutral"
  onConfirm?: () => void | Promise<unknown>
  onUndo?: () => void | Promise<unknown>
  onCancel?: () => void
  state?: ConfirmMorphState
  defaultState?: ConfirmMorphState
  onStateChange?: (state: ConfirmMorphState) => void
  confirmTimeout?: number
  resultTimeout?: number
  cancelOnOutsidePress?: boolean
  disabled?: boolean
  className?: string
  classNames?: ConfirmMorphClassNames
  ref?: React.Ref<HTMLDivElement>
}

const TRAVEL = 12
const { blur } = motionPresets
type Bezier = [number, number, number, number]
const enter = [...motionPresets.ease.enter] as Bezier
const standard = [...motionPresets.ease.standard] as Bezier

function physical(visualDuration: number, bounce: number): Transition {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}

const GROW = physical(0.44, 0.18)
const SHRINK = physical(0.34, 0)
const SLIDE = physical(0.36, 0.06)

const subscribe = () => () => {}

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * TRAVEL, filter: `blur(${blur.soft}px)` }),
  shown: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      x: SLIDE,
      opacity: { duration: 0.2, ease: enter, delay: 0.04 },
      filter: { duration: 0.22, ease: enter, delay: 0.04 },
    },
  },
  gone: (direction: number) => ({
    opacity: 0,
    x: direction * -TRAVEL * 0.6,
    filter: `blur(${blur.soft}px)`,
    transition: { x: SLIDE, opacity: { duration: 0.12, ease: standard }, filter: { duration: 0.12, ease: standard } },
  }),
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.14 } },
  gone: { opacity: 0, transition: { duration: 0.1 } },
}

function Face({
  id,
  direction,
  reduced,
  onSize,
  children,
  labelledBy,
  className,
}: {
  id: ConfirmMorphState
  direction: number
  reduced: boolean
  onSize: (id: ConfirmMorphState, width: number) => void
  children: React.ReactNode
  labelledBy?: string
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const present = useIsPresent()

  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node || !present) return
    const report = () => {
      const flex = node.style.flex
      node.style.flex = "none"
      const width = node.offsetWidth
      node.style.flex = flex
      onSize(id, width)
    }
    report()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(report)
    observer.observe(node)
    return () => observer.disconnect()
  }, [id, onSize, present])

  return (
    <motion.div
      ref={ref}
      data-slot="confirm-morph-face"
      data-face={id}
      className={cn(
        "flex h-full min-w-0 flex-[0_1_auto] items-center gap-0.5 px-1 whitespace-nowrap",
        id === "idle" && "rounded-full p-0",
        "[&[inert]]:pointer-events-none [&[inert]]:absolute [&[inert]]:top-0 [&[inert]]:left-1/2 [&[inert]]:-translate-x-1/2",
        className,
      )}
      custom={direction}
      role={labelledBy ? "group" : undefined}
      aria-labelledby={labelledBy}
      variants={reduced ? fadeVariants : faceVariants}
      initial="hidden"
      animate="shown"
      exit="gone"
      inert={!present || undefined}
    >
      {children}
    </motion.div>
  )
}

function Check({ reduced }: { reduced: boolean }) {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <motion.circle
        className="fill-primary"
        cx="9"
        cy="9"
        r="8"
        style={{ transformOrigin: "9px 9px" }}
        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ scale: physical(0.34, 0.3), opacity: { duration: 0.12 } }}
      />
      <motion.path
        className="text-primary-foreground"
        d="M5.6 9.3 7.8 11.4 12.4 6.7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, ease: enter, delay: 0.12 }}
      />
    </svg>
  )
}

export function ConfirmMorph({
  label,
  icon,
  prompt,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  pendingLabel = "Deleting",
  doneLabel = "Deleted",
  errorLabel = "Couldn’t finish",
  retryLabel = "Retry",
  undoLabel = "Undo",
  undoingLabel = "Restoring",
  tone = "danger",
  onConfirm,
  onUndo,
  onCancel,
  state: stateProp,
  defaultState = "idle",
  onStateChange,
  confirmTimeout = 6000,
  resultTimeout = 5000,
  cancelOnOutsidePress = true,
  disabled = false,
  className,
  classNames,
  ref,
}: ConfirmMorphProps) {
  const reduced = useReducedFlag()
  const uid = React.useId()
  const promptId = `${uid}-prompt`
  const rootRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, [])

  const [inner, setInner] = React.useState<ConfirmMorphState>(defaultState)
  const state = stateProp ?? inner
  const [direction, setDirection] = React.useState(1)
  const [working, setWorking] = React.useState<"confirm" | "undo">("confirm")
  const [announcement, setAnnouncement] = React.useState("")

  const live = React.useRef({ state, onStateChange, controlled: stateProp !== undefined })
  React.useLayoutEffect(() => {
    live.current = { state, onStateChange, controlled: stateProp !== undefined }
  })
  const pendingFocus = React.useRef(false)
  const run = React.useRef(0)

  const go = React.useCallback((next: ConfirmMorphState) => {
    const current = live.current.state
    if (next === current) return
    const root = rootRef.current
    pendingFocus.current = !!root && (root.contains(document.activeElement) || document.activeElement === document.body)
    setDirection(next === "idle" ? -1 : 1)
    if (!live.current.controlled) setInner(next)
    live.current.state = next
    live.current.onStateChange?.(next)
  }, [])

  const toIdle = React.useCallback(() => {
    run.current++
    go("idle")
  }, [go])

  const perform = React.useCallback(async (kind: "confirm" | "undo") => {
    const handler = kind === "confirm" ? onConfirm : onUndo
    const token = ++run.current
    setWorking(kind)
    let result: void | Promise<unknown> | undefined
    try {
      result = handler?.()
    } catch {
      go("error")
      setAnnouncement(errorLabel)
      return
    }
    if (result && typeof (result as Promise<unknown>).then === "function") {
      go("pending")
      setAnnouncement(kind === "confirm" ? pendingLabel : undoingLabel)
      try {
        await result
      } catch {
        if (token !== run.current) return
        go("error")
        setAnnouncement(errorLabel)
        return
      }
      if (token !== run.current) return
    }
    if (kind === "undo") {
      go("idle")
      setAnnouncement("Undone")
      return
    }
    go("done")
    setAnnouncement(onUndo ? `${doneLabel}. ${undoLabel} is available.` : doneLabel)
  }, [doneLabel, errorLabel, go, onConfirm, onUndo, pendingLabel, undoLabel, undoingLabel])

  const cancel = React.useCallback(() => {
    onCancel?.()
    toIdle()
    setAnnouncement("Cancelled")
  }, [onCancel, toIdle])

  const expire = React.useRef(() => {})
  React.useLayoutEffect(() => {
    expire.current = () => {
      if (live.current.state === "confirming") cancel()
      else toIdle()
    }
  })

  const width = useMotionValue<number | "auto">("auto")
  const target = React.useRef(0)
  const flight = React.useRef(0)
  const onFaceSize = React.useCallback((id: ConfirmMorphState, w: number) => {
    if (id !== live.current.state || Math.abs(w - target.current) < 0.5) return
    const from = target.current
    target.current = w
    if (!from || reduced) {
      width.jump("auto")
      return
    }
    if (width.get() === "auto") width.jump(from)
    const token = ++flight.current
    void animate(width, w, w > from ? GROW : SHRINK).then(() => {
      if (token === flight.current) width.jump("auto")
    }).catch(() => {})
  }, [reduced, width])

  const drain = useMotionValue(1)
  const clock = React.useRef<AnimationPlaybackControls | null>(null)
  const holds = React.useRef({ hover: false, hidden: false })
  const timeout = state === "confirming" ? confirmTimeout : state === "done" || state === "error" ? resultTimeout : 0
  const sync = React.useCallback(() => {
    const control = clock.current
    if (!control) return
    const held = holds.current.hover || holds.current.hidden
    if (held) control.pause()
    else control.play()
  }, [])

  React.useEffect(() => {
    if (!timeout) return
    drain.jump(1)
    const control = animate(drain, 0, { duration: timeout / 1000, ease: "linear" })
    clock.current = control
    void control.then(() => {
      if (clock.current === control) {
        clock.current = null
        expire.current()
      }
    }).catch(() => {})
    sync()
    return () => {
      if (clock.current === control) clock.current = null
      control.stop()
    }
  }, [drain, state, sync, timeout])

  React.useEffect(() => {
    const onVisibility = () => {
      holds.current.hidden = document.hidden
      sync()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [sync])

  React.useEffect(() => {
    if (state !== "confirming" || !cancelOnOutsidePress) return
    const down = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) cancel()
    }
    document.addEventListener("pointerdown", down)
    return () => document.removeEventListener("pointerdown", down)
  }, [cancel, cancelOnOutsidePress, state])

  React.useLayoutEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    const root = rootRef.current
    if (!root) return
    const face = root.querySelector<HTMLElement>(`[data-face="${state}"]`)
    const autofocus = face?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)")
    ;(autofocus ?? root).focus({ preventScroll: true })
  }, [state])

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return
    if (state === "confirming") {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    } else if (state === "done" || state === "error") {
      event.preventDefault()
      event.stopPropagation()
      toIdle()
    }
  }

  const shownPrompt = prompt ?? <>{label}?</>
  const danger = tone === "danger"
  const quiet = "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-sm font-medium transition-colors focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none active:scale-95 motion-reduce:transform-none"
  const face = (() => {
    switch (state) {
      case "confirming":
        return (
          <>
            <span id={promptId} data-slot="confirm-morph-prompt" className={cn("min-w-0 max-w-64 flex-auto truncate px-2 font-medium", classNames?.prompt)}>
              {shownPrompt}
            </span>
            <button type="button" data-slot="confirm-morph-cancel" data-autofocus className={cn(quiet, "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", classNames?.cancel)} onClick={cancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              data-slot="confirm-morph-confirm"
              className={cn(
                quiet,
                danger ? "bg-destructive text-background hover:bg-destructive/80" : "bg-primary text-primary-foreground hover:bg-primary/80",
                classNames?.confirm,
              )}
              onClick={() => void perform("confirm")}
            >
              {confirmLabel}
            </button>
          </>
        )
      case "pending":
        return (
          <span data-slot="confirm-morph-status" className={cn("inline-flex items-center gap-1.5 px-3.5 font-medium text-muted-foreground", classNames?.status)}>
            <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:[animation-duration:1.6s]" size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>{working === "undo" ? undoingLabel : pendingLabel}</span>
          </span>
        )
      case "done":
        return (
          <>
            <span data-slot="confirm-morph-status" data-tone="success" className={cn("inline-flex items-center gap-1.5 py-0 pr-2 pl-2.5 font-medium text-foreground", !onUndo && "pr-3", classNames?.status)}>
              <Check reduced={reduced} />
              <span className="leading-snug">{doneLabel}</span>
            </span>
            {onUndo ? (
              <button type="button" data-autofocus className={cn(quiet, "bg-transparent text-foreground hover:bg-muted", classNames?.cancel)} onClick={() => void perform("undo")}>
                {undoLabel}
              </button>
            ) : null}
          </>
        )
      case "error":
        return (
          <>
            <span data-slot="confirm-morph-status" data-tone="danger" className={cn("inline-flex items-center gap-1.5 py-0 pr-2 pl-2.5 font-medium text-foreground", classNames?.status)}>
              <CircleAlert className="size-4 shrink-0 text-destructive" size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="leading-snug">{errorLabel}</span>
            </span>
            <button type="button" data-autofocus className={cn(quiet, "bg-transparent text-foreground hover:bg-muted", classNames?.cancel)} onClick={() => void perform(working)}>
              {retryLabel}
            </button>
          </>
        )
      default:
        return (
          <button
            type="button"
            data-slot="confirm-morph-trigger"
            data-autofocus
            disabled={disabled}
            className={cn(
              "inline-flex h-full max-w-full min-w-0 items-center gap-2 rounded-full bg-transparent px-3.5 font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground",
              danger ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10" : "text-foreground hover:bg-muted focus-visible:bg-muted",
              classNames?.trigger,
            )}
            onClick={() => {
              setAnnouncement(typeof shownPrompt === "string" ? shownPrompt : "")
              go("confirming")
            }}
          >
            {icon ? <span className="grid size-4 shrink-0 place-items-center [&_svg]:size-4" aria-hidden="true">{icon}</span> : null}
            <span className="min-w-0 truncate">{label}</span>
          </button>
        )
    }
  })()

  return (
    <div
      ref={rootRef}
      data-slot="confirm-morph"
      data-state={state}
      data-tone={tone}
      data-disabled={disabled || undefined}
      className={cn("relative inline-flex w-max max-w-full min-w-0 align-middle text-sm text-foreground focus-visible:outline-none", className, classNames?.root)}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-busy={state === "pending" || undefined}
      onPointerEnter={() => {
        holds.current.hover = true
        sync()
      }}
      onPointerLeave={() => {
        holds.current.hover = false
        sync()
      }}
      onPointerCancel={() => {
        holds.current.hover = false
        sync()
      }}
    >
      <motion.div
        data-slot="confirm-morph-surface"
        className={cn(
          "relative flex h-8 max-w-full justify-center overflow-hidden rounded-full border border-border bg-card shadow-sm transition-transform has-[[data-slot=confirm-morph-trigger]:active]:scale-[0.96] motion-reduce:transform-none",
          danger && (state === "idle" || state === "confirming") && "border-destructive/40 bg-destructive/10 shadow-none",
          danger && state === "confirming" && "border-destructive/50 bg-destructive/15",
          disabled && state === "idle" && "border-border bg-card shadow-none",
          classNames?.surface,
        )}
        style={{ width }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <Face key={state} id={state} direction={direction} reduced={reduced} onSize={onFaceSize} labelledBy={state === "confirming" ? promptId : undefined} className={classNames?.face}>
            {face}
          </Face>
        </AnimatePresence>
      </motion.div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  )
}
