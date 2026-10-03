"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { flushSync } from "react-dom"
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react"
import type { MotionValue } from "motion/react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ExpandingSearchItem = {
  id: string
  title: string
  /** One short line under the title, such as the type, owner, or last edit. */
  meta?: string
  /** Results gather under this heading, in the order groups first appear in `items`. */
  group?: string
  icon?: React.ReactNode
  /** Extra words that should also find this item. */
  keywords?: string[]
}

export type ExpandingSearchClassNames = {
  root?: string
  shell?: string
  input?: string
  panel?: string
  option?: string
  clear?: string
}

/**
 * A search that waits as an icon button until it is needed.
 * The button morphs into the field, results unfold beneath it, and Escape, choosing a result, or leaving the field empty folds it back.
 * Place it in the space the field may grow into; it fills that space's width and keeps the button on the `anchor` edge.
 */
export type ExpandingSearchProps = {
  /** Names the button, the field, and the results, such as "Search projects and docs". */
  label: string
  items: ExpandingSearchItem[]
  /** Shown before anything is typed, such as recent searches. */
  suggestions?: ExpandingSearchItem[]
  suggestionsLabel?: string
  placeholder?: string
  onSelect?: (item: ExpandingSearchItem) => void
  onExpandedChange?: (expanded: boolean) => void
  /** The widest the field grows. It never grows past its container. */
  expandedWidth?: number
  maxResults?: number
  /** The edge the button sits on; the field grows away from it. */
  anchor?: "start" | "end"
  /** A short tip under the empty state. */
  emptyHint?: string
  className?: string
  classNames?: ExpandingSearchClassNames
}

type Group = { name: string; items: ExpandingSearchItem[] }
type Mode = "suggestions" | "results" | "empty"

const MotionInput = motion.create(Input)
const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const FALLBACK_SIZE = 44

function rank(items: ExpandingSearchItem[], query: string, limit: number) {
  const q = query.toLocaleLowerCase()
  const scored: { item: ExpandingSearchItem; score: number; order: number }[] = []
  items.forEach((item, order) => {
    const title = item.title.toLocaleLowerCase()
    const at = title.indexOf(q)
    const extra = [item.meta ?? "", ...(item.keywords ?? [])].some((word) => word.toLocaleLowerCase().includes(q))
    const score = at === 0 ? 0 : at > 0 && /[\s\-/]/.test(title[at - 1]) ? 1 : at > 0 ? 2 : extra ? 3 : -1
    if (score >= 0) scored.push({ item, score, order })
  })
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map((entry) => entry.item)
}

function groupBy(list: ExpandingSearchItem[], source: ExpandingSearchItem[]): Group[] {
  const order = new Map<string, number>()
  source.forEach((item, index) => {
    const name = item.group ?? ""
    if (!order.has(name)) order.set(name, index)
  })
  const groups = new Map<string, ExpandingSearchItem[]>()
  list.forEach((item) => {
    const name = item.group ?? ""
    groups.set(name, [...(groups.get(name) ?? []), item])
  })
  return [...groups]
    .sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0))
    .map(([name, items]) => ({ name, items }))
}

function Match({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-medium text-foreground">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

function Panel({ width, reduced, className, children }: { width: MotionValue<number>; reduced: boolean; className?: string; children: React.ReactNode }) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const height = useMotionValue(0)
  React.useLayoutEffect(() => {
    const panel = panelRef.current
    const body = bodyRef.current
    if (!panel || !body || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const next = body.offsetHeight + panel.offsetHeight - panel.clientHeight
      if (reduced) height.jump(next)
      else animate(height, next, motionPresets.spring.smooth)
    })
    observer.observe(body)
    return () => observer.disconnect()
  }, [height, reduced])
  return (
    <motion.div
      ref={panelRef}
      className={cn(
        "absolute top-[calc(100%+8px)] z-40 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
        className,
      )}
      style={{ width, height: reduced ? "auto" : height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: reduced ? 0.15 : motionPresets.duration.fast, ease: enter } }}
      exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : 0.12, ease: standard } }}
    >
      <div ref={bodyRef} className="relative max-h-[min(22rem,60vh)] w-[calc(var(--es-width,360px)-2px)] overflow-x-hidden overflow-y-auto overscroll-contain p-1.5">
        {children}
      </div>
    </motion.div>
  )
}

function offsetWithin(node: HTMLElement, container: HTMLElement) {
  let top = 0
  let current: HTMLElement | null = node
  while (current && current !== container) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return top
}

type ListboxProps = {
  id: string
  label: string
  groups: Group[]
  query: string
  activeIndex: number
  optionId: (item: ExpandingSearchItem) => string
  reduced: boolean
  keyboard: React.RefObject<boolean>
  optionClassName?: string
  onHover: (index: number) => void
  onChoose: (item: ExpandingSearchItem) => void
}

function Listbox({ id, label, groups, query, activeIndex, optionId, reduced, keyboard, optionClassName, onHover, onChoose }: ListboxProps) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const flat = groups.flatMap((group) => group.items)
  const layoutKey = flat.map((item) => item.id).join("|")
  const activeItem = flat[activeIndex]
  const activeId = activeItem ? optionId(activeItem) : ""
  const travel = useMotionValue(0)
  const fade = useMotionValue(1)
  const last = React.useRef<{ id: string; set: string; top: number } | null>(null)

  React.useLayoutEffect(() => {
    const list = listRef.current
    const row = activeId ? document.getElementById(activeId) : null
    if (!list || !row) {
      last.current = null
      return
    }
    const top = offsetWithin(row, list)
    const previous = last.current
    last.current = { id: activeId, set: layoutKey, top }
    if (previous?.id === activeId) return
    if (previous && previous.set === layoutKey && !reduced) {
      const velocity = travel.getVelocity()
      travel.jump(previous.top + travel.get() - top)
      animate(travel, 0, { ...motionPresets.spring.snappy, velocity })
    } else {
      travel.jump(0)
      if (reduced) fade.jump(1)
      else {
        fade.jump(0)
        animate(fade, 1, { duration: 0.12, ease: enter })
      }
    }
    if (keyboard.current) row.scrollIntoView({ block: "nearest" })
  }, [activeId, layoutKey, reduced, travel, fade, keyboard])

  return (
    <div ref={listRef} id={id} role="listbox" aria-label={label} className="relative isolate flex flex-col gap-1">
      <AnimatePresence mode="popLayout" initial={false}>
        {groups.map((group) => {
          const headingId = `${id}-${group.name || "results"}`.replace(/\s+/g, "-")
          return (
            <motion.div
              key={group.name}
              role="group"
              aria-labelledby={group.name ? headingId : undefined}
              className="relative"
              layout={reduced ? false : "position"}
              layoutDependency={layoutKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ opacity: { duration: motionPresets.duration.fast, ease: enter }, layout: motionPresets.spring.smooth }}
            >
              {group.name ? (
                <div id={headingId} className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground" role="presentation">
                  {group.name}
                </div>
              ) : null}
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((item) => {
                  const position = flat.indexOf(item)
                  const active = position === activeIndex
                  return (
                    <motion.div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={active}
                      data-active={active || undefined}
                      className={cn(
                        "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-foreground select-none",
                        optionClassName,
                      )}
                      layout={reduced ? false : "position"}
                      layoutDependency={layoutKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.08 } }}
                      transition={{ opacity: { duration: motionPresets.duration.fast, ease: enter }, layout: motionPresets.spring.smooth }}
                      onPointerMove={() => {
                        if (!active) {
                          keyboard.current = false
                          onHover(position)
                        }
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onChoose(item)}
                    >
                      {active ? <motion.span className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-accent" style={{ y: travel, opacity: fade }} aria-hidden="true" /> : null}
                      {item.icon ? <span className="grid w-[18px] shrink-0 place-items-center text-muted-foreground data-active:text-foreground" aria-hidden="true">{item.icon}</span> : null}
                      <span className="grid min-w-0">
                        <span className="truncate text-sm text-foreground">
                          <Match text={item.title} query={query} />
                        </span>
                        {item.meta ? <span className="truncate text-xs text-muted-foreground">{item.meta}</span> : null}
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function ExpandingSearch({
  label,
  items,
  suggestions = [],
  suggestionsLabel = "Recent",
  placeholder,
  onSelect,
  onExpandedChange,
  expandedWidth = 360,
  maxResults = 6,
  anchor = "end",
  emptyHint = "Try a shorter word or check the spelling.",
  className,
  classNames,
}: ExpandingSearchProps) {
  const id = React.useId()
  const reduced = useReducedMotion() ?? false
  const rootRef = React.useRef<HTMLDivElement>(null)
  const shellRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(-1)
  const open = React.useRef(false)
  const size = React.useRef({ collapsed: FALLBACK_SIZE, expanded: expandedWidth })
  const width = useMotionValue(FALLBACK_SIZE)
  const keyboard = React.useRef(false)

  const syncShape = React.useCallback((value: number) => {
    const { collapsed, expanded: full } = size.current
    shellRef.current?.style.setProperty("--es-open", String(Math.min(1, Math.max(0, (value - collapsed) / Math.max(1, full - collapsed)))))
  }, [])
  useMotionValueEvent(width, "change", syncShape)

  React.useLayoutEffect(() => {
    const root = rootRef.current
    const shell = shellRef.current
    if (!root || !shell) return
    const measure = () => {
      const collapsed = shell.offsetHeight || FALLBACK_SIZE
      const full = Math.max(collapsed, Math.min(expandedWidth, root.clientWidth))
      size.current = { collapsed, expanded: full }
      root.style.setProperty("--es-width", `${full}px`)
      const goal = open.current ? full : collapsed
      if (width.isAnimating()) animate(width, goal, motionPresets.spring.morph)
      else width.jump(goal)
      syncShape(width.get())
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [expandedWidth, width, syncShape])

  const morphTo = (goal: number) => {
    if (reduced) width.jump(goal)
    else animate(width, goal, goal >= width.get() ? motionPresets.spring.morph : motionPresets.spring.smooth)
  }

  function expand() {
    if (open.current) return
    open.current = true
    flushSync(() => {
      setExpanded(true)
      setFocused(true)
    })
    inputRef.current?.focus({ preventScroll: true })
    morphTo(size.current.expanded)
    onExpandedChange?.(true)
  }

  function collapse(returnFocus: boolean) {
    if (!open.current) return
    open.current = false
    flushSync(() => {
      setExpanded(false)
      setFocused(false)
      setQuery("")
      setActive(-1)
    })
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true })
    morphTo(size.current.collapsed)
    onExpandedChange?.(false)
  }

  const trimmed = query.trim()
  const results = React.useMemo(() => (trimmed ? rank(items, trimmed, maxResults) : []), [items, trimmed, maxResults])
  const mode: Mode | null = !trimmed ? (suggestions.length ? "suggestions" : null) : results.length ? "results" : "empty"
  const groups = React.useMemo<Group[]>(
    () => (mode === "suggestions" ? [{ name: suggestionsLabel, items: suggestions }] : mode === "results" ? groupBy(results, items) : []),
    [mode, suggestions, suggestionsLabel, results, items],
  )
  const flat = groups.flatMap((group) => group.items)
  const activeIndex = Math.min(active, flat.length - 1)
  const activeItem = flat[activeIndex]
  const optionId = (item: ExpandingSearchItem) => `${id}-${mode}-${item.id}`
  const listboxId = `${id}-${mode}-listbox`
  const panelOpen = expanded && focused && mode !== null
  const announcement = !panelOpen
    ? ""
    : mode === "empty"
      ? `No results for ${trimmed}`
      : mode === "results"
        ? `${flat.length} ${flat.length === 1 ? "result" : "results"}`
        : `${flat.length} ${suggestionsLabel.toLocaleLowerCase()} ${flat.length === 1 ? "item" : "items"}`

  function choose(item: ExpandingSearchItem) {
    collapse(true)
    onSelect?.(item)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      collapse(true)
      return
    }
    if (!panelOpen || !flat.length) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      keyboard.current = true
      setActive(activeIndex < 0 ? (step > 0 ? 0 : flat.length - 1) : (activeIndex + step + flat.length) % flat.length)
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault()
      choose(activeItem)
    }
  }

  const clearHidden = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }

  return (
    <div
      ref={rootRef}
      data-slot="expanding-search"
      className={cn("relative h-11 min-h-11 w-full min-w-11 pointer-events-none", className, classNames?.root)}
      data-anchor={anchor}
    >
      <motion.div
        ref={shellRef}
        data-expanded={expanded || undefined}
        className={cn(
          "pointer-events-auto absolute top-0 h-full overflow-hidden border border-border bg-background text-muted-foreground motion-reduce:transition-none",
          anchor === "start" ? "left-0" : "right-0",
          "data-expanded:border-ring data-expanded:text-foreground",
          "has-[button:focus-visible]:border-ring has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/50",
          "has-[input:focus]:border-ring has-[input:focus]:text-foreground has-[input:focus]:ring-3 has-[input:focus]:ring-ring/50",
          classNames?.shell,
        )}
        style={{
          width,
          borderRadius: "calc(1.375rem - (1.375rem - var(--radius)) * var(--es-open, 0))",
        }}
      >
        <Button
          ref={buttonRef}
          type="button"
          variant="ghost"
          className="absolute inset-0 z-10 h-full w-full rounded-[inherit] border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
          aria-label={label}
          hidden={expanded}
          onClick={expand}
        />
        <Search className="pointer-events-none absolute top-[calc(50%-9px)] left-[calc(1.375rem-10px)] size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        <MotionInput
          ref={inputRef}
          className={cn(
            "absolute inset-0 h-full w-full rounded-none border-0 bg-transparent px-10 text-sm text-foreground shadow-none",
            "focus-visible:ring-0 md:text-sm dark:bg-transparent",
            classNames?.input,
          )}
          type="text"
          role="combobox"
          inert={!expanded}
          value={query}
          placeholder={placeholder ?? label}
          aria-label={label}
          aria-expanded={panelOpen}
          aria-controls={panelOpen && mode !== "empty" ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={panelOpen && activeItem ? optionId(activeItem) : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={expanded ? { duration: reduced ? 0.15 : 0.2, ease: enter, delay: reduced ? 0 : 0.08 } : { duration: reduced ? 0.1 : 0.08, ease: standard }}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setActive(next.trim() ? 0 : -1)
            keyboard.current = false
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (typeof document !== "undefined" && !document.hasFocus()) return
            setFocused(false)
            if (open.current && !inputRef.current?.value.trim()) collapse(false)
          }}
          onKeyDown={handleKeyDown}
        />
        <AnimatePresence initial={false}>
          {expanded && query ? (
            <motion.span
              key="clear"
              className="absolute top-[calc(50%-14px)] right-1.5 z-10"
              initial={clearHidden}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ ...clearHidden, transition: { duration: reduced ? 0.1 : motionPresets.duration.instant, ease: standard } }}
              transition={reduced ? { duration: 0.15 } : { ...motionPresets.spring.snappy, opacity: { duration: motionPresets.duration.fast }, filter: { duration: motionPresets.duration.fast } }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                tabIndex={-1}
                className={cn("size-7 rounded-full text-muted-foreground", classNames?.clear)}
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery("")
                  setActive(-1)
                  inputRef.current?.focus({ preventScroll: true })
                }}
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </Button>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {panelOpen ? (
          <Panel key="panel" width={width} reduced={reduced} className={cn(anchor === "start" ? "left-0" : "right-0", classNames?.panel)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={mode}
                className="relative"
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionPresets.blur.subtle}px)` }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.1, ease: standard } }}
                transition={{ duration: reduced ? 0.15 : motionPresets.duration.fast, ease: enter }}
              >
                {mode === "empty" ? (
                  <div className="grid gap-0.5 px-3 py-3">
                    <p className="m-0 text-sm font-medium wrap-break-word text-foreground">No results for “{trimmed}”</p>
                    <p className="m-0 text-xs text-muted-foreground">{emptyHint}</p>
                  </div>
                ) : (
                  <Listbox
                    id={listboxId}
                    label={mode === "suggestions" ? suggestionsLabel : `Results for ${trimmed}`}
                    groups={groups}
                    query={mode === "results" ? trimmed : ""}
                    activeIndex={activeIndex}
                    optionId={optionId}
                    reduced={reduced}
                    keyboard={keyboard}
                    optionClassName={classNames?.option}
                    onHover={setActive}
                    onChoose={choose}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </Panel>
        ) : null}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  )
}
