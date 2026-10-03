"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TreeNode = {
  id: string
  label: string
  children?: TreeNode[]
  icon?: React.ReactNode
}

export type TreeViewClassNames = {
  root?: string
  row?: string
  item?: string
  icon?: string
  label?: string
}

export type TreeViewProps = {
  nodes: TreeNode[]
  defaultExpandedIds?: string[]
  expandedIds?: string[]
  onExpandedChange?: (expandedIds: string[]) => void
  onSelect?: (node: TreeNode) => void
  "aria-label"?: string
  className?: string
  classNames?: TreeViewClassNames
}

type VisibleNode = {
  node: TreeNode
  depth: number
  parentId?: string
  position: number
  setSize: number
}

const rowHeight = 38
const still = { duration: 0 } as const
const fadeIn = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] } as const
const fadeOut = { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] } as const
const blur = (px: number) => `blur(${px}px)`

function flatten(nodes: TreeNode[], expanded: ReadonlySet<string>, depth = 1, parentId?: string): VisibleNode[] {
  return nodes.flatMap((node, index) => [
    { node, depth, parentId, position: index + 1, setSize: nodes.length },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, depth + 1, node.id) : []),
  ])
}

function fileTone(label: string) {
  const name = label.toLowerCase()
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return "text-primary"
  if (name.endsWith(".css")) return "text-chart-2"
  if (name.endsWith(".md")) return "text-chart-3"
  if (name.endsWith(".json")) return "text-chart-4"
  return "text-muted-foreground"
}

function FolderIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={open ? "open" : "closed"}
        className="absolute inset-0 grid place-items-center"
        initial={reduced ? false : { opacity: 0, scale: 0.6, filter: blur(motionPresets.blur.subtle) }}
        animate={{ opacity: 1, scale: 1, filter: blur(0) }}
        exit={
          reduced
            ? { opacity: 0, transition: still }
            : { opacity: 0, scale: 0.6, filter: blur(motionPresets.blur.subtle), transition: fadeOut }
        }
        transition={reduced ? still : { ...motionPresets.spring.snappy, opacity: fadeIn, filter: fadeIn }}
      >
        {open ? <FolderOpen size={16} strokeWidth={1.7} /> : <Folder size={16} strokeWidth={1.7} />}
      </motion.span>
    </AnimatePresence>
  )
}

export function TreeView({
  nodes,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,
  onSelect,
  "aria-label": ariaLabel = "File tree",
  className,
  classNames,
}: TreeViewProps) {
  const reduced = useReducedMotion() ?? false
  const selectionLayoutId = `tree-selection-${React.useId()}`
  const [internalExpanded, setInternalExpanded] = React.useState(() => new Set(defaultExpandedIds))
  const [focusedId, setFocusedId] = React.useState<string | null>(nodes[0]?.id ?? null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [openedId, setOpenedId] = React.useState<string | null>(null)
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const expanded = expandedIds ? new Set(expandedIds) : internalExpanded
  const visible = flatten(nodes, expanded)
  const focusableId = visible.some(({ node }) => node.id === focusedId) ? focusedId : (visible[0]?.node.id ?? null)
  const openedIndex = visible.findIndex(({ node }) => node.id === openedId)

  function setExpanded(next: Set<string>) {
    if (!expandedIds) setInternalExpanded(next)
    onExpandedChange?.([...next])
  }

  function toggle(node: TreeNode) {
    if (!node.children?.length) return
    const next = new Set(expanded)
    if (next.has(node.id)) next.delete(node.id)
    else {
      next.add(node.id)
      setOpenedId(node.id)
    }
    setExpanded(next)
  }

  function focus(id: string) {
    setFocusedId(id)
    const row = refs.current.get(id)
    if (row) row.focus()
    else requestAnimationFrame(() => refs.current.get(id)?.focus())
  }

  function select(node: TreeNode) {
    setSelectedId(node.id)
    onSelect?.(node)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, item: VisibleNode, index: number) {
    const { node } = item
    if (event.key === "ArrowDown") {
      event.preventDefault()
      focus(visible[Math.min(index + 1, visible.length - 1)].node.id)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      focus(visible[Math.max(index - 1, 0)].node.id)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      focus(visible[0].node.id)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      focus(visible[visible.length - 1].node.id)
      return
    }
    if (event.key === "ArrowRight" && node.children?.length) {
      event.preventDefault()
      if (!expanded.has(node.id)) toggle(node)
      else if (visible[index + 1]?.parentId === node.id) focus(visible[index + 1].node.id)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (node.children?.length && expanded.has(node.id)) toggle(node)
      else if (item.parentId) focus(item.parentId)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      select(node)
      if (node.children?.length) toggle(node)
    }
  }

  return (
    <div
      data-slot="tree-view"
      className={cn("block w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-2 text-foreground", className, classNames?.root)}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable="false"
    >
      <AnimatePresence initial={false} mode="sync">
        {visible.map((item, index) => {
          const hasChildren = Boolean(item.node.children?.length)
          const isExpanded = hasChildren && expanded.has(item.node.id)
          const isSelected = selectedId === item.node.id
          const delay = openedIndex >= 0 && index > openedIndex ? Math.min(index - openedIndex - 1, 7) * motionPresets.stagger.item : 0
          return (
            <motion.div
              key={item.node.id}
              data-slot="tree-view-row"
              className={cn("relative h-[38px] min-w-0", classNames?.row)}
              layout={reduced ? false : "position"}
              initial={reduced ? false : { height: 0, opacity: 0, x: -6, overflow: "hidden" }}
              animate={{
                height: rowHeight,
                opacity: 1,
                x: 0,
                transitionEnd: { overflow: "visible" },
                transition: reduced
                  ? still
                  : { height: motionPresets.spring.smooth, opacity: { ...fadeIn, delay }, x: { ...motionPresets.spring.smooth, delay } },
              }}
              exit={
                reduced
                  ? { opacity: 0, transition: still }
                  : { height: 0, opacity: 0, x: -4, overflow: "hidden", pointerEvents: "none", transition: { height: motionPresets.spring.smooth, opacity: fadeOut, x: fadeOut } }
              }
              transition={reduced ? still : { layout: motionPresets.spring.smooth }}
            >
              <button
                ref={(element) => {
                  if (element) refs.current.set(item.node.id, element)
                  else refs.current.delete(item.node.id)
                }}
                type="button"
                data-slot="tree-view-item"
                className={cn(
                  "relative mt-0.5 flex h-9 w-full min-w-0 items-center gap-2 rounded-lg px-2.5 text-left text-sm text-muted-foreground outline-none",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  "hover:bg-muted hover:text-foreground",
                  isSelected && "text-foreground",
                  classNames?.item,
                )}
                style={{ paddingLeft: `calc(0.625rem + ${item.depth - 1} * 1.125rem)` }}
                role="treeitem"
                aria-level={item.depth}
                aria-posinset={item.position}
                aria-setsize={item.setSize}
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-selected={isSelected}
                tabIndex={focusableId === item.node.id ? 0 : -1}
                onFocus={() => setFocusedId(item.node.id)}
                onKeyDown={(event) => onKeyDown(event, item, index)}
                onClick={() => {
                  setFocusedId(item.node.id)
                  select(item.node)
                  if (hasChildren) toggle(item.node)
                }}
              >
                {isSelected ? (
                  <motion.span
                    aria-hidden="true"
                    layoutId={selectionLayoutId}
                    className="absolute inset-0 z-0 rounded-lg bg-muted"
                    transition={reduced ? still : motionPresets.spring.morph}
                  />
                ) : null}
                {item.depth > 1 ? (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1 bottom-1 z-10 w-px origin-top bg-border"
                    style={{ left: `calc(1.125rem + ${item.depth - 2} * 1.125rem)` }}
                    initial={reduced ? false : { opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={reduced ? still : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter], delay }}
                  />
                ) : null}
                <motion.span
                  className="relative z-10 grid h-4 w-3.5 shrink-0 place-items-center text-muted-foreground"
                  aria-hidden="true"
                  initial={false}
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={reduced ? still : motionPresets.spring.snappy}
                >
                  {hasChildren ? <ChevronRight size={14} strokeWidth={1.9} /> : null}
                </motion.span>
                <span
                  data-slot="tree-view-icon"
                  className={cn(
                    "relative z-10 grid size-4 shrink-0 place-items-center text-muted-foreground",
                    hasChildren && "text-foreground",
                    !hasChildren && fileTone(item.node.label),
                    classNames?.icon,
                  )}
                  aria-hidden="true"
                >
                  {item.node.icon ?? (hasChildren ? <FolderIcon open={isExpanded} reduced={reduced} /> : <File size={16} strokeWidth={1.7} />)}
                </span>
                <span data-slot="tree-view-label" className={cn("relative z-10 min-w-0 truncate", classNames?.label)}>
                  {item.node.label}
                </span>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
