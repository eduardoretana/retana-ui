"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import type { TargetAndTransition, Variants } from "motion/react"
import { Check, CircleAlert, Pencil, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

/**
 * Click-to-edit text for names and short fields that are read far more often than they change.
 * The text turns into a field in place with the same metrics, so nothing around it moves, and the box grows with what you type.
 * Enter saves optimistically and a check draws once the save lands; Escape rolls the text back. A failed save restores the last saved value.
 */
export type InlineEditClassNames = {
  root?: string
  display?: string
  control?: string
  frame?: string
  message?: string
  actions?: string
}

export type InlineEditProps = {
  /** The saved value. A new value from outside replaces the text while it is not being edited. */
  value: string
  /** Persists the new value. Return a promise to show the saving state, and reject it to roll back. */
  onSave: (next: string) => void | Promise<unknown>
  /** Accessible name, for example “Project name”. */
  label: string
  /** Returns a message when the draft cannot be saved. */
  validate?: (next: string) => string | null | undefined
  /** Shown when the value is empty. */
  placeholder?: string
  /** Wraps onto several lines and grows in height. Enter still saves; Shift+Enter adds a line break. */
  multiline?: boolean
  /** `title` for names and headings, `body` for descriptions. */
  variant?: "title" | "body"
  /** The element that holds the text, so a title can stay a heading. */
  as?: "span" | "p" | "h1" | "h2" | "h3"
  className?: string
  classNames?: InlineEditClassNames
}

type Phase = "idle" | "saving" | "saved" | "failed"

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const blur = (px: number) => `blur(${px}px)`
const noop = () => () => {}
const typingSpring = { ...motionPresets.spring.snappy, visualDuration: motionPresets.duration.fast, bounce: 0 }

function useReduced() {
  const hydrated = React.useSyncExternalStore(noop, () => true, () => false)
  const reduced = useReducedMotion() ?? false
  return hydrated && reduced
}

const textMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.3}em`, filter: blur(motionPresets.blur.soft) }),
  rest: { opacity: 1, y: "0em", filter: blur(0), transition: { duration: 0.22, ease: enter } },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.3}em`,
    filter: blur(motionPresets.blur.subtle),
    transition: { duration: 0.15, ease: standard },
  }),
}
const textFade: Variants = {
  enter: { opacity: 0 },
  rest: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}
const restMotion: TargetAndTransition = { opacity: 1, scale: 1, filter: blur(0) }
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: blur(motionPresets.blur.subtle) }
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: 0.15, ease: standard } }
const fadeIn: TargetAndTransition = { opacity: 0 }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: 0.1 } }
const iconEnter = {
  ...motionPresets.spring.snappy,
  opacity: { duration: motionPresets.duration.fast, ease: enter },
  filter: { duration: motionPresets.duration.fast, ease: enter },
}

function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M4 12.5l5 5L20 6.5"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.32, ease: enter, delay: 0.06 }, opacity: { duration: 0.05, delay: 0.06 } }}
      />
    </svg>
  )
}

function Reveal({ id, message, reduced }: { id: string; message: { key: string; tone: "error" | "failed"; node: React.ReactNode } | null; reduced: boolean }) {
  const inner = React.useRef<HTMLSpanElement>(null)
  const height = useMotionValue(0)
  React.useEffect(() => {
    const node = inner.current
    if (!node || typeof ResizeObserver === "undefined") return
    let measured = false
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      if (!measured || reduced) {
        measured = true
        height.jump(next)
        return
      }
      animate(height, next, motionPresets.spring.smooth)
    })
    observer.observe(node, { box: "border-box" })
    return () => {
      observer.disconnect()
      height.stop()
    }
  }, [height, reduced])
  return (
    <motion.span className="block overflow-hidden" style={{ height }}>
      <span ref={inner} id={id} className="relative block" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={1}>
          {message && (
            <motion.span
              key={message.key}
              className={cn(
                "flex items-start gap-1.5 px-2 pt-1.5 pb-1 text-xs leading-normal",
                message.tone === "error" ? "text-destructive" : "text-muted-foreground",
              )}
              custom={1}
              variants={reduced ? textFade : textMotion}
              initial="enter"
              animate="rest"
              exit="exit"
            >
              {message.node}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

type CaretDocument = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  caretRangeFromPoint?: (x: number, y: number) => Range | null
}

export function InlineEdit({
  value,
  onSave,
  label,
  validate,
  placeholder = "",
  multiline = false,
  variant = "title",
  as: Tag = "span",
  className,
  classNames,
}: InlineEditProps) {
  const reduced = useReduced()
  const ids = React.useId()
  const displayHintId = `${ids}-display`
  const editHintId = `${ids}-edit`
  const messageId = `${ids}-message`
  const [committed, setCommitted] = React.useState(value)
  const [shown, setShown] = React.useState(value)
  const [seen, setSeen] = React.useState(value)
  const [layer, setLayer] = React.useState({ key: 0, direction: 1 })
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState<string | null>(null)
  const [flash, setFlash] = React.useState<"on" | "off" | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const root = React.useRef<HTMLDivElement>(null)
  const display = React.useRef<HTMLButtonElement>(null)
  const control = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const selection = React.useRef<number | "all" | null>(null)
  const focusDisplay = React.useRef(false)
  const saveRun = React.useRef(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const frame = React.useRef<HTMLSpanElement>(null)
  const box = React.useRef<HTMLSpanElement>(null)
  const frameWidth = useMotionValue<number | string>("100%")
  const boxHeight = useMotionValue<number | string>("auto")
  const size = React.useRef(0)
  const wasEditing = React.useRef(false)

  if (value !== seen) {
    setSeen(value)
    if (value !== committed) {
      setCommitted(value)
      if (!editing && phase !== "saving" && value !== shown) {
        setShown(value)
        setLayer((current) => ({ key: current.key + 1, direction: 1 }))
      }
    }
  }

  const layerText = editing ? draft : shown
  const saving = phase === "saving"
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const naturalSize = () => {
    const node = display.current
    return node ? parseFloat(getComputedStyle(node)[multiline ? "height" : "width"]) : 0
  }
  const snap = (next: number) => {
    const field = control.current
    if (multiline && field) {
      field.style.height = `${next}px`
      field.scrollTop = 0
    }
    const surface = multiline ? box.current : frame.current
    if (surface) surface.style[multiline ? "height" : "width"] = `${next}px`
    ;(multiline ? boxHeight : frameWidth).jump(next)
  }

  const onContentChange = React.useEffectEvent(() => {
    const next = naturalSize()
    const previous = size.current
    const typing = editing && wasEditing.current
    size.current = next
    wasEditing.current = editing
    if (!next) return
    const field = control.current
    if (multiline && field) {
      field.style.height = `${next}px`
      field.scrollTop = 0
    }
    const target = multiline ? boxHeight : frameWidth
    if (!previous || reduced || typeof target.get() !== "number") {
      snap(next)
      return
    }
    if (Math.abs(next - previous) < 0.1) return
    animate(target, next, multiline ? motionPresets.spring.smooth : typing ? typingSpring : motionPresets.spring.morph)
  })
  React.useLayoutEffect(() => {
    onContentChange()
  }, [layerText, editing, multiline, reduced])

  const onResize = React.useEffectEvent(() => {
    const next = naturalSize()
    if (!next || Math.abs(next - size.current) < 0.1) return
    size.current = next
    snap(next)
  })
  React.useEffect(() => {
    const node = display.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => onResize())
    observer.observe(node, { box: "border-box" })
    return () => observer.disconnect()
  }, [])

  React.useLayoutEffect(() => {
    const field = control.current
    if (editing && field && selection.current !== null) {
      const at = selection.current
      selection.current = null
      field.focus({ preventScroll: true })
      if (at === "all") field.select()
      else field.setSelectionRange(at, at)
    }
    if (!editing && focusDisplay.current) {
      focusDisplay.current = false
      display.current?.focus({ preventScroll: true })
    }
  })

  function startEdit(at: number | "all", text = shown) {
    if (editing || saving) return
    setDraft(text)
    setEditing(true)
    setError(null)
    setFailed(null)
    setFlash(null)
    if (phase !== "idle") setPhase("idle")
    selection.current = at
  }

  function caretAt(x: number, y: number) {
    const node = display.current?.querySelector(`[data-layer="${layer.key}"]`)?.firstChild
    if (!node || !shown) return shown.length
    const doc = document as CaretDocument
    const position = doc.caretPositionFromPoint?.(x, y)
    if (position) return position.offsetNode === node ? Math.min(position.offset, shown.length) : shown.length
    const range = doc.caretRangeFromPoint?.(x, y)
    return range && range.startContainer === node ? Math.min(range.startOffset, shown.length) : shown.length
  }

  function onDisplayClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (saving) return
    startEdit(event.detail === 0 ? "all" : caretAt(event.clientX, event.clientY))
  }

  const clean = (text: string) => (multiline ? text.trim() : text.replace(/\s+/g, " ").trim())

  function submit(source: "key" | "button" | "blur") {
    const next = clean(draft)
    const problem = validate?.(next) || null
    if (problem) {
      setError(problem)
      if (source !== "blur") control.current?.focus()
      return
    }
    setEditing(false)
    setError(null)
    if (source !== "blur") focusDisplay.current = true
    if (next !== draft) setLayer((current) => ({ key: current.key + 1, direction: 1 }))
    if (next === shown) return
    const previous = committed
    const run = ++saveRun.current
    setShown(next)
    setPhase("saving")
    setAnnouncement(`Saving ${label.toLowerCase()}`)
    Promise.resolve()
      .then(() => onSave(next))
      .then(
        () => {
          if (run !== saveRun.current) return
          setCommitted(next)
          setPhase("saved")
          setAnnouncement(`${label} saved`)
          later(() => setPhase((current) => (current === "saved" ? "idle" : current)), 1800)
        },
        () => {
          if (run !== saveRun.current) return
          setShown(previous)
          setLayer((current) => ({ key: current.key + 1, direction: -1 }))
          setPhase("failed")
          setFailed(next)
          setFlash("on")
          setAnnouncement("")
          later(() => setFlash((current) => (current === "on" ? "off" : current)), 1400)
          later(() => setFlash((current) => (current === "off" ? null : current)), 2000)
        },
      )
  }

  function cancel() {
    setEditing(false)
    setError(null)
    focusDisplay.current = true
    if (draft !== shown) setLayer((current) => ({ key: current.key + 1, direction: -1 }))
  }

  function retry() {
    if (!failed) return
    startEdit(failed.length, failed)
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = event.target.value
    setDraft(next)
    if (error) setError(validate?.(clean(next)) || null)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      cancel()
      return
    }
    if (event.key === "Enter" && !event.nativeEvent.isComposing && !(multiline && event.shiftKey)) {
      event.preventDefault()
      submit("key")
    }
  }

  function onBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!editing) return
    const next = event.relatedTarget as Node | null
    if (next && root.current?.contains(next)) return
    if (!next && !document.hasFocus()) return
    submit("blur")
  }

  const noun = label.toLowerCase()
  const message = error
    ? {
        key: `error:${error}`,
        tone: "error" as const,
        node: (
          <>
            <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-destructive" strokeWidth={2} aria-hidden="true" />
            <span className={classNames?.message}>{error}</span>
          </>
        ),
      }
    : failed && !editing
      ? {
          key: `failed:${failed}`,
          tone: "failed" as const,
          node: (
            <>
              <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-destructive" strokeWidth={2} aria-hidden="true" />
              <span className={classNames?.message}>
                {`Couldn’t save “${failed}”, so the last saved ${noun} is back. `}
                <button type="button" className="ms-0.5 font-medium text-foreground underline underline-offset-3" onClick={retry}>
                  Try again
                </button>
              </span>
            </>
          ),
        }
      : null
  const slot = editing ? "edit" : phase
  const describedBy = (hint: string) => [hint, message ? messageId : null].filter(Boolean).join(" ")
  const fieldClass = cn(
    "absolute inset-0 z-2 h-full min-h-0 w-full resize-none overflow-hidden border-transparent bg-transparent px-2 shadow-none outline-none field-sizing-fixed",
    "caret-foreground focus-visible:ring-0 md:text-[length:inherit] dark:bg-transparent",
    variant === "body" ? "py-1 text-sm" : "py-0.5 text-xl",
    classNames?.control,
  )
  const fieldProps = {
    className: fieldClass,
    value: draft,
    onChange,
    onKeyDown,
    placeholder,
    "aria-label": label,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(editHintId),
    autoComplete: "off" as const,
    spellCheck: variant === "body",
  }

  return (
    <div
      ref={root}
      data-slot="inline-edit"
      className={cn("relative grid min-w-0 -ms-[9px]", className, classNames?.root)}
      data-variant={variant}
      data-multiline={multiline || undefined}
      data-editing={editing || undefined}
      data-phase={phase}
      data-invalid={error ? "" : undefined}
      data-flash={flash ?? undefined}
      onBlur={onBlur}
    >
      <Tag
        className={cn(
          "m-0 block min-w-0 pe-16 leading-snug font-medium",
          multiline && "pe-10",
          variant === "title" ? "text-xl text-foreground" : "text-sm font-normal text-muted-foreground",
        )}
      >
        <motion.span ref={box} className={cn("group/edit relative inline-block max-w-full align-top", multiline && "block")} style={multiline ? { height: boxHeight } : undefined}>
          <button
            ref={display}
            type="button"
            className={cn(
              "relative z-1 block max-w-full cursor-text rounded-lg border border-transparent bg-transparent px-2 text-left",
              variant === "body" ? "py-1" : "py-0.5",
              multiline && "w-full",
              editing && "invisible",
              editing && !multiline && "min-w-[5em] pe-6",
              saving && "cursor-progress",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              classNames?.display,
            )}
            onClick={onDisplayClick}
            tabIndex={editing ? -1 : undefined}
            aria-label={`${label}: ${shown || placeholder}`}
            aria-describedby={describedBy(displayHintId)}
            aria-disabled={saving || undefined}
          >
            <span className={cn("relative block transition-opacity", !layerText && "text-muted-foreground", phase === "saving" && "opacity-50")}>
              <AnimatePresence mode="popLayout" initial={false} custom={layer.direction}>
                <motion.span
                  key={layer.key}
                  data-layer={layer.key}
                  className={cn("block overflow-hidden text-ellipsis whitespace-pre", multiline && "overflow-visible wrap-break-word whitespace-pre-wrap")}
                  custom={layer.direction}
                  variants={reduced ? textFade : textMotion}
                  initial="enter"
                  animate="rest"
                  exit="exit"
                >
                  {(layerText || placeholder || "\u200b") + (multiline && editing ? "\u200b" : "")}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
          {editing && (multiline ? (
            <Textarea ref={(node) => { control.current = node }} {...fieldProps} rows={1} enterKeyHint="done" />
          ) : (
            <Input ref={(node) => { control.current = node }} {...fieldProps} type="text" enterKeyHint="done" />
          ))}
          <motion.span
            ref={frame}
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-0 rounded-lg border border-transparent bg-transparent",
              multiline && "right-0",
              "group-hover:bg-muted",
              editing && "border-foreground bg-background shadow-[0_0_0_3px_var(--ring)]",
              error && "border-destructive shadow-[0_0_0_3px_var(--destructive)]",
              flash === "on" && "border-destructive/30 bg-destructive/10",
              classNames?.frame,
            )}
            style={multiline ? undefined : { width: frameWidth }}
          >
            <span className={cn("pointer-events-auto absolute top-1/2 left-[calc(100%+6px)] grid min-h-7 -mt-3.5", multiline && "top-0 mt-[calc(0.35rem)] left-[calc(100%+8px)]")}>
              <AnimatePresence initial={false}>
                <motion.span
                  key={slot}
                  className="col-start-1 row-start-1 grid min-h-7 place-items-center items-center justify-start"
                  initial={reduced ? fadeIn : iconIn}
                  animate={restMotion}
                  exit={reduced ? fadeOut : iconOut}
                  transition={reduced ? { duration: 0.15 } : iconEnter}
                >
                  {slot === "edit" ? (
                    <span className={cn("flex gap-1", multiline && "flex-col", classNames?.actions)}>
                      <Button
                        type="button"
                        size="icon-sm"
                        className="size-7 rounded-full"
                        aria-label={`Save ${noun}`}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => submit("button")}
                      >
                        <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className="size-7 rounded-full"
                        aria-label="Cancel editing"
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={cancel}
                      >
                        <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </Button>
                    </span>
                  ) : slot === "saving" ? (
                    <span className="ms-0.5 block size-3.5 animate-spin rounded-full border-[1.5px] border-muted-foreground border-r-transparent motion-reduce:animate-none" aria-hidden="true" />
                  ) : slot === "saved" ? (
                    <span className="ms-px grid place-items-center text-primary" aria-hidden="true">
                      <DrawnCheck reduced={reduced} />
                    </span>
                  ) : slot === "failed" ? (
                    <CircleAlert className="ms-px size-4 text-destructive" strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Pencil
                      className="ms-0.5 size-3.5 cursor-pointer text-muted-foreground opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/edit:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within/edit:opacity-100"
                      strokeWidth={1.75}
                      aria-hidden="true"
                      onClick={() => startEdit(shown.length)}
                    />
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.span>
        </motion.span>
      </Tag>
      <Reveal id={messageId} message={message} reduced={reduced} />
      <span id={displayHintId} className="sr-only">Activate to edit.</span>
      <span id={editHintId} className="sr-only">{multiline ? "Enter saves, Shift+Enter adds a line break, Escape cancels." : "Enter saves, Escape cancels."}</span>
      <span className="sr-only" role="status">{announcement}</span>
    </div>
  )
}
