"use client"

/**
 * Agent tree. Clean-room reimplementation of the observed "who launched whom"
 * arrangement. No source, sample data, icons, or assets were copied.
 *
 * Status color uses host tokens only:
 * running → info (chart-2), done → success (primary), needs-you → warning (chart-4),
 * failed → destructive, stopped → muted.
 */

import * as React from "react"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Hand,
  Loader2,
  Pause,
} from "lucide-react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const AGENT_STATUSES = ["running", "done", "needs-you", "failed", "stopped"] as const

export type AgentStatus = (typeof AGENT_STATUSES)[number]

export type AgentNode = {
  id: string
  parentId: string | null
  /** Bold title. */
  role: string
  /** Subtitle, usually the model name. */
  model: string
  /** Task or prompt body. */
  task: string
  status: AgentStatus
  costUsd: number
  elapsedMs: number
  /** Shown in the failed popover. */
  error?: string
  /** Short avatar text. Initials are derived from the role when omitted. */
  avatarLabel?: string
}

export type AgentTreeBranch = AgentNode & { children: AgentTreeBranch[] }

export type AgentTreeLabels = {
  addAgents: string
  tree: string
  total: string
  running: string
  needsYou: string
  failed: string
  done: string
  stopped: string
  statusRunning: string
  statusDone: string
  statusNeedsYou: string
  statusFailed: string
  statusStopped: string
  retry: string
  dismiss: string
  collapse: string
  expand: string
  children: string
  loading: string
  empty: string
  errorTitle: string
  errorFallback: string
  cost: string
  elapsed: string
}

export type AgentTreeClassNames = {
  root?: string
  header?: string
  summary?: string
  canvas?: string
  node?: string
  edge?: string
  pill?: string
  popover?: string
  empty?: string
  loading?: string
  error?: string
}

export type AgentTreeProps = {
  nodes: readonly AgentNode[]
  /** Controlled collapsed ids. Omit to let the tree remember toggles. */
  collapsedIds?: readonly string[]
  defaultCollapsedIds?: readonly string[]
  onRetry?: (id: string) => void
  onDismiss?: (id: string) => void
  /** Fires after a collapse toggle. `collapsed` is the next state. */
  onToggle?: (id: string, collapsed: boolean) => void
  onAddAgents?: () => void
  renderNodeExtra?: (node: AgentNode) => React.ReactNode
  locale?: "es" | "en"
  labels?: Partial<AgentTreeLabels>
  /**
   * Visually advance running nodes between prop updates.
   * Props stay the source of truth: the extra time resets when they change.
   */
  tick?: boolean
  tickIntervalMs?: number
  /** Dollars added per second of visual tick while a node is running. */
  tickCostPerSecond?: number
  loading?: boolean
  error?: string | null
  nodeWidth?: number
  gapX?: number
  gapY?: number
  className?: string
  classNames?: AgentTreeClassNames
}

export type AgentTreeSummary = {
  total: number
  running: number
  needsYou: number
  failed: number
  done: number
  stopped: number
  costUsd: number
}

type StatusLabelKey = "statusRunning" | "statusDone" | "statusNeedsYou" | "statusFailed" | "statusStopped"

export const AGENT_STATUS_TONE: Record<
  AgentStatus,
  { edgeClass: string; pillClass: string; avatarClass: string; label: StatusLabelKey }
> = {
  running: {
    edgeClass: "stroke-chart-2",
    pillClass: "border-transparent bg-chart-2/15 text-foreground",
    avatarClass: "bg-chart-2/20 text-foreground",
    label: "statusRunning",
  },
  done: {
    edgeClass: "stroke-primary",
    pillClass: "border-transparent bg-primary/15 text-foreground",
    avatarClass: "bg-primary/15 text-foreground",
    label: "statusDone",
  },
  "needs-you": {
    edgeClass: "stroke-chart-4",
    pillClass: "border-transparent bg-chart-4/15 text-foreground",
    avatarClass: "bg-chart-4/20 text-foreground",
    label: "statusNeedsYou",
  },
  failed: {
    edgeClass: "stroke-destructive",
    pillClass: "border-transparent bg-destructive/10 text-destructive",
    avatarClass: "bg-destructive/15 text-destructive",
    label: "statusFailed",
  },
  stopped: {
    edgeClass: "stroke-muted-foreground",
    pillClass: "border-transparent bg-muted text-muted-foreground",
    avatarClass: "bg-muted text-muted-foreground",
    label: "statusStopped",
  },
}

export const AGENT_TREE_LABELS_ES: AgentTreeLabels = {
  addAgents: "+ Agentes",
  tree: "Árbol de agentes",
  total: "en total",
  running: "en curso",
  needsYou: "te necesitan",
  failed: "fallidos",
  done: "listos",
  stopped: "detenidos",
  statusRunning: "En curso",
  statusDone: "Listo",
  statusNeedsYou: "Te necesita",
  statusFailed: "Falló",
  statusStopped: "Detenido",
  retry: "Reintentar",
  dismiss: "Descartar",
  collapse: "Ocultar hijos",
  expand: "Mostrar hijos",
  children: "hijos",
  loading: "Cargando agentes…",
  empty: "Todavía no hay agentes en esta corrida.",
  errorTitle: "No se pudo mostrar el árbol",
  errorFallback: "Este agente se detuvo con un error.",
  cost: "Costo",
  elapsed: "Tiempo",
}

export const AGENT_TREE_LABELS_EN: AgentTreeLabels = {
  addAgents: "+ Agents",
  tree: "Agent tree",
  total: "total",
  running: "running",
  needsYou: "need you",
  failed: "failed",
  done: "done",
  stopped: "stopped",
  statusRunning: "Running",
  statusDone: "Done",
  statusNeedsYou: "Needs you",
  statusFailed: "Failed",
  statusStopped: "Stopped",
  retry: "Retry",
  dismiss: "Dismiss",
  collapse: "Hide children",
  expand: "Show children",
  children: "children",
  loading: "Loading agents…",
  empty: "There are no agents in this run yet.",
  errorTitle: "The tree could not be shown",
  errorFallback: "This agent stopped with an error.",
  cost: "Cost",
  elapsed: "Elapsed",
}

const NODE_WIDTH = 252
const GAP_X = 28
const GAP_Y = 48
const RADIUS = 12
const COLLAPSE_MS = 240

export function uniqueAgents(nodes: readonly AgentNode[]): AgentNode[] {
  const seen = new Set<string>()
  const list: AgentNode[] = []
  for (const node of nodes) {
    if (seen.has(node.id)) continue
    seen.add(node.id)
    list.push(node)
  }
  return list
}

export function buildAgentForest(nodes: readonly AgentNode[]): AgentTreeBranch[] {
  const ordered = uniqueAgents(nodes)
  const branches = new Map<string, AgentTreeBranch>()
  for (const node of ordered) branches.set(node.id, { ...node, children: [] })

  const childIds = new Map<string, string[]>()
  const roots: AgentTreeBranch[] = []
  for (const node of ordered) {
    const branch = branches.get(node.id)
    if (!branch) continue
    const parent = node.parentId ? branches.get(node.parentId) : undefined
    if (parent && parent.id !== node.id) {
      const list = childIds.get(parent.id) ?? []
      list.push(node.id)
      childIds.set(parent.id, list)
    } else {
      roots.push(branch)
    }
  }

  const placed = new Set<string>()
  function attach(id: string, stack: Set<string>): AgentTreeBranch | null {
    if (stack.has(id) || placed.has(id)) return null
    const branch = branches.get(id)
    if (!branch) return null
    placed.add(id)
    stack.add(id)
    const children: AgentTreeBranch[] = []
    for (const childId of childIds.get(id) ?? []) {
      if (stack.has(childId)) continue
      const child = attach(childId, stack)
      if (child) children.push(child)
    }
    branch.children = children
    stack.delete(id)
    return branch
  }

  const forest: AgentTreeBranch[] = []
  for (const root of roots) {
    const branch = attach(root.id, new Set())
    if (branch) forest.push(branch)
  }
  for (const node of ordered) {
    if (placed.has(node.id)) continue
    const branch = attach(node.id, new Set())
    if (branch) forest.push(branch)
  }
  return forest
}

export function summarizeAgents(nodes: readonly Pick<AgentNode, "status" | "costUsd">[]): AgentTreeSummary {
  const summary: AgentTreeSummary = {
    total: 0,
    running: 0,
    needsYou: 0,
    failed: 0,
    done: 0,
    stopped: 0,
    costUsd: 0,
  }
  for (const node of nodes) {
    summary.total += 1
    summary.costUsd += Number.isFinite(node.costUsd) ? node.costUsd : 0
    if (node.status === "running") summary.running += 1
    else if (node.status === "needs-you") summary.needsYou += 1
    else if (node.status === "failed") summary.failed += 1
    else if (node.status === "done") summary.done += 1
    else summary.stopped += 1
  }
  return summary
}

export function formatAgentCost(usd: number, locale: "es" | "en") {
  const value = Number.isFinite(usd) ? usd : 0
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

export function formatAgentElapsed(ms: number) {
  const safe = Number.isFinite(ms) ? Math.max(0, ms) : 0
  const total = Math.floor(safe / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes <= 0) return `${seconds}s`
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`
}

export function agentInitials(role: string, avatarLabel?: string) {
  const explicit = avatarLabel?.trim()
  if (explicit) return Array.from(explicit).slice(0, 2).join("").toUpperCase()
  const words = role.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join("").toUpperCase()
  const first = Array.from(words[0])[0] ?? ""
  const last = Array.from(words[words.length - 1])[0] ?? ""
  return `${first}${last}`.toUpperCase()
}

function roundCoord(value: number) {
  return Math.round(value * 100) / 100
}

/** Orthogonal rounded connector from the parent outlet to the child inlet. */
export function orthogonalEdgePath(x1: number, y1: number, x2: number, y2: number, radius = RADIUS) {
  const dx = x2 - x1
  const dy = y2 - y1
  if (Math.abs(dx) < 0.5 || dy <= 0) {
    return `M ${roundCoord(x1)} ${roundCoord(y1)} L ${roundCoord(x2)} ${roundCoord(y2)}`
  }
  const curve = Math.min(radius, Math.abs(dx) / 2, dy / 2)
  const midY = (y1 + y2) / 2
  if (curve < 0.5) {
    return `M ${roundCoord(x1)} ${roundCoord(y1)} L ${roundCoord(x1)} ${roundCoord(midY)} L ${roundCoord(x2)} ${roundCoord(midY)} L ${roundCoord(x2)} ${roundCoord(y2)}`
  }
  const dir = dx > 0 ? 1 : -1
  return [
    `M ${roundCoord(x1)} ${roundCoord(y1)}`,
    `L ${roundCoord(x1)} ${roundCoord(midY - curve)}`,
    `Q ${roundCoord(x1)} ${roundCoord(midY)} ${roundCoord(x1 + dir * curve)} ${roundCoord(midY)}`,
    `L ${roundCoord(x2 - dir * curve)} ${roundCoord(midY)}`,
    `Q ${roundCoord(x2)} ${roundCoord(midY)} ${roundCoord(x2)} ${roundCoord(midY + curve)}`,
    `L ${roundCoord(x2)} ${roundCoord(y2)}`,
  ].join(" ")
}

export function rowWidth(childWidths: readonly number[], gapX: number) {
  if (childWidths.length === 0) return 0
  return childWidths.reduce((sum, width) => sum + width, 0) + gapX * (childWidths.length - 1)
}

export function subtreeWidth(
  node: { id: string; children: readonly { id: string; children: readonly unknown[] }[] },
  isCollapsed: (id: string) => boolean,
  nodeWidth: number,
  gapX: number,
): number {
  if (isCollapsed(node.id) || node.children.length === 0) return nodeWidth
  const widths = node.children.map((child) =>
    subtreeWidth(child as { id: string; children: { id: string; children: unknown[] }[] }, isCollapsed, nodeWidth, gapX),
  )
  return Math.max(nodeWidth, rowWidth(widths, gapX))
}

export function edgePathsForChildren(childWidths: readonly number[], gapX: number, gapY: number, radius = RADIUS) {
  const total = rowWidth(childWidths, gapX)
  const parentX = total / 2
  const paths: string[] = []
  let cursor = 0
  for (const width of childWidths) {
    paths.push(orthogonalEdgePath(parentX, 0, cursor + width / 2, gapY, radius))
    cursor += width + gapX
  }
  return paths
}

/**
 * Non-destructive retry: the failed node becomes stopped and a running sibling
 * is appended with the same parent, role, model, and task.
 */
export function withRetrySibling(nodes: readonly AgentNode[], failedId: string, nextId: string): AgentNode[] {
  const source = nodes.find((node) => node.id === failedId)
  if (!source || nodes.some((node) => node.id === nextId)) return nodes.map((node) => ({ ...node }))
  const sibling: AgentNode = {
    id: nextId,
    parentId: source.parentId,
    role: source.role,
    model: source.model,
    task: source.task,
    status: "running",
    costUsd: 0,
    elapsedMs: 0,
    avatarLabel: source.avatarLabel,
  }
  return [...nodes.map((node) => (node.id === failedId ? { ...node, status: "stopped" as const } : { ...node })), sibling]
}

/** Drop one node and keep its children by pointing them at the removed parent. */
export function withoutAgent(nodes: readonly AgentNode[], id: string): AgentNode[] {
  const target = nodes.find((node) => node.id === id)
  if (!target) return nodes.map((node) => ({ ...node }))
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => (node.parentId === id ? { ...node, parentId: target.parentId } : { ...node }))
}

function localeLabels(locale: "es" | "en", override?: Partial<AgentTreeLabels>): AgentTreeLabels {
  return { ...(locale === "en" ? AGENT_TREE_LABELS_EN : AGENT_TREE_LABELS_ES), ...override }
}

function useVisualAgents(
  nodes: readonly AgentNode[],
  tick: boolean,
  intervalMs: number,
  costPerSecond: number,
) {
  const signature = nodes.map((node) => `${node.id}\u0000${node.status}\u0000${node.elapsedMs}\u0000${node.costUsd}`).join("\u0001")
  const [tracked, setTracked] = React.useState(signature)
  const [extraMs, setExtraMs] = React.useState(0)
  if (tracked !== signature) {
    setTracked(signature)
    setExtraMs(0)
  }

  React.useEffect(() => {
    if (!tick) return
    const id = window.setInterval(() => {
      setExtraMs((current) => current + intervalMs)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [tick, intervalMs, signature])

  if (!tick || extraMs === 0) return nodes
  return nodes.map((node) => {
    if (node.status !== "running") return node
    return {
      ...node,
      elapsedMs: (Number.isFinite(node.elapsedMs) ? node.elapsedMs : 0) + extraMs,
      costUsd: (Number.isFinite(node.costUsd) ? node.costUsd : 0) + (extraMs / 1000) * costPerSecond,
    }
  })
}

function visibleIds(forest: readonly AgentTreeBranch[], collapsed: ReadonlySet<string>) {
  const ids: string[] = []
  function walk(nodes: readonly AgentTreeBranch[]) {
    for (const node of nodes) {
      ids.push(node.id)
      if (!collapsed.has(node.id)) walk(node.children)
    }
  }
  walk(forest)
  return ids
}

function parentMap(forest: readonly AgentTreeBranch[]) {
  const parents = new Map<string, string | null>()
  function walk(nodes: readonly AgentTreeBranch[], parent: string | null) {
    for (const node of nodes) {
      parents.set(node.id, parent)
      walk(node.children, node.id)
    }
  }
  walk(forest, null)
  return parents
}

type TreeContextValue = {
  labels: AgentTreeLabels
  locale: "es" | "en"
  nodeWidth: number
  gapX: number
  gapY: number
  collapsed: ReadonlySet<string>
  toggle: (id: string) => void
  onRetry?: (id: string) => void
  onDismiss?: (id: string) => void
  renderNodeExtra?: (node: AgentNode) => React.ReactNode
  classNames?: AgentTreeClassNames
  reduceMotion: boolean
  tabId: string | null
  focusNode: (id: string) => void
  rememberFocus: (id: string) => void
  onItemKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, node: AgentTreeBranch) => void
  registerItem: (id: string, element: HTMLDivElement | null) => void
  errorOpenId: string | null
  setErrorOpenId: (id: string | null) => void
  holdErrorOpen: (id: string) => void
  scheduleErrorClose: (id: string) => void
}

const TreeContext = React.createContext<TreeContextValue | null>(null)

function useTreeContext() {
  const value = React.useContext(TreeContext)
  if (!value) throw new Error("AgentTree branches must render inside AgentTree")
  return value
}

function StatusGlyph({ status }: { status: AgentStatus }) {
  const className = "size-3"
  if (status === "running") {
    return <Loader2 aria-hidden className={cn(className, "animate-spin motion-reduce:animate-none")} />
  }
  if (status === "done") return <Check aria-hidden className={className} />
  if (status === "needs-you") return <Hand aria-hidden className={className} />
  if (status === "failed") return <AlertCircle aria-hidden className={className} />
  return <Pause aria-hidden className={className} />
}

function NodeCard({
  node,
  level,
  pos,
  setSize,
}: {
  node: AgentTreeBranch
  level: number
  pos: number
  setSize: number
}) {
  const ctx = useTreeContext()
  const tone = AGENT_STATUS_TONE[node.status]
  const statusLabel = ctx.labels[tone.label]
  const collapsed = ctx.collapsed.has(node.id)
  const childCount = node.children.length
  const cost = formatAgentCost(node.costUsd, ctx.locale)
  const elapsed = formatAgentElapsed(node.elapsedMs)
  const described = [node.role, node.model, node.task.replace(/[.。]+$/u, ""), statusLabel].filter(Boolean).join(". ")

  const pill = (
    <span className="inline-flex items-center gap-1">
      <StatusGlyph status={node.status} />
      {statusLabel}
    </span>
  )

  return (
    <Card
      ref={(element) => ctx.registerItem(node.id, element)}
      role="treeitem"
      tabIndex={ctx.tabId === node.id ? 0 : -1}
      aria-level={level}
      aria-posinset={pos}
      aria-setsize={setSize}
      aria-label={described}
      aria-expanded={childCount > 0 ? !collapsed : undefined}
      data-node-id={node.id}
      data-status={node.status}
      onFocus={() => ctx.rememberFocus(node.id)}
      onKeyDown={(event) => ctx.onItemKeyDown(event, node)}
      onPointerEnter={() => {
        if (node.status === "failed") ctx.holdErrorOpen(node.id)
      }}
      onPointerLeave={() => {
        if (node.status === "failed") ctx.scheduleErrorClose(node.id)
      }}
      size="sm"
      className={cn(
        "w-full gap-2 py-3 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ctx.classNames?.node,
      )}
      style={{ width: ctx.nodeWidth }}
    >
      <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3">
        <Avatar size="sm">
          <AvatarFallback className={tone.avatarClass}>{agentInitials(node.role, node.avatarLabel)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate text-sm font-semibold">{node.role}</CardTitle>
          <p className="truncate text-xs text-muted-foreground">{node.model}</p>
        </div>
        {node.status === "failed" ? (
          <Popover open={ctx.errorOpenId === node.id} onOpenChange={(open) => ctx.setErrorOpenId(open ? node.id : null)}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className={cn("rounded-full", tone.pillClass, ctx.classNames?.pill)}
                aria-label={`${statusLabel}: ${node.role}`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  ctx.holdErrorOpen(node.id)
                }}
              >
                {pill}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className={cn("w-72", ctx.classNames?.popover)}
              onPointerEnter={() => ctx.holdErrorOpen(node.id)}
              onPointerLeave={() => ctx.scheduleErrorClose(node.id)}
            >
              <PopoverHeader>
                <PopoverTitle>{statusLabel}</PopoverTitle>
                <PopoverDescription>
                  {node.error?.trim() || ctx.labels.errorFallback}
                </PopoverDescription>
              </PopoverHeader>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    ctx.setErrorOpenId(null)
                    ctx.onDismiss?.(node.id)
                  }}
                >
                  {ctx.labels.dismiss}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    ctx.setErrorOpenId(null)
                    ctx.onRetry?.(node.id)
                  }}
                >
                  {ctx.labels.retry}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Badge variant="outline" className={cn("h-5 gap-1", tone.pillClass, ctx.classNames?.pill)}>
            {pill}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-3">
        {node.task ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="line-clamp-3 text-left text-xs wrap-break-word text-foreground">{node.task}</p>
            </TooltipTrigger>
            <TooltipContent>{node.task}</TooltipContent>
          </Tooltip>
        ) : (
          <p className="text-xs text-muted-foreground">—</p>
        )}
        {ctx.renderNodeExtra?.(node)}
      </CardContent>
      <CardFooter className="justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground tabular-nums">
          <span className="sr-only">{ctx.labels.cost} </span>
          {cost}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">{ctx.labels.elapsed} </span>
          {elapsed}
        </p>
        {childCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? ctx.labels.expand : ctx.labels.collapse}, ${childCount} ${ctx.labels.children}, ${node.role}`}
            onClick={(event) => {
              event.stopPropagation()
              ctx.toggle(node.id)
            }}
          >
            {collapsed ? <ChevronRight aria-hidden /> : <ChevronDown aria-hidden />}
            <span className="tabular-nums">{childCount}</span>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}

function Branch({
  node,
  level,
  pos,
  setSize,
}: {
  node: AgentTreeBranch
  level: number
  pos: number
  setSize: number
}) {
  const ctx = useTreeContext()
  const open = node.children.length > 0 && !ctx.collapsed.has(node.id)
  const width = subtreeWidth(node, (id) => ctx.collapsed.has(id), ctx.nodeWidth, ctx.gapX)
  const childWidths = node.children.map((child) => subtreeWidth(child, (id) => ctx.collapsed.has(id), ctx.nodeWidth, ctx.gapX))
  const childrenWidth = rowWidth(childWidths, ctx.gapX)
  const paths = edgePathsForChildren(childWidths, ctx.gapX, ctx.gapY, RADIUS)

  return (
    <motion.div
      layout={ctx.reduceMotion ? false : "position"}
      transition={ctx.reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
      className="flex shrink-0 flex-col items-center"
      style={{ width }}
    >
      <div style={{ width: ctx.nodeWidth }}>
        <NodeCard node={node} level={level} pos={pos} setSize={setSize} />
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="children"
            initial={ctx.reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: ctx.reduceMotion ? 0 : COLLAPSE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center" style={{ width: childrenWidth }}>
              <svg aria-hidden width={childrenWidth} height={ctx.gapY} className="overflow-visible">
                {node.children.map((child, index) => (
                  <path
                    key={child.id}
                    data-edge-for={child.id}
                    data-status={child.status}
                    d={paths[index]}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("fill-none stroke-2", AGENT_STATUS_TONE[child.status].edgeClass, ctx.classNames?.edge)}
                  />
                ))}
              </svg>
              <div className="flex items-start" style={{ width: childrenWidth, gap: ctx.gapX }}>
                {node.children.map((child, index) => (
                  <Branch key={child.id} node={child} level={level + 1} pos={index + 1} setSize={node.children.length} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function SummaryChip({ id, value, label }: { id: string; value: number; label: string }) {
  return (
    <span data-summary={id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
      <span className="font-medium text-foreground tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

export function AgentTree({
  nodes,
  collapsedIds,
  defaultCollapsedIds,
  onRetry,
  onDismiss,
  onToggle,
  onAddAgents,
  renderNodeExtra,
  locale = "es",
  labels: labelOverride,
  tick = false,
  tickIntervalMs = 1000,
  tickCostPerSecond = 0.001,
  loading = false,
  error = null,
  nodeWidth = NODE_WIDTH,
  gapX = GAP_X,
  gapY = GAP_Y,
  className,
  classNames,
}: AgentTreeProps) {
  const labels = localeLabels(locale, labelOverride)
  const reducePreference = useReducedMotion() ?? false
  const visualNodes = useVisualAgents(nodes, tick, tickIntervalMs, tickCostPerSecond)
  const unique = React.useMemo(() => uniqueAgents(visualNodes), [visualNodes])
  const forest = React.useMemo(() => buildAgentForest(unique), [unique])
  const summary = React.useMemo(() => summarizeAgents(unique), [unique])
  const [uncontrolled, setUncontrolled] = React.useState<ReadonlySet<string>>(() => new Set(defaultCollapsedIds ?? []))
  const collapsed = React.useMemo(
    () => (collapsedIds ? new Set(collapsedIds) : uncontrolled),
    [collapsedIds, uncontrolled],
  )
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const [errorOpenId, setErrorOpenId] = React.useState<string | null>(null)
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>())
  const closeTimer = React.useRef<number | null>(null)
  const order = React.useMemo(() => visibleIds(forest, collapsed), [forest, collapsed])
  const parents = React.useMemo(() => parentMap(forest), [forest])
  const tabId = focusedId && order.includes(focusedId) ? focusedId : (order[0] ?? null)

  const revealedErrorId =
    errorOpenId && unique.some((item) => item.id === errorOpenId && item.status === "failed") ? errorOpenId : null

  React.useEffect(() => {
    return () => {
      if (closeTimer.current != null) window.clearTimeout(closeTimer.current)
    }
  }, [])

  const registerItem = React.useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) itemRefs.current.set(id, element)
    else itemRefs.current.delete(id)
  }, [])

  const rememberFocus = React.useCallback((id: string) => {
    setFocusedId(id)
  }, [])

  const focusNode = React.useCallback((id: string) => {
    setFocusedId(id)
    itemRefs.current.get(id)?.focus()
  }, [])

  const toggle = React.useCallback(
    (id: string) => {
      const next = !collapsed.has(id)
      if (!collapsedIds) {
        setUncontrolled((current) => {
          const copy = new Set(current)
          if (next) copy.add(id)
          else copy.delete(id)
          return copy
        })
      }
      onToggle?.(id, next)
    },
    [collapsed, collapsedIds, onToggle],
  )

  const holdErrorOpen = React.useCallback((id: string) => {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current)
    setErrorOpenId(id)
  }, [])

  const scheduleErrorClose = React.useCallback((id: string) => {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setErrorOpenId((current) => (current === id ? null : current))
    }, 180)
  }, [])

  const onItemKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, node: AgentTreeBranch) => {
      const index = order.indexOf(node.id)
      const isCollapsed = collapsed.has(node.id)
      if (event.key === "ArrowDown" && index >= 0 && index < order.length - 1) {
        event.preventDefault()
        focusNode(order[index + 1])
      } else if (event.key === "ArrowUp" && index > 0) {
        event.preventDefault()
        focusNode(order[index - 1])
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        if (node.children.length > 0 && isCollapsed) toggle(node.id)
        else if (node.children.length > 0) focusNode(node.children[0].id)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        if (node.children.length > 0 && !isCollapsed) toggle(node.id)
        else {
          const parent = parents.get(node.id)
          if (parent) focusNode(parent)
        }
      } else if (event.key === "Home" && order[0]) {
        event.preventDefault()
        focusNode(order[0])
      } else if (event.key === "End" && order.length > 0) {
        event.preventDefault()
        focusNode(order[order.length - 1])
      } else if ((event.key === "Enter" || event.key === " ") && node.status === "failed") {
        event.preventDefault()
        setErrorOpenId(node.id)
      }
    },
    [order, collapsed, focusNode, toggle, parents],
  )

  const context = React.useMemo<TreeContextValue>(
    () => ({
      labels,
      locale,
      nodeWidth,
      gapX,
      gapY,
      collapsed,
      toggle,
      onRetry,
      onDismiss,
      renderNodeExtra,
      classNames,
      reduceMotion: reducePreference,
      tabId,
      focusNode,
      rememberFocus,
      onItemKeyDown,
      registerItem,
      errorOpenId: revealedErrorId,
      setErrorOpenId,
      holdErrorOpen,
      scheduleErrorClose,
    }),
    [
      labels,
      locale,
      nodeWidth,
      gapX,
      gapY,
      collapsed,
      toggle,
      onRetry,
      onDismiss,
      renderNodeExtra,
      classNames,
      reducePreference,
      tabId,
      focusNode,
      rememberFocus,
      onItemKeyDown,
      registerItem,
      revealedErrorId,
      holdErrorOpen,
      scheduleErrorClose,
    ],
  )

  const showTree = !loading && !error && forest.length > 0

  return (
    <TooltipProvider delayDuration={300}>
      <TreeContext.Provider value={context}>
        <section
          data-slot="agent-tree"
          data-reduce-motion={reducePreference ? "true" : "false"}
          aria-busy={loading || undefined}
          className={cn(
            "flex min-w-0 max-w-full flex-col gap-4 rounded-xl border border-border bg-background p-4 text-foreground",
            className,
            classNames?.root,
          )}
        >
          <header className={cn("flex flex-wrap items-center justify-between gap-3", classNames?.header)}>
            <Button type="button" size="sm" onClick={() => onAddAgents?.()}>
              {labels.addAgents}
            </Button>
            <div
              aria-live={tick ? "off" : "polite"}
              className={cn("flex flex-wrap items-center gap-1.5", classNames?.summary)}
            >
              <SummaryChip id="total" value={summary.total} label={labels.total} />
              <SummaryChip id="running" value={summary.running} label={labels.running} />
              <SummaryChip id="needs-you" value={summary.needsYou} label={labels.needsYou} />
              <SummaryChip id="failed" value={summary.failed} label={labels.failed} />
              <SummaryChip id="done" value={summary.done} label={labels.done} />
              <SummaryChip id="stopped" value={summary.stopped} label={labels.stopped} />
              <span data-summary="cost" className="px-1 text-sm font-medium text-foreground tabular-nums">
                <span className="sr-only">{labels.cost} </span>
                {formatAgentCost(summary.costUsd, locale)}
              </span>
            </div>
          </header>

          {error ? (
            <div
              role="alert"
              className={cn("rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive", classNames?.error)}
            >
              <p className="font-medium">{labels.errorTitle}</p>
              <p className="mt-1 wrap-break-word">{error}</p>
            </div>
          ) : loading ? (
            <div role="status" className={cn("flex items-center gap-2 text-sm text-muted-foreground", classNames?.loading)}>
              <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              {labels.loading}
            </div>
          ) : forest.length === 0 ? (
            <p role="status" className={cn("text-sm text-muted-foreground", classNames?.empty)}>
              {labels.empty}
            </p>
          ) : null}

          {showTree ? (
            <div className={cn("min-w-0 overflow-x-auto", classNames?.canvas)}>
              <LayoutGroup>
                <div
                  role="tree"
                  aria-label={labels.tree}
                  className="flex w-max min-w-full items-start justify-center pb-2"
                  style={{ gap: gapX }}
                >
                  {forest.map((node, index) => (
                    <Branch key={node.id} node={node} level={1} pos={index + 1} setSize={forest.length} />
                  ))}
                </div>
              </LayoutGroup>
            </div>
          ) : null}
        </section>
      </TreeContext.Provider>
    </TooltipProvider>
  )
}
