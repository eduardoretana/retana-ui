"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react"
import { ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type SplitButtonAction = {
  label: string
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: React.ReactNode
}

export type SplitButtonClassNames = {
  root?: string
  primary?: string
  trigger?: string
  menu?: string
  item?: string
  label?: string
  icon?: string
}

export type SplitButtonProps = {
  label: string
  actions: SplitButtonAction[]
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
  classNames?: SplitButtonClassNames
}

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionPresets.duration.instant } }
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionPresets.blur.soft}px)` }
const glyphOut: TargetAndTransition = {
  opacity: 0,
  y: -4,
  filter: `blur(${motionPresets.blur.subtle}px)`,
  transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
}
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } }
const iconEnter: Transition = {
  ...motionPresets.spring.snappy,
  opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
  filter: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
}
const instant = { duration: motionPresets.duration.instant }

function iconKey(node: React.ReactNode): string {
  if (!React.isValidElement(node)) return node == null || typeof node === "boolean" ? "" : String(node)
  const type = node.type as string | { displayName?: string; name?: string }
  return typeof type === "string" ? type : type?.displayName ?? type?.name ?? "icon"
}

function useMorphWidth(content: React.RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto")
  const lastKey = React.useRef(key)
  const armedUntil = React.useRef(0)

  React.useLayoutEffect(() => {
    if (lastKey.current === key) return
    lastKey.current = key
    armedUntil.current = performance.now() + 700
  }, [key])

  React.useEffect(() => {
    const node = content.current
    const slot = node?.parentElement
    if (!node || !slot || typeof ResizeObserver === "undefined") return
    let measured = false
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? 0
      if (!next || !measured || reduced || performance.now() > armedUntil.current) {
        measured = next > 0
        width.jump(next || "auto")
        delete slot.dataset.morphing
        return
      }
      slot.dataset.morphing = ""
      animate(width, next, { ...motionPresets.spring.morph, onComplete: () => { delete slot.dataset.morphing } })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [content, reduced, width])

  return width
}

type Glyph = { id: string; char: string; order: number }
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }))

function useGlyphs(text: string) {
  const [state, setState] = React.useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }))
  if (state.text === text) return state.glyphs
  const prev = [...state.text]
  const next = [...text]
  let start = 0
  let end = 0
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++
  if (start < 2) start = 0
  if (end < 2) end = 0
  const seq = state.seq + 1
  const glyphs = [
    ...state.glyphs.slice(0, start),
    ...toGlyphs(next.slice(start, next.length - end), seq),
    ...state.glyphs.slice(state.glyphs.length - end),
  ]
  setState({ text, seq, glyphs })
  return glyphs
}

function MorphText({ text, reduced, className }: { text: string; reduced: boolean; className?: string }) {
  const glyphs = useGlyphs(text)
  return (
    <span data-slot="split-button-label" className={cn("relative inline-flex min-w-0 flex-none whitespace-pre", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map((glyph) => (
          <motion.span
            key={glyph.id}
            className="inline-block"
            layout={reduced ? false : "position"}
            layoutDependency={text}
            initial={reduced ? fadeIn : glyphIn}
            animate={rest}
            exit={reduced ? fadeOut : glyphOut}
            transition={reduced ? instant : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter], delay: Math.min(glyph.order * motionPresets.stagger.char, 0.1), layout: motionPresets.spring.morph }}
          >
            {glyph.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

export function SplitButton({
  label,
  actions,
  onClick,
  disabled,
  icon,
  variant = "primary",
  className,
  classNames,
}: SplitButtonProps) {
  const reduced = useReducedMotion() ?? false
  const contentRef = React.useRef<HTMLSpanElement>(null)
  const glyph = iconKey(icon)
  const width = useMorphWidth(contentRef, `${glyph}|${label}`, reduced)
  const secondary = variant === "secondary"

  return (
    <DropdownMenu>
      <div
        data-slot="split-button"
        className={cn(
          "inline-flex w-max max-w-full min-w-0 items-stretch overflow-hidden border text-sm font-medium transition-transform has-[[data-slot=split-button-primary]:active]:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none",
          secondary
            ? "rounded-full border-border bg-background text-foreground"
            : "rounded-lg border-primary bg-primary text-primary-foreground",
          className,
          classNames?.root,
        )}
      >
        <button
          data-slot="split-button-primary"
          className={cn(
            "inline-grid min-h-9 min-w-0 flex-1 place-items-center px-3 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            secondary ? "text-xs hover:bg-muted active:bg-muted" : "hover:bg-primary/80 active:bg-primary/80",
            classNames?.primary,
          )}
          type="button"
          onClick={onClick}
          disabled={disabled}
        >
          <motion.span
            className="inline-flex min-w-0 max-w-full items-center overflow-hidden data-morphing:[clip-path:inset(-50%_-0.5rem)]"
            style={{ width }}
            aria-hidden="true"
          >
            <span ref={contentRef} className="inline-flex flex-none items-center gap-2 whitespace-nowrap">
              {icon ? (
                <span data-slot="split-button-icon" className={cn("inline-grid shrink-0 place-items-center [&_svg]:size-4", classNames?.icon)}>
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={glyph}
                      className="col-start-1 row-start-1 inline-flex items-center justify-center"
                      initial={reduced ? fadeIn : iconIn}
                      animate={rest}
                      exit={reduced ? fadeOut : iconOut}
                      transition={reduced ? instant : iconEnter}
                    >
                      {icon}
                    </motion.span>
                  </AnimatePresence>
                </span>
              ) : null}
              <MorphText text={label} reduced={reduced} className={classNames?.label} />
            </span>
          </motion.span>
          <span className="sr-only" aria-live="polite">{label}</span>
        </button>
        <DropdownMenuTrigger
          data-slot="split-button-trigger"
          className={cn(
            "group grid w-9 shrink-0 place-items-center border-l transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            secondary
              ? "w-8 border-border hover:bg-muted data-[state=open]:bg-muted"
              : "border-primary-foreground/25 hover:bg-primary/80 data-[state=open]:bg-primary/80",
            classNames?.trigger,
          )}
          type="button"
          aria-label={`${label} more actions`}
          disabled={disabled}
        >
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" strokeWidth={1.8} aria-hidden="true" />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        data-slot="split-button-menu"
        align="end"
        sideOffset={4}
        collisionPadding={12}
        loop
        className={cn("w-max max-w-[min(20rem,calc(100vw-1.5rem))] min-w-36", classNames?.menu)}
      >
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={`${action.label}-${index}`}
            className={cn("max-w-full min-w-0", classNames?.item)}
            variant={action.destructive ? "destructive" : "default"}
            disabled={action.disabled}
            onSelect={() => action.onSelect?.()}
          >
            {action.icon ? <span className="inline-flex shrink-0" aria-hidden="true">{action.icon}</span> : null}
            <span className="min-w-0 truncate">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
