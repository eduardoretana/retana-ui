"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TagInputClassNames = {
  root?: string
  label?: string
  control?: string
  tag?: string
  input?: string
  description?: string
}

export type TagInputProps = {
  label: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  description?: string
  id?: string
  className?: string
  classNames?: TagInputClassNames
}

function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion()
  const words = text.split(" ")
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="relative block" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {words.map((word, index) => (
            <motion.span
              key={`${index}:${word}`}
              className="inline-block whitespace-pre"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionPresets.blur.soft}px)` }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      opacity: 0,
                      y: "-0.35em",
                      filter: `blur(${motionPresets.blur.subtle}px)`,
                      transition: { duration: 0.14, ease: [...motionPresets.ease.standard] },
                    }
              }
              transition={
                reduced
                  ? { duration: motionPresets.duration.instant }
                  : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }
              }
            >
              {index < words.length - 1 ? `${word} ` : word}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </>
  )
}

function MessageRow({ id, text, className }: { id?: string; text: string; className?: string }) {
  const reduced = useReducedMotion()
  const copyRef = React.useRef<HTMLSpanElement>(null)
  const [height, setHeight] = React.useState<number | "auto">("auto")

  React.useEffect(() => {
    const node = copyRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.span
      className="block overflow-hidden"
      initial={reduced ? false : { height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{
        height: 0,
        opacity: 0,
        transition: reduced
          ? { duration: 0 }
          : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.instant } },
      }}
      transition={
        reduced
          ? { duration: 0 }
          : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }
      }
    >
      <motion.span
        ref={copyRef}
        id={id}
        className={cn("block pt-2 text-xs text-muted-foreground break-all", className)}
        initial={reduced ? false : { y: "0.35em", filter: `blur(${motionPresets.blur.soft}px)` }}
        animate={{ y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
      >
        <MotionText text={text} />
      </motion.span>
    </motion.span>
  )
}

function FieldMessage({ id, text, className }: { id?: string; text?: string; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {text ? <MessageRow key="message" id={id} text={text} className={className} /> : null}
    </AnimatePresence>
  )
}

export function TagInput({
  label,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Add a tag",
  description,
  id,
  className,
  classNames,
}: TagInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const hintId = description ? `${inputId}-description` : undefined
  const [internal, setInternal] = React.useState(defaultValue)
  const [draft, setDraft] = React.useState("")
  const [picked, setPicked] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState("")
  const reduced = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const ringRef = React.useRef<HTMLSpanElement>(null)
  const ringAt = React.useRef("")
  const [height, setHeight] = React.useState<number | "auto">("auto")
  const tags = value ?? internal
  const active = picked !== null && tags.includes(picked) ? picked : null

  React.useEffect(() => {
    const node = contentRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useLayoutEffect(() => {
    const ring = ringRef.current
    const node = active === null ? null : contentRef.current?.querySelector<HTMLElement>(`[data-tag="${CSS.escape(active)}"]`)
    if (!ring) return
    if (!node) {
      if (ringAt.current) {
        animate(
          ring,
          reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
          { duration: reduced ? 0 : motionPresets.duration.instant, ease: [...motionPresets.ease.standard] },
        )
      }
      ringAt.current = ""
      return
    }
    const box = { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }
    const at = Object.values(box).join(" ")
    if (at === ringAt.current) return
    if (!reduced && (ringAt.current || Number(getComputedStyle(ring).opacity) > 0.02)) {
      animate(ring, { ...box, opacity: 1, scale: 1 }, { ...motionPresets.spring.morph, opacity: { duration: motionPresets.duration.fast } })
    } else {
      animate(
        ring,
        { ...box, opacity: [0, 1], scale: [reduced ? 1 : 0.9, 1] },
        reduced
          ? { duration: 0, opacity: { duration: motionPresets.duration.instant } }
          : { duration: 0, opacity: { duration: motionPresets.duration.fast }, scale: motionPresets.spring.snappy },
      )
    }
    ringAt.current = at
  })

  function say(message: string) {
    setNotice((previous) => (previous === message ? `${message}\u00a0` : message))
  }

  function update(next: string[]) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function pick(tag: string | null) {
    setPicked(tag)
    if (tag !== null) say(`${tag} selected. Press Backspace to remove it.`)
  }

  function add() {
    const tag = draft.trim()
    if (!tag) return
    const existing = tags.find((item) => item.toLowerCase() === tag.toLowerCase())
    if (existing) {
      const node = scope.current?.querySelector(`[data-tag="${CSS.escape(existing)}"]`)
      if (node && !reduced) {
        animate(node, { scale: [1, 1.06, 1] }, { duration: 0.32, ease: [...motionPresets.ease.standard] })
      }
      say(`${existing} is already added`)
      return
    }
    update([...tags, tag])
    setDraft("")
    setPicked(null)
    say(`Added ${tag}`)
  }

  function remove(tag: string) {
    update(tags.filter((item) => item !== tag))
    setPicked(null)
    say(`Removed ${tag}`)
    inputRef.current?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key, currentTarget: input } = event
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0
    const index = active === null ? tags.length : tags.indexOf(active)
    let handled = true
    if (key === "Enter" || key === ",") add()
    else if ((key === "Backspace" || key === "Delete") && active !== null) remove(active)
    else if (key === "Backspace" && atStart && tags.length) pick(tags[tags.length - 1])
    else if (key === "ArrowLeft" && (atStart || active !== null) && index > 0) pick(tags[index - 1])
    else if (key === "ArrowRight" && active !== null) pick(tags[index + 1] ?? null)
    else if (key === "Escape" && active !== null) pick(null)
    else handled = false
    if (handled) event.preventDefault()
  }

  function onTagPointer(event: React.MouseEvent<HTMLElement>, tag?: string) {
    if ((event.target as HTMLElement).closest("button")) return
    if (!tag) {
      event.preventDefault()
      return
    }
    pick(active === tag ? null : tag)
    inputRef.current?.focus()
  }

  const move = reduced ? { duration: 0 } : motionPresets.spring.morph

  return (
    <div data-slot="tag-input" className={cn("grid w-full min-w-0 max-w-full", className, classNames?.root)}>
      <Label htmlFor={inputId} data-slot="tag-input-label" className={cn("mb-2", classNames?.label)}>
        {label}
      </Label>
      <motion.div
        ref={scope}
        data-slot="tag-input-control"
        className={cn(
          "overflow-hidden rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 motion-reduce:transition-none",
          classNames?.control,
        )}
        initial={false}
        animate={{ height }}
        transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
      >
        <div
          ref={contentRef}
          className="relative flex min-h-9 cursor-text flex-wrap content-start items-center gap-1.5 p-[7px]"
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return
            event.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <span
            ref={ringRef}
            className="pointer-events-none absolute top-0 left-0 z-10 box-border rounded-full border border-primary bg-accent opacity-0"
            aria-hidden="true"
          />
          <AnimatePresence initial={false}>
            {!draft && !tags.length ? (
              <motion.span
                key="placeholder"
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 text-sm text-muted-foreground whitespace-nowrap"
                aria-hidden="true"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={reduced ? { duration: motionPresets.duration.instant } : { duration: 0.22, ease: [...motionPresets.ease.enter] }}
              >
                {placeholder}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <AnimatePresence initial={false} mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                layout={reduced ? false : "position"}
                className={cn(
                  "group relative inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-full border border-border bg-muted py-0.5 pr-0.5 pl-2 text-sm text-foreground data-[picked]:[&_button]:text-foreground",
                  classNames?.tag,
                )}
                key={tag}
                data-tag={tag}
                data-slot="tag-input-tag"
                data-picked={tag === active || undefined}
                onMouseDown={(event) => onTagPointer(event)}
                onClick={(event) => onTagPointer(event, tag)}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: `blur(${motionPresets.blur.soft}px)` }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                exit={
                  reduced
                    ? { opacity: 0, transition: { duration: 0 } }
                    : {
                        opacity: 0,
                        scale: 0.9,
                        filter: `blur(${motionPresets.blur.subtle}px)`,
                        transition: { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] },
                      }
                }
                transition={
                  reduced
                    ? { duration: motionPresets.duration.instant }
                    : {
                        ...motionPresets.spring.morph,
                        layout: move,
                        opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
                        filter: { duration: 0.22, ease: [...motionPresets.ease.enter] },
                      }
                }
              >
                <span className="relative z-20 min-w-0 break-all">{tag}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="relative z-20 size-5 rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                  aria-label={`Remove ${tag}`}
                  onClick={() => remove(tag)}
                >
                  <X aria-hidden="true" />
                </Button>
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.div layout={reduced ? false : "position"} transition={{ layout: move }} className="min-w-20 flex-1 basis-[100px]">
            <Input
              ref={inputRef}
              id={inputId}
              value={draft}
              onChange={(event) => {
                setDraft(event.currentTarget.value)
                setPicked(null)
              }}
              onKeyDown={onKeyDown}
              onBlur={() => {
                add()
                setPicked(null)
              }}
              placeholder={tags.length ? "" : placeholder}
              aria-describedby={hintId}
              data-slot="tag-input-input"
              className={cn(
                "h-7 min-h-7 border-0 bg-transparent px-1 shadow-none placeholder:text-transparent focus-visible:ring-0 dark:bg-transparent",
                classNames?.input,
              )}
            />
          </motion.div>
        </div>
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {notice}
      </span>
      <FieldMessage id={hintId} text={description} className={classNames?.description} />
    </div>
  )
}
