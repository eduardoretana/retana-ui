"use client"

/* eslint-disable react-hooks/immutability -- Type-ahead state is a stable object updated from key events, not during render. */

/**
 * Clean-room behavior. Visual inspiration only — no premium source,
 * class names, colors, or icons were copied.
 */

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export type TreeNavNode = {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
  children?: TreeNavNode[]
  href?: string
  disabled?: boolean
}

export type TreeNavRenderLink = (
  props: {
    node: TreeNavNode
    href: string
    children: React.ReactNode
  } & React.HTMLAttributes<HTMLElement>,
) => React.ReactElement

export type TreeNavProps = {
  items: TreeNavNode[]
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  selected?: string | null
  defaultSelected?: string | null
  onSelect?: (node: TreeNavNode) => void
  renderIcon?: (node: TreeNavNode, state: { expanded: boolean; selected: boolean }) => React.ReactNode
  renderLink?: TreeNavRenderLink
  header?: React.ReactNode
  footer?: React.ReactNode
  onAddNew?: () => void
  addLabel?: string
  /** Accessible name of the tree. */
  label?: string
  className?: string
}

type FlatNode = {
  node: TreeNavNode
  depth: number
  parentId: string | null
  pos: number
  size: number
}

function flatten(nodes: TreeNavNode[], expanded: ReadonlySet<string>, depth = 1, parentId: string | null = null): FlatNode[] {
  const rows: FlatNode[] = []
  nodes.forEach((node, index) => {
    rows.push({ node, depth, parentId, pos: index + 1, size: nodes.length })
    if (node.children?.length && expanded.has(node.id)) {
      rows.push(...flatten(node.children, expanded, depth + 1, node.id))
    }
  })
  return rows
}

export function TreeNavHeader({
  name,
  role,
  initials,
  action,
  className,
}: {
  name: string
  role?: string
  initials?: string
  action?: React.ReactNode
  className?: string
}) {
  const letters =
    initials ??
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")

  return (
    <div data-slot="tree-nav-header" className={cn("flex items-center gap-3", className)}>
      <Avatar>
        <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">{letters}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {role ? <p className="truncate text-xs text-muted-foreground">{role}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function TreeNav({
  items,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selected,
  defaultSelected = null,
  onSelect,
  renderIcon,
  renderLink,
  header,
  footer,
  onAddNew,
  addLabel = "Add new",
  label = "Navigation",
  className,
}: TreeNavProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(() => new Set(defaultExpanded))
  const [internalSelected, setInternalSelected] = React.useState<string | null>(defaultSelected)
  const [focusedId, setFocusedId] = React.useState<string | null>(items[0]?.id ?? null)
  const uid = React.useId()
  const typing = React.useState(() => ({ buffer: "", timer: null as number | null }))[0]
  const expandedSet = expanded ? new Set(expanded) : internalExpanded
  const selectedId = selected !== undefined ? selected : internalSelected
  const visible = flatten(items, expandedSet)
  const tabId = visible.some((row) => row.node.id === focusedId) ? focusedId : (visible[0]?.node.id ?? null)

  React.useEffect(() => {
    return () => {
      if (typing.timer != null) window.clearTimeout(typing.timer)
    }
  }, [typing])

  function commitExpanded(next: Set<string>) {
    if (!expanded) setInternalExpanded(new Set(next))
    onExpandedChange?.([...next])
  }

  function toggle(id: string, force?: boolean) {
    const next = new Set(expandedSet)
    const open = force ?? !next.has(id)
    if (open) next.add(id)
    else next.delete(id)
    commitExpanded(next)
  }

  function rowDomId(id: string) {
    return `${uid}-${id}`
  }

  function focusRow(id: string) {
    setFocusedId(id)
    const node = document.getElementById(rowDomId(id))
    if (node) node.focus()
    else requestAnimationFrame(() => document.getElementById(rowDomId(id))?.focus())
  }

  function selectNode(node: TreeNavNode) {
    if (node.disabled) return
    if (selected === undefined) setInternalSelected(node.id)
    onSelect?.(node)
  }

  function onRowClick(event: React.MouseEvent<HTMLElement>, row: FlatNode) {
    if (row.node.disabled) {
      event.preventDefault()
      return
    }
    const chevron = (event.target as HTMLElement).closest("[data-tree-chevron]")
    selectNode(row.node)
    setFocusedId(row.node.id)
    if (row.node.children?.length && (chevron || !row.node.href)) {
      event.preventDefault()
      toggle(row.node.id)
    }
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLElement>, row: FlatNode, index: number) {
    const { node } = row
    if (event.key === "ArrowDown") {
      event.preventDefault()
      const next = visible[Math.min(index + 1, visible.length - 1)]
      if (next) focusRow(next.node.id)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      const next = visible[Math.max(index - 1, 0)]
      if (next) focusRow(next.node.id)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      if (visible[0]) focusRow(visible[0].node.id)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      const last = visible[visible.length - 1]
      if (last) focusRow(last.node.id)
      return
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      if (!node.children?.length || node.disabled) return
      if (!expandedSet.has(node.id)) {
        toggle(node.id, true)
        return
      }
      if (node.children[0]) focusRow(node.children[0].id)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (node.children?.length && expandedSet.has(node.id)) {
        toggle(node.id, false)
        return
      }
      if (row.parentId) focusRow(row.parentId)
      return
    }
    if (event.key === " " || event.key === "Enter") {
      if (node.disabled) {
        event.preventDefault()
        return
      }
      if (event.key === " " || !node.href) event.preventDefault()
      selectNode(node)
      if (node.children?.length && !node.href) toggle(node.id)
      return
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      typing.buffer = (typing.buffer + event.key).toLowerCase()
      if (typing.timer != null) window.clearTimeout(typing.timer)
      typing.timer = window.setTimeout(() => {
        typing.buffer = ""
      }, 500)
      const start = Math.max(0, visible.findIndex((item) => item.node.id === node.id))
      const ordered = [...visible.slice(start + 1), ...visible.slice(0, start + 1)]
      const match = ordered.find((item) => item.node.label.toLowerCase().startsWith(typing.buffer))
      if (match) focusRow(match.node.id)
    }
  }

  function renderRows(nodes: TreeNavNode[], depth: number, parentId: string | null) {
    return nodes.map((node, index) => {
      const row: FlatNode = { node, depth, parentId, pos: index + 1, size: nodes.length }
      const flatIndex = visible.findIndex((item) => item.node.id === node.id)
      const open = Boolean(node.children?.length && expandedSet.has(node.id))
      const isSelected = selectedId === node.id
      const className = cn(
        "group/row flex min-h-[38px] w-full min-w-0 items-center gap-2 rounded-md px-2 text-start text-sm text-foreground outline-none",
        "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        "aria-selected:bg-primary/10 aria-selected:text-primary aria-selected:hover:bg-primary/10 aria-selected:[&_svg]:text-primary",
        "[&_svg]:text-muted-foreground",
        node.disabled && "pointer-events-none opacity-50",
      )
      const shared: React.HTMLAttributes<HTMLElement> = {
        id: rowDomId(node.id),
        role: "treeitem",
        tabIndex: node.id === tabId ? 0 : -1,
        "aria-selected": isSelected,
        "aria-level": depth,
        "aria-posinset": index + 1,
        "aria-setsize": nodes.length,
        "aria-disabled": node.disabled || undefined,
        "aria-expanded": node.children?.length ? open : undefined,
        className,
        onClick: (event) => onRowClick(event, row),
        onKeyDown: (event) => onRowKeyDown(event, row, flatIndex),
      }
      const content = (
        <>
          {node.children?.length ? (
            <span data-tree-chevron="" className="grid size-4 shrink-0 place-items-center" aria-hidden="true">
              <ChevronRight
                className={cn(
                  "size-4 transition-transform duration-200 motion-reduce:transition-none",
                  open ? "rotate-90" : "rtl:rotate-180",
                )}
              />
            </span>
          ) : (
            <span className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span className="grid size-4 shrink-0 place-items-center" aria-hidden="true">
            <NodeIcon node={node} expanded={open} selected={isSelected} renderIcon={renderIcon} />
          </span>
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
          {node.count != null ? (
            <span className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">{node.count}</span>
          ) : null}
        </>
      )

      let control: React.ReactNode
      if (node.href && renderLink) {
        control = renderLink({ node, href: node.href, children: content, ...shared })
      } else if (node.href) {
        control = (
          <a href={node.href} {...(shared as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
            {content}
          </a>
        )
      } else {
        control = (
          <button type="button" {...(shared as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
            {content}
          </button>
        )
      }

      return (
        <div key={node.id} className="min-w-0">
          {control}
          {node.children?.length ? (
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden" inert={open ? undefined : true} aria-hidden={open ? undefined : true}>
                <div role="group" className="ms-3.5 border-s border-border ps-1.5">
                  {renderRows(node.children, depth + 1, node.id)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )
    })
  }

  return (
    <section
      data-slot="tree-nav"
      className={cn("flex min-w-0 flex-col gap-3 rounded-xl bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10", className)}
    >
      {header}
      {onAddNew ? (
        <Button type="button" variant="ghost" className="h-9 w-full justify-start px-2 text-primary hover:text-primary" onClick={onAddNew}>
          <Plus />
          {addLabel}
        </Button>
      ) : null}
      <div role="tree" aria-label={label} className="flex min-w-0 flex-col">
        {renderRows(items, 1, null)}
      </div>
      {footer}
    </section>
  )
}

function NodeIcon({
  node,
  expanded,
  selected,
  renderIcon,
}: {
  node: TreeNavNode
  expanded: boolean
  selected: boolean
  renderIcon?: TreeNavProps["renderIcon"]
}) {
  if (renderIcon) return renderIcon(node, { expanded, selected })
  if (node.icon) return node.icon
  if (node.children?.length) {
    return expanded ? <FolderOpen className="size-4" /> : <Folder className="size-4" />
  }
  return <File className="size-4" />
}
