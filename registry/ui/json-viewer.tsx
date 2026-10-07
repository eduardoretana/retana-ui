"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotion } from "motion/react"
import type { AnimationPlaybackControls, Transition } from "motion/react"
import { Check, ChevronDown, ChevronRight, ChevronUp, ChevronsDownUp, ChevronsUpDown, Copy, Link2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null" | "other"

export interface JsonViewerCopyDetail {
  kind: "value" | "path"
  path: string
  text: string
}

/**
 * A collapsible tree for JSON. Search highlights matches and opens the branches that hold them,
 * long arrays and objects load in pages, and each row can copy its value or its path.
 */
export interface JsonViewerProps {
  data: unknown
  /** Name of the root in paths, as in `root.users[0].name`. Defaults to "root". */
  rootName?: string
  /** Levels open on first render when `defaultExpanded` is not set. Defaults to 1, which opens the root. */
  defaultExpandDepth?: number
  /** Paths of open branches. */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (paths: string[]) => void
  /** Show the search field. Defaults to true. */
  searchable?: boolean
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /** Children shown per page in a long array or object. Defaults to 50. */
  pageSize?: number
  /** Show copy value and copy path actions. Defaults to true. */
  copyable?: boolean
  onCopy?: (detail: JsonViewerCopyDetail) => void
  /** Called when a row becomes the current one. */
  onSelect?: (detail: { path: string; value: unknown; type: JsonValueType }) => void
  /** Show the path of the current row under the tree. Defaults to true. */
  showPath?: boolean
  /** Height of the scrolling tree area. Defaults to 420px. */
  maxHeight?: number | string
  /** Accessible name of the tree. */
  label?: string
  className?: string
  classNames?: JsonViewerClassNames
}

export type JsonViewerClassNames = {
  root?: string
  toolbar?: string
  search?: string
  tree?: string
  row?: string
  path?: string
}

type Row = {
  id: string
  kind: "node" | "more"
  level: number
  name: string | number | null
  value: unknown
  type: JsonValueType
  count: number
  open: boolean
  parent: string | null
  posinset: number
  setsize: number
  hidden?: number
}

const ROW = 30
const IDENT = /^[A-Za-z_$][\w$]*$/
const scrollSpring: Transition = { type: "spring", visualDuration: 0.45, bounce: 0 }

function typeOf(value: unknown): JsonValueType {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  switch (typeof value) {
    case "object":
      return "object"
    case "string":
      return "string"
    case "number":
    case "bigint":
      return "number"
    case "boolean":
      return "boolean"
    default:
      return "other"
  }
}

const isBranch = (type: JsonValueType) => type === "object" || type === "array"

function entries(value: unknown): [string | number, unknown][] {
  if (Array.isArray(value)) return value.map((item, index) => [index, item])
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>)
  return []
}

const childPath = (parent: string, key: string | number) => typeof key === "number" ? `${parent}[${key}]` : IDENT.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
const within = (ancestor: string, id: string) => id === ancestor || id.startsWith(`${ancestor}.`) || id.startsWith(`${ancestor}[`)

function primitiveText(value: unknown, type: JsonValueType) {
  if (type === "string") return value as string
  if (type === "null") return "null"
  return String(value)
}

function copyText(value: unknown, type: JsonValueType) {
  if (type === "string") return value as string
  if (isBranch(type)) return JSON.stringify(value, null, 2)
  return primitiveText(value, type)
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`
const countLabel = (row: { type: JsonValueType; count: number }) => row.type === "array" ? plural(row.count, "item", "items") : plural(row.count, "key", "keys")

function allBranches(data: unknown, rootName: string) {
  const out: string[] = []
  const visit = (value: unknown, id: string) => {
    if (!isBranch(typeOf(value))) return
    out.push(id)
    for (const [key, child] of entries(value)) visit(child, childPath(id, key))
  }
  visit(data, rootName)
  return out
}

function branchesToDepth(data: unknown, rootName: string, depth: number) {
  const out: string[] = []
  const visit = (value: unknown, id: string, level: number) => {
    if (level >= depth || !isBranch(typeOf(value))) return
    out.push(id)
    for (const [key, child] of entries(value)) visit(child, childPath(id, key), level + 1)
  }
  visit(data, rootName, 0)
  return out
}

type SearchResult = { matches: string[]; ancestors: Set<string>; needed: Map<string, number> }

function searchJson(data: unknown, rootName: string, needle: string): SearchResult {
  const matches: string[] = []
  const ancestors = new Set<string>()
  const needed = new Map<string, number>()
  const frames: [string, number][] = []
  const visit = (value: unknown, id: string, name: string | number | null) => {
    if (matches.length >= 2000) return
    const type = typeOf(value)
    const keyHit = typeof name === "string" && name.toLowerCase().includes(needle)
    const valueHit = !isBranch(type) && primitiveText(value, type).toLowerCase().includes(needle)
    if (keyHit || valueHit) {
      matches.push(id)
      for (const [frame, index] of frames) {
        ancestors.add(frame)
        needed.set(frame, Math.max(needed.get(frame) ?? 0, index + 1))
      }
    }
    if (!isBranch(type)) return
    entries(value).forEach(([key, child], index) => {
      frames.push([id, index])
      visit(child, childPath(id, key), key)
      frames.pop()
    })
  }
  visit(data, rootName, null)
  return { matches, ancestors, needed }
}

function Highlight({ text, needle, current }: { text: string; needle: string; current: boolean }) {
  if (!needle) return <>{text}</>
  const lower = text.toLowerCase()
  const parts: ReactNode[] = []
  let from = 0
  let at = lower.indexOf(needle)
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at))
    parts.push(
      <mark key={at} data-slot="json-viewer-mark" data-current={current || undefined} className="rounded-sm bg-accent px-0.5 text-accent-foreground data-[current]:bg-primary data-[current]:text-primary-foreground">
        {text.slice(at, at + needle.length)}
      </mark>,
    )
    from = at + needle.length
    at = lower.indexOf(needle, from)
  }
  if (from < text.length) parts.push(text.slice(from))
  return <>{parts}</>
}

type CopyState = "idle" | "done" | "error"

function CopyGlyph({ label, icon, onCopy, reduced, className, focusable = false }: { label: string; icon: ReactNode; onCopy: () => Promise<void>; reduced: boolean; className?: string; focusable?: boolean }) {
  const [state, setState] = useState<CopyState>("idle")
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const run = async () => {
    window.clearTimeout(timer.current)
    try {
      await onCopy()
      setState("done")
    } catch {
      setState("error")
    }
    timer.current = window.setTimeout(() => setState("idle"), 1400)
  }
  const glyph = state === "done" ? <Check aria-hidden="true" /> : state === "error" ? <X aria-hidden="true" /> : icon
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      tabIndex={focusable ? undefined : -1}
      data-state={state}
      aria-label={state === "done" ? "Copied" : state === "error" ? "Copy failed" : label}
      title={label}
      className={cn("data-[state=done]:text-primary data-[state=error]:text-destructive", className)}
      onClick={(event) => {
        event.stopPropagation()
        void run()
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={state}
          className="grid place-items-center"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }}
          transition={reduced ? { duration: 0.1 } : { ...motionPresets.spring.snappy, opacity: { duration: 0.12 }, filter: { duration: 0.12 } }}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

async function writeClipboard(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
  await navigator.clipboard.writeText(text)
}

const valueTone: Record<JsonValueType, string> = {
  string: "text-primary",
  number: "text-foreground tabular-nums",
  boolean: "font-medium text-chart-4",
  null: "text-muted-foreground italic",
  other: "text-muted-foreground italic",
  object: "",
  array: "",
}

export const JsonViewer = forwardRef<HTMLDivElement, JsonViewerProps>(function JsonViewer({
  data,
  rootName = "root",
  defaultExpandDepth = 1,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  searchable = true,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  pageSize = 50,
  copyable = true,
  onCopy,
  onSelect,
  showPath = true,
  maxHeight = 420,
  label = "JSON",
  className,
  classNames,
}, ref) {
  const reduced = !!useReducedMotion()
  const uid = useId().replace(/:/g, "")
  const treeRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())

  const [expandedInternal, setExpandedInternal] = useState<string[]>(() => defaultExpanded ?? branchesToDepth(data, rootName, defaultExpandDepth))
  const expandedList = expandedProp ?? expandedInternal
  const base = useMemo(() => new Set(expandedList), [expandedList])
  const setExpanded = useCallback((next: Set<string>) => {
    const list = [...next]
    if (expandedProp === undefined) setExpandedInternal(list)
    onExpandedChange?.(list)
  }, [expandedProp, onExpandedChange])

  const [queryInternal, setQueryInternal] = useState(defaultQuery)
  const query = queryProp ?? queryInternal
  const needle = query.trim().toLowerCase()
  const setQuery = (next: string) => {
    if (queryProp === undefined) setQueryInternal(next)
    onQueryChange?.(next)
  }
  const search = useMemo<SearchResult | null>(() => (needle ? searchJson(data, rootName, needle) : null), [data, needle, rootName])
  const [closedWhileSearching, setClosedWhileSearching] = useState<{ needle: string; ids: Set<string> }>({ needle: "", ids: new Set() })
  const closed = closedWhileSearching.needle === needle ? closedWhileSearching.ids : null
  const [matchIndex, setMatchIndex] = useState(0)
  const matchCount = search?.matches.length ?? 0
  const matchSet = useMemo(() => new Set(search?.matches ?? []), [search])
  const currentMatch = search && matchCount ? search.matches[Math.min(matchIndex, matchCount - 1)] : null

  const isOpen = useCallback((id: string) => {
    if (search && search.ancestors.has(id)) return !closed?.has(id)
    return base.has(id)
  }, [base, closed, search])

  const [pages, setPages] = useState<Record<string, number>>({})
  const limitOf = useCallback((id: string) => Math.max((pages[id] ?? 1) * pageSize, search?.needed.get(id) ?? 0), [pageSize, pages, search])

  const rows = useMemo(() => {
    const out: Row[] = []
    const visit = (value: unknown, id: string, name: string | number | null, level: number, parent: string | null, posinset: number, setsize: number) => {
      const type = typeOf(value)
      const list = isBranch(type) ? entries(value) : []
      const open = isBranch(type) && isOpen(id)
      out.push({ id, kind: "node", level, name, value, type, count: list.length, open, parent, posinset, setsize })
      if (!open) return
      const limit = limitOf(id)
      const shown = list.slice(0, limit)
      const more = list.length - shown.length
      const size = shown.length + (more > 0 ? 1 : 0)
      shown.forEach(([key, child], index) => visit(child, childPath(id, key), key, level + 1, id, index + 1, size))
      if (more > 0) out.push({ id: `${id}::more`, kind: "more", level: level + 1, name: null, value: null, type: "other", count: 0, open: false, parent: id, posinset: size, setsize: size, hidden: more })
    }
    visit(data, rootName, null, 1, null, 1, 1)
    return out
  }, [data, isOpen, limitOf, rootName])

  const [activeRaw, setActiveRaw] = useState(rootName)
  const active = useMemo(() => {
    if (rows.some((row) => row.id === activeRaw)) return activeRaw
    let best = rootName
    for (const row of rows) if (row.kind === "node" && within(row.id, activeRaw) && row.id.length > best.length) best = row.id
    return best
  }, [activeRaw, rootName, rows])
  const activeIndex = Math.max(0, rows.findIndex((row) => row.id === active))
  const activeRow = rows[activeIndex]

  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])
  const lastReported = useRef<string | null>(null)
  useEffect(() => {
    if (!activeRow || activeRow.kind !== "node" || lastReported.current === activeRow.id) return
    lastReported.current = activeRow.id
    onSelectRef.current?.({ path: activeRow.id, value: activeRow.value, type: activeRow.type })
  }, [activeRow])

  const scrollFlight = useRef<AnimationPlaybackControls | null>(null)
  const reveal = useCallback((index: number, center: boolean) => {
    const tree = treeRef.current
    if (!tree) return
    const top = index * ROW
    const bottom = top + ROW
    const view = tree.clientHeight
    const now = tree.scrollTop
    let target = now
    if (center) target = top - view / 2 + ROW / 2
    else if (top < now + 4) target = top - 4
    else if (bottom > now + view - 4) target = bottom - view + 4
    target = Math.max(0, target)
    if (Math.abs(target - now) < 1) return
    scrollFlight.current?.stop()
    if (reduced) {
      tree.scrollTop = target
      return
    }
    scrollFlight.current = animate(now, target, { ...scrollSpring, onUpdate: (value) => { tree.scrollTop = value } })
  }, [reduced])
  useEffect(() => () => scrollFlight.current?.stop(), [])

  const pendingFocus = useRef(false)
  const pendingReveal = useRef<"nearest" | "center" | null>(null)
  const [navigation, setNavigation] = useState(0)
  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false
      rowRefs.current.get(active)?.focus({ preventScroll: true })
    }
    if (pendingReveal.current) {
      reveal(activeIndex, pendingReveal.current === "center")
      pendingReveal.current = null
    }
  }, [active, activeIndex, navigation, reveal])

  const moveTo = (id: string, focus = true, how: "nearest" | "center" = "nearest") => {
    pendingFocus.current = focus
    pendingReveal.current = how
    setActiveRaw(id)
    setNavigation((count) => count + 1)
  }

  const toggle = (id: string, next?: boolean) => {
    const open = isOpen(id)
    const want = next ?? !open
    if (want === open) return
    if (search?.ancestors.has(id)) {
      const ids = new Set(closed ?? [])
      if (want) ids.delete(id)
      else ids.add(id)
      setClosedWhileSearching({ needle, ids })
      if (want && !base.has(id)) setExpanded(new Set(base).add(id))
      return
    }
    const nextSet = new Set(base)
    if (want) nextSet.add(id)
    else nextSet.delete(id)
    setExpanded(nextSet)
  }

  const expandAll = () => {
    setExpanded(new Set(allBranches(data, rootName)))
    setClosedWhileSearching({ needle, ids: new Set() })
  }
  const collapseAll = () => {
    const rootOpen = isBranch(typeOf(data)) ? [rootName] : []
    setExpanded(new Set(rootOpen))
    setClosedWhileSearching({ needle, ids: new Set([...(search?.ancestors ?? [])].filter((id) => id !== rootName)) })
    setPages({})
    moveTo(rootName, false, "nearest")
  }
  const showMore = (parent: string) => setPages((current) => ({ ...current, [parent]: Math.ceil(limitOf(parent) / pageSize) + 1 }))

  const [announcement, setAnnouncement] = useState("")
  const copy = async (row: Row, kind: "value" | "path") => {
    const text = kind === "path" ? row.id : copyText(row.value, row.type)
    try {
      await writeClipboard(text)
      setAnnouncement(`Copied ${kind === "path" ? "path" : "value of"} ${row.id}`)
      onCopy?.({ kind, path: row.id, text })
    } catch (error) {
      setAnnouncement("Copy failed")
      throw error
    }
  }

  const stepMatch = (step: number) => {
    if (!search || !matchCount) return
    const next = ((Math.min(matchIndex, matchCount - 1) + step) % matchCount + matchCount) % matchCount
    setMatchIndex(next)
    moveTo(search.matches[next], false, "center")
  }
  const onQuery = (next: string) => {
    setQuery(next)
    setMatchIndex(0)
    const trimmed = next.trim().toLowerCase()
    if (!trimmed) return
    const first = searchJson(data, rootName, trimmed).matches[0]
    if (first) moveTo(first, false, "center")
  }

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      stepMatch(event.shiftKey ? -1 : 1)
    } else if (event.key === "Escape" && query) {
      event.preventDefault()
      event.stopPropagation()
      onQuery("")
    } else if (event.key === "ArrowDown" && !event.altKey) {
      event.preventDefault()
      moveTo(active, true)
    }
  }

  const onTreeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const row = rows[activeIndex]
    if (!row || event.altKey) return
    const mod = event.metaKey || event.ctrlKey
    if (mod && event.key.toLowerCase() === "c") {
      if (row.kind === "node" && !window.getSelection()?.toString()) {
        event.preventDefault()
        void copy(row, event.shiftKey ? "path" : "value").catch(() => {})
      }
      return
    }
    if (mod) return
    const go = (index: number) => {
      event.preventDefault()
      const target = rows[Math.max(0, Math.min(rows.length - 1, index))]
      if (target) moveTo(target.id)
    }
    switch (event.key) {
      case "ArrowDown":
        go(activeIndex + 1)
        break
      case "ArrowUp":
        go(activeIndex - 1)
        break
      case "Home":
        go(0)
        break
      case "End":
        go(rows.length - 1)
        break
      case "ArrowRight":
        event.preventDefault()
        if (row.kind === "node" && isBranch(row.type)) {
          if (!row.open) toggle(row.id, true)
          else if (row.count) go(activeIndex + 1)
        }
        break
      case "ArrowLeft":
        event.preventDefault()
        if (row.kind === "node" && row.open) toggle(row.id, false)
        else if (row.parent) moveTo(row.parent)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (row.kind === "more") showMore(row.parent!)
        else if (isBranch(row.type)) toggle(row.id)
        break
      case "/":
        if (searchable) {
          event.preventDefault()
          searchRef.current?.focus()
          searchRef.current?.select()
        }
        break
      default:
    }
  }

  const heightStyle = { "--json-max-height": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } as CSSProperties
  const bulk = rows.length > 400
  const rowTransition: Transition = reduced || bulk ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: 0.2, ease: [...motionPresets.ease.standard] } }

  const describe = (row: Row) => {
    const name = row.name === null ? rootName : String(row.name)
    if (row.kind === "more") return `Show ${Math.min(pageSize, row.hidden ?? 0)} more, ${row.hidden} hidden`
    return isBranch(row.type) ? `${name}, ${row.type}, ${countLabel(row)}` : `${name}: ${primitiveText(row.value, row.type)}`
  }

  return (
    <div ref={ref} data-slot="json-viewer" className={cn("grid min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground", className, classNames?.root)} style={heightStyle}>
      {searchable || rows.length > 1 ? (
        <div data-slot="json-viewer-toolbar" className={cn("flex items-center gap-0.5 border-b border-border p-1.5", classNames?.toolbar)}>
          {searchable ? (
            <label data-slot="json-viewer-search" className={cn("relative flex min-h-[34px] min-w-0 flex-1 cursor-text items-center gap-1 rounded-xl bg-muted pr-1 pl-2.5", classNames?.search)}>
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder="Search keys and values"
                aria-label="Search JSON"
                aria-controls={`${uid}-tree`}
                spellCheck={false}
                autoComplete="off"
                className="h-[34px] min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
                onChange={(event) => onQuery(event.target.value)}
                onKeyDown={onSearchKeyDown}
              />
              <AnimatePresence initial={false}>
                {needle ? (
                  <motion.span
                    key="matches"
                    className="inline-flex shrink-0 items-center"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
                    transition={{ duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] }}
                  >
                    <span className="min-w-[3.5ch] px-1 text-right text-xs text-muted-foreground tabular-nums" aria-live="polite">
                      {matchCount ? `${Math.min(matchIndex, matchCount - 1) + 1}/${matchCount}` : "0/0"}
                    </span>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label="Previous match" disabled={!matchCount} onClick={() => stepMatch(-1)}>
                      <ChevronUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label="Next match" disabled={!matchCount} onClick={() => stepMatch(1)}>
                      <ChevronDown aria-hidden="true" />
                    </Button>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </label>
          ) : <span className="flex-1" />}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Expand all" title="Expand all" onClick={expandAll}>
            <ChevronsUpDown aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Collapse all" title="Collapse all" onClick={collapseAll}>
            <ChevronsDownUp aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <LayoutGroup id={uid}>
        <motion.div
          ref={treeRef}
          layoutScroll
          id={`${uid}-tree`}
          role="tree"
          aria-label={label}
          data-slot="json-viewer-tree"
          className={cn("relative max-h-(--json-max-height) overflow-auto p-1.5 font-mono text-[13px] overscroll-contain [--indent:16px] max-[420px]:[--indent:12px]", classNames?.tree)}
          onKeyDown={onTreeKeyDown}
        >
          <AnimatePresence initial={false}>
            {rows.map((row) => {
              const isActive = row.id === active
              const branch = isBranch(row.type)
              const matched = !!search && row.kind === "node" && matchSet.has(row.id)
              const isCurrentMatch = row.id === currentMatch
              const mark = matched ? needle : ""
              return (
                <motion.div
                  key={row.id}
                  ref={(node) => {
                    if (node) rowRefs.current.set(row.id, node)
                    else rowRefs.current.delete(row.id)
                  }}
                  role="treeitem"
                  tabIndex={isActive ? 0 : -1}
                  aria-level={row.level}
                  aria-posinset={row.posinset}
                  aria-setsize={row.setsize}
                  aria-expanded={row.kind === "node" && branch ? row.open : undefined}
                  aria-selected={isActive}
                  aria-label={describe(row)}
                  data-slot="json-viewer-row"
                  data-kind={row.kind}
                  data-active={isActive || undefined}
                  style={{ "--level": row.level - 1 } as CSSProperties}
                  className={cn("group/row relative rounded-lg outline-none", classNames?.row)}
                  initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                  animate={{ height: ROW, opacity: 1, transitionEnd: { overflow: "visible" } }}
                  exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                  transition={rowTransition}
                  onFocus={(event) => {
                    if (event.target === event.currentTarget && row.id !== active) setActiveRaw(row.id)
                  }}
                  onClick={() => {
                    if (row.kind === "more") {
                      showMore(row.parent!)
                      moveTo(row.id)
                      return
                    }
                    if (branch) toggle(row.id)
                    moveTo(row.id)
                  }}
                >
                  {isActive ? <motion.span layoutId={`${uid}-active`} className="absolute inset-y-px inset-x-0 rounded-lg bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.snappy} aria-hidden="true" /> : null}
                  <span className="relative flex h-[30px] min-w-0 items-center gap-1.5 pr-1.5 pl-[calc(4px+var(--level,0)*var(--indent))] whitespace-nowrap" data-kind={row.kind}>
                    {row.kind === "more" ? (
                      <span className="inline-flex items-baseline gap-2.5 pl-5 text-sm">
                        <span className="font-medium">Show {Math.min(pageSize, row.hidden ?? 0)} more</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{row.hidden} hidden</span>
                      </span>
                    ) : (
                      <>
                        <span className={cn("inline-grid size-3.5 shrink-0 place-items-center text-muted-foreground transition-transform motion-reduce:transition-none", row.open && "rotate-90", isActive && branch && "text-foreground")} aria-hidden="true">
                          {branch ? <ChevronRight className="size-3.5" /> : null}
                        </span>
                        <span className={cn("shrink-0", typeof row.name === "number" ? "text-muted-foreground tabular-nums" : "max-w-[45%] truncate max-[420px]:max-w-[40%]")}>
                          {row.name === null ? rootName : typeof row.name === "number" ? row.name : <Highlight text={row.name} needle={mark} current={isCurrentMatch} />}
                        </span>
                        <span className="-ml-1 shrink-0 text-muted-foreground" aria-hidden="true">{row.name === null && branch ? "" : ":"}</span>
                        {branch ? (
                          <span className="inline-flex min-w-0 items-baseline gap-2 overflow-hidden">
                            {!row.open ? (
                              <span className="min-w-0 truncate text-muted-foreground">
                                {row.type === "array" ? "[…]" : `{ ${entries(row.value).slice(0, 3).map(([key]) => key).join(", ")}${row.count > 3 ? ", …" : ""} }`}
                              </span>
                            ) : null}
                            <span className="shrink-0 font-sans text-xs text-muted-foreground tabular-nums">{countLabel(row)}</span>
                          </span>
                        ) : (
                          <span className={cn("min-w-0 truncate", valueTone[row.type])} title={row.type === "string" && (row.value as string).length > 40 ? (row.value as string) : undefined}>
                            {row.type === "string" ? (
                              <>
                                &quot;<Highlight text={row.value as string} needle={mark} current={isCurrentMatch} />&quot;
                              </>
                            ) : (
                              <Highlight text={primitiveText(row.value, row.type)} needle={mark} current={isCurrentMatch} />
                            )}
                          </span>
                        )}
                        {copyable ? (
                          <span
                            data-slot="json-viewer-actions"
                            className="pointer-events-none absolute inset-y-0 right-0.5 flex items-center bg-gradient-to-r from-transparent to-card pl-6 opacity-0 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100 group-data-[active]/row:pointer-events-auto group-data-[active]/row:bg-gradient-to-r group-data-[active]/row:from-transparent group-data-[active]/row:to-muted group-data-[active]/row:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/row:pointer-events-auto [@media(hover:hover)_and_(pointer:fine)]:group-hover/row:opacity-100"
                          >
                            <CopyGlyph label="Copy value" icon={<Copy aria-hidden="true" />} reduced={reduced} onCopy={() => copy(row, "value")} />
                            <CopyGlyph label="Copy path" icon={<Link2 aria-hidden="true" />} reduced={reduced} onCopy={() => copy(row, "path")} />
                          </span>
                        ) : null}
                      </>
                    )}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {showPath && activeRow ? (
        <div data-slot="json-viewer-path" className={cn("flex min-w-0 items-center gap-2.5 border-t border-border py-1.5 pr-1.5 pl-3.5", classNames?.path)}>
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" title={activeRow.kind === "node" ? activeRow.id : activeRow.parent ?? ""}>
            {activeRow.kind === "node" ? activeRow.id : activeRow.parent}
          </code>
          <span className="shrink-0 text-xs text-muted-foreground max-[420px]:hidden">
            {activeRow.kind === "node" ? (isBranch(activeRow.type) ? `${activeRow.type}, ${countLabel(activeRow)}` : activeRow.type) : "page"}
          </span>
          {copyable && activeRow.kind === "node" ? (
            <CopyGlyph key={activeRow.id} focusable className="size-[30px] rounded-lg" label="Copy path" icon={<Copy aria-hidden="true" />} reduced={reduced} onCopy={() => copy(activeRow, "path")} />
          ) : null}
        </div>
      ) : null}
      <span className="sr-only" role="status">{announcement}</span>
    </div>
  )
})
