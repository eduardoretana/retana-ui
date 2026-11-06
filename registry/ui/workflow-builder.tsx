"use client"

/**
 * Clean-room workflow canvas.
 * The host owns the graph. onGraphChangeRequest reports intent.
 * The host applies it with applyWorkflowChange.
 * Cost and tokens are shown as the executor reported them.
 * No @xyflow/react. See docs/learnings/L-KULESZO-workflow-builder.md.
 */

import * as React from "react"
import { Download, Expand, Hand, Minus, MousePointer2, PanelLeft, Play, Plus, Square, Upload } from "lucide-react"
import { useReducedMotionConfig } from "motion/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { expressionCompletions, schemaKeys } from "@/registry/retana/lib/workflow-expr"
import {
  LONG_PRESS_MS,
  applyWorkflowChange,
  categoryLabel,
  cloneGraph,
  connectorPath,
  emptyGraph,
  emptySelection,
  fitViewport,
  formatCost,
  formatDuration,
  graphBounds,
  highlightJson,
  importWorkflow,
  nodeIssues,
  nodePorts,
  nodeSize,
  nodeSubtitle,
  nodeTitle,
  portAnchor,
  previewConnection,
  pushHistory,
  redoHistory,
  resolveNodeGesture,
  runWorkflow,
  sampleConnector,
  typeByName,
  undoHistory,
  createWorkflowSimulator,
  type ConfigField,
  type NodeExecutor,
  type NodeRunState,
  type NodeTypeDefinition,
  type PortTemplate,
  type WorkflowChangeRequest,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowHistory,
  type WorkflowIssue,
  type WorkflowLocale,
  type WorkflowNode,
  type WorkflowRun,
  type WorkflowSelection,
} from "@/registry/retana/lib/workflow-builder"
import { diffGraphs, diffLines, exportWorkflowValue, publishDecision, validateWorkflow, type CredentialRef, type PublishedSnapshot } from "@/registry/retana/lib/workflow-policy"

export type { ConfigField, NodeExecutor, NodeTypeDefinition, WorkflowChangeRequest, WorkflowEdge, WorkflowGraph, WorkflowNode, WorkflowRun, WorkflowSelection } from "@/registry/retana/lib/workflow-builder"
export { applyWorkflowChange, createWorkflowSimulator, importWorkflow, runWorkflow, validateGraph } from "@/registry/retana/lib/workflow-builder"

export type WorkflowBuilderLabels = {
  heading: string
  canvas: string
  instructions: string
  sidebar: string
  hideSidebar: string
  showSidebar: string
  addNode: string
  searchNodes: string
  emptyTitle: string
  emptyHint: string
  loading: string
  errorTitle: string
  toolbar: string
  run: string
  stop: string
  pan: string
  select: string
  zoomIn: string
  zoomOut: string
  fit: string
  importJson: string
  exportJson: string
  importTitle: string
  importHint: string
  importAction: string
  cancel: string
  properties: string
  displayName: string
  close: string
  noIssues: string
  minimap: string
  runPanel: string
  showRuns: string
  hideRuns: string
  start: string
  payload: string
  triggers: string
  errors: string
  timeline: string
  runs: string
  node: string
  status: string
  duration: string
  cost: string
  tokensIn: string
  tokensOut: string
  cacheTokens: string
  noRuns: string
  noTriggers: string
  choose: string
  configured: string
  notConfigured: string
  connectHint: string
  rejected: string
  publish: string
  publishBlocked: string
  diff: string
  rollback: string
  pin: string
  unpin: string
  pinned: string
  runNode: string
  runFrom: string
  inspector: string
  input: string
  output: string
  suggestions: string
  undo: string
  redo: string
  remove: string
  selected: (label: string) => string
  moved: (label: string) => string
  connected: (from: string, to: string) => string
  statusWord: Record<NodeRunState, string>
  categories: Record<string, string>
}

export const workflowBuilderLabels: WorkflowBuilderLabels = {
  heading: "Flujo",
  canvas: "Lienzo del flujo",
  instructions: "Tabula por nodos y puertos. Las flechas mueven el nodo. Enter en un puerto de salida empieza un enlace; Enter en el puerto de entrada lo confirma. Supr borra. Ctrl Z deshace. F encuadra. Esc cierra.",
  sidebar: "Piezas",
  hideSidebar: "Ocultar piezas",
  showSidebar: "Mostrar piezas",
  addNode: "Agregar nodo",
  searchNodes: "Buscar pieza",
  emptyTitle: "Este flujo está vacío",
  emptyHint: "Agrega un nodo para empezar. Nada se guarda solo.",
  loading: "Cargando el flujo",
  errorTitle: "No se pudo mostrar el flujo",
  toolbar: "Controles del lienzo",
  run: "Ejecutar",
  stop: "Detener",
  pan: "Mover el lienzo",
  select: "Seleccionar",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  fit: "Encajar",
  importJson: "Importar JSON",
  exportJson: "Exportar JSON",
  importTitle: "Importar un flujo",
  importHint: "Pega un documento versión 1. Si el JSON falla, el mensaje dice qué corregir.",
  importAction: "Importar",
  cancel: "Cancelar",
  properties: "Propiedades",
  displayName: "Nombre visible",
  close: "Cerrar",
  noIssues: "Sin avisos.",
  minimap: "Minimapa",
  runPanel: "Ejecución",
  showRuns: "Mostrar ejecución",
  hideRuns: "Ocultar ejecución",
  start: "Iniciar flujo",
  payload: "Carga",
  triggers: "Disparadores",
  errors: "Error",
  timeline: "Línea de tiempo",
  runs: "Corridas",
  node: "Nodo",
  status: "Estado",
  duration: "Duración",
  cost: "Costo",
  tokensIn: "Tokens de entrada",
  tokensOut: "Tokens de salida",
  cacheTokens: "Tokens de caché",
  noRuns: "Aún no hay corridas.",
  noTriggers: "No hay disparadores.",
  choose: "Elegir",
  configured: "Configurado",
  notConfigured: "Sin configurar",
  connectHint: "Agregar nodo",
  rejected: "Enlace rechazado",
  publish: "Publicar",
  publishBlocked: "Publicación bloqueada",
  diff: "Diferencias",
  rollback: "Volver a esta versión",
  pin: "Fijar salida",
  unpin: "Quitar fijado",
  pinned: "Salida fijada",
  runNode: "Ejecutar nodo",
  runFrom: "Ejecutar desde aquí",
  inspector: "Entrada y salida",
  input: "Entrada",
  output: "Salida",
  suggestions: "Sugerencias",
  undo: "Deshacer",
  redo: "Rehacer",
  remove: "Quitar selección",
  selected: (label) => `${label} seleccionado`,
  moved: (label) => `${label} se movió`,
  connected: (from, to) => `Enlace de ${from} a ${to}`,
  statusWord: { idle: "En espera", running: "En curso", success: "Listo", error: "Error", skipped: "Omitido", "waiting-approval": "En aprobación" },
  categories: { tools: "Herramientas", logic: "Lógica", action: "Acción" },
}

export const workflowBuilderLabelsEn: WorkflowBuilderLabels = {
  ...workflowBuilderLabels,
  heading: "Workflow",
  canvas: "Workflow canvas",
  sidebar: "Pieces",
  searchNodes: "Search pieces",
  emptyTitle: "This workflow is empty",
  emptyHint: "Add a node to begin. Nothing is saved on its own.",
  loading: "Loading the workflow",
  errorTitle: "The workflow could not be shown",
  run: "Run",
  stop: "Stop",
  publish: "Publish",
  publishBlocked: "Publish blocked",
  notConfigured: "Not configured",
  showRuns: "Show run",
  hideRuns: "Hide run",
  start: "Start workflow",
  timeline: "Timeline",
  runs: "Runs",
  suggestions: "Suggestions",
  undo: "Undo",
  statusWord: { idle: "Idle", running: "Running", success: "Done", error: "Error", skipped: "Skipped", "waiting-approval": "Waiting approval" },
  categories: { tools: "Tools", logic: "Logic", action: "Action" },
  selected: (label) => `${label} selected`,
  moved: (label) => `${label} moved`,
  connected: (from, to) => `Connected ${from} to ${to}`,
}

function withLabels(labels?: Partial<WorkflowBuilderLabels>): WorkflowBuilderLabels {
  return { ...workflowBuilderLabels, ...labels, statusWord: { ...workflowBuilderLabels.statusWord, ...labels?.statusWord }, categories: { ...workflowBuilderLabels.categories, ...labels?.categories } }
}

function useFlag(query: string) {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

function localeOf(locale: string): WorkflowLocale {
  return locale.toLowerCase().startsWith("en") ? "en" : "es"
}

function typingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable
}

type MenuState = { clientX: number; clientY: number; worldX: number; worldY: number; pending?: { source: string; sourcePort: string } }
type Viewport = { x: number; y: number; zoom: number }

export type WorkflowBuilderProps = {
  graph?: WorkflowGraph
  defaultGraph?: WorkflowGraph
  onGraphChange?: (graph: WorkflowGraph) => void
  onGraphChangeRequest?: (request: WorkflowChangeRequest) => void
  selection?: WorkflowSelection
  defaultSelection?: WorkflowSelection
  onSelectionChange?: (selection: WorkflowSelection) => void
  nodeTypes?: readonly NodeTypeDefinition[]
  executor?: NodeExecutor
  run?: WorkflowRun | null
  onRunChange?: (run: WorkflowRun | null) => void
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  locale?: string
  labels?: Partial<WorkflowBuilderLabels>
  className?: string
  compact?: boolean
  workspace?: string
  credentials?: readonly CredentialRef[]
  pinnedData?: Record<string, unknown>
  onPinData?: (nodeId: string, data: unknown | null) => void
  published?: PublishedSnapshot
  onPublishRequest?: (graph: WorkflowGraph) => void
  onRollbackRequest?: (version: number) => void
  onRunNodeRequest?: (nodeId: string, mode: "single" | "from") => void
  onReplayRequest?: (runId: string, fromNodeId?: string) => void
  onApprovalRequest?: (request: { nodeId: string; runId: string; input: unknown }) => Promise<"approve" | "reject">
}

export function WorkflowBuilder({
  graph: graphProp,
  defaultGraph,
  onGraphChange,
  onGraphChangeRequest,
  selection: selectionProp,
  defaultSelection,
  onSelectionChange,
  nodeTypes = [],
  executor,
  run: runProp,
  onRunChange,
  readOnly = false,
  loading = false,
  error = null,
  locale = "es-MX",
  labels,
  className,
  compact = false,
  workspace = "",
  credentials = [],
  pinnedData = {},
  onPinData,
  published,
  onPublishRequest,
  onRollbackRequest,
  onRunNodeRequest,
  onReplayRequest,
  onApprovalRequest,
}: WorkflowBuilderProps) {
  const copy = withLabels(labels)
  const lang = localeOf(locale)
  const mediaReduced = useFlag("(prefers-reduced-motion: reduce)")
  const reduced = Boolean(useReducedMotionConfig()) || mediaReduced
  const coarse = useFlag("(pointer: coarse)")
  const graphControlled = graphProp !== undefined
  const selectionControlled = selectionProp !== undefined
  const runControlled = runProp !== undefined
  const [graphState, setGraphState] = React.useState<WorkflowGraph>(() => cloneGraph(graphProp ?? defaultGraph ?? emptyGraph()))
  const [selectionState, setSelectionState] = React.useState<WorkflowSelection>(() => defaultSelection ?? emptySelection())
  const [runState, setRunState] = React.useState<WorkflowRun | null>(null)
  const graph = graphProp ?? graphState
  const selection = selectionProp ?? selectionState
  const run = runControlled ? (runProp ?? null) : runState
  const history = React.useRef<WorkflowHistory>({ past: [], future: [] })
  const [viewport, setViewport] = React.useState<Viewport>({ x: 32, y: 24, zoom: 1 })
  const viewportRef = React.useRef(viewport)
  const graphRef = React.useRef(graph)
  React.useEffect(() => {
    viewportRef.current = viewport
    graphRef.current = graph
  }, [viewport, graph])
  const [tool, setTool] = React.useState<"select" | "pan">("select")
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [runOpen, setRunOpen] = React.useState(Boolean(run))
  const [menu, setMenu] = React.useState<MenuState | null>(null)
  const [query, setQuery] = React.useState("")
  const [importOpen, setImportOpen] = React.useState(false)
  const [importText, setImportText] = React.useState("")
  const [importErrors, setImportErrors] = React.useState<string[]>([])
  const [announcement, setAnnouncement] = React.useState("")
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const [armed, setArmed] = React.useState<{ source: string; sourcePort: string } | null>(null)
  const [payloadText, setPayloadText] = React.useState('{\n  "text": ""\n}')
  const [narrow, setNarrow] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const worldRef = React.useRef<HTMLDivElement>(null)
  const positions = React.useRef(new Map<string, { x: number; y: number }>())
  const draftRef = React.useRef<SVGPathElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const idCounter = React.useRef(0)
  const headingId = React.useId().replace(/:/g, "")
  const markerId = `${headingId}-arrow`

  React.useEffect(() => {
    positions.current = new Map(graph.nodes.map((node) => [node.id, { ...node.position }]))
  }, [graph])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || compact) return
    const measure = () => setNarrow(root.clientWidth > 0 && root.clientWidth < 480)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [compact])

  const isNarrow = compact || narrow
  const issues = React.useMemo(
    () => validateWorkflow({ graph, registry: nodeTypes, locale: lang, workspace, credentials, pinned: pinnedData }),
    [graph, nodeTypes, lang, workspace, credentials, pinnedData],
  )
  const publication = publishDecision(issues)
  const draftDiff = published ? diffGraphs(published.graph, graph) : null
  const structural = issues.some((issue) => issue.code === "cycle" || issue.code === "dangling-edge" || issue.code === "incompatible-ports")
  const inspected = graph.nodes.find((node) => node.id === selection.nodeIds[0]) ?? null
  const running = run?.status === "running"

  function commitSelection(next: WorkflowSelection) {
    if (!selectionControlled) setSelectionState(next)
    onSelectionChange?.(next)
  }

  function announce(message: string) {
    setAnnouncement(message)
    setFeedback(message)
  }

  function allocate(prefix: string) {
    const taken = new Set([...graphRef.current.nodes.map((node) => node.id), ...graphRef.current.edges.map((edge) => edge.id)])
    let id = ""
    do {
      idCounter.current += 1
      id = `${prefix}-${idCounter.current}`
    } while (taken.has(id))
    return id
  }

  function emit(request: WorkflowChangeRequest) {
    if (readOnly) return
    const current = graphRef.current
    const next = applyWorkflowChange(current, request)
    history.current = pushHistory(history.current, current)
    onGraphChangeRequest?.(request)
    onGraphChange?.(next)
    if (!graphControlled) setGraphState(next)
    graphRef.current = next
  }

  function restore(direction: "undo" | "redo") {
    if (readOnly) return
    const current = graphRef.current
    const step = direction === "undo" ? undoHistory(history.current, current) : redoHistory(history.current, current)
    if (!step) return
    history.current = step.history
    const request: WorkflowChangeRequest = { type: "replace", graph: step.graph }
    onGraphChangeRequest?.(request)
    onGraphChange?.(step.graph)
    if (!graphControlled) setGraphState(step.graph)
    graphRef.current = step.graph
    announce(direction === "undo" ? copy.undo : copy.redo)
  }

  function paintViewport(next: Viewport) {
    viewportRef.current = next
    const world = worldRef.current
    if (world) world.style.transform = `translate(${next.x}px, ${next.y}px) scale(${next.zoom})`
  }

  function selectNode(id: string) {
    commitSelection({ nodeIds: [id], edgeIds: [] })
    const node = graph.nodes.find((entry) => entry.id === id)
    if (node) announce(copy.selected(nodeTitle(node, nodeTypes)))
  }

  function addOfType(type: string, world: { x: number; y: number }, pending?: MenuState["pending"]) {
    const definition = typeByName(nodeTypes, type)
    if (!definition) return
    const id = allocate("node")
    const created: WorkflowNode = { id, type, position: world, config: {} }
    const edges: WorkflowEdge[] = []
    if (pending) {
      const source = graph.nodes.find((entry) => entry.id === pending.source)
      const sourcePort = source ? nodePorts(source, nodeTypes).find((port) => port.id === pending.sourcePort) : undefined
      const input = definition.ports.find((port) => port.direction === "in" && port.kind === sourcePort?.kind)
      if (source && input) {
        const link: WorkflowEdge = { id: allocate("edge"), source: source.id, sourcePort: pending.sourcePort, target: id, targetPort: input.id }
        if (!previewConnection(graph, nodeTypes, link, lang)) edges.push(link)
      }
    }
    emit({ type: "add-graph", nodes: [created], edges })
    commitSelection({ nodeIds: [id], edgeIds: [] })
    setMenu(null)
  }

  function tryConnect(sourceId: string, sourcePort: string, targetId: string, targetPort: string) {
    const link: WorkflowEdge = { id: allocate("edge"), source: sourceId, sourcePort, target: targetId, targetPort }
    const issue = previewConnection(graphRef.current, nodeTypes, link, lang)
    if (issue) {
      announce(`${copy.rejected}. ${issue.message}`)
      return false
    }
    emit({ type: "connect", edge: link })
    setArmed(null)
    announce(copy.connected(sourceId, targetId))
    return true
  }

  async function startRun(mode: "all" | "single" | "from" = "all", startNodeId?: string) {
    if (readOnly || running || structural) return
    if (startNodeId) onRunNodeRequest?.(startNodeId, mode === "from" ? "from" : "single")
    let payload: unknown = payloadText
    try {
      payload = JSON.parse(payloadText)
    } catch {
      payload = { text: payloadText }
    }
    const controller = new AbortController()
    abortRef.current = controller
    setRunOpen(true)
    await runWorkflow({
      graph: graphRef.current,
      registry: nodeTypes,
      executor: executor ?? createWorkflowSimulator(),
      signal: controller.signal,
      payload,
      locale: lang,
      id: allocate("run"),
      mode,
      ...(startNodeId ? { startNodeId } : {}),
      pinned: pinnedData,
      ...(onApprovalRequest ? { onApprovalRequest } : {}),
      onUpdate: (next) => {
        if (!runControlled) setRunState(next)
        onRunChange?.(next)
      },
    })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (typingTarget(event.target)) return
    const key = event.key
    const meta = event.metaKey || event.ctrlKey
    if (key === "Escape") {
      setMenu(null)
      setArmed(null)
      return
    }
    if (meta && key.toLowerCase() === "z") {
      event.preventDefault()
      restore(event.shiftKey ? "redo" : "undo")
      return
    }
    if (meta && key.toLowerCase() === "a") {
      event.preventDefault()
      commitSelection({ nodeIds: graph.nodes.map((node) => node.id), edgeIds: graph.edges.map((edge) => edge.id) })
      return
    }
    if (key === "Delete" || key === "Backspace") {
      if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0) return
      event.preventDefault()
      emit({ type: "remove", nodeIds: selection.nodeIds, edgeIds: selection.edgeIds })
      commitSelection(emptySelection())
      announce(copy.remove)
      return
    }
    if (key === "+" || key === "=") {
      event.preventDefault()
      setViewport((current) => ({ ...current, zoom: Math.min(1.8, Math.round((current.zoom + 0.1) * 10) / 10) }))
    }
    if (key === "-" || key === "_") {
      event.preventDefault()
      setViewport((current) => ({ ...current, zoom: Math.max(0.35, Math.round((current.zoom - 0.1) * 10) / 10) }))
    }
    if (key.toLowerCase() === "f") {
      event.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const next = fitViewport(graphBounds(graph, nodeTypes), { width: canvas.clientWidth, height: canvas.clientHeight })
      setViewport(next)
      paintViewport(next)
    }
  }

  function clientToWorld(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect()
    const view = viewportRef.current
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - view.x) / view.zoom, y: (clientY - rect.top - view.y) / view.zoom }
  }

  const grouped = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    const groups = new Map<string, NodeTypeDefinition[]>()
    for (const entry of nodeTypes) {
      if (needle && !`${entry.title} ${entry.description}`.toLocaleLowerCase(locale).includes(needle)) continue
      const list = groups.get(entry.category) ?? []
      list.push(entry)
      groups.set(entry.category, list)
    }
    return [...groups.entries()]
  }, [nodeTypes, query, locale])

  return (
    <TooltipProvider>
      <section
        ref={rootRef}
        data-slot="workflow-builder"
        data-reduced-motion={reduced ? "true" : "false"}
        data-coarse={coarse ? "true" : "false"}
        data-compact={isNarrow ? "true" : "false"}
        aria-labelledby={headingId}
        className={cn("group/wf flex h-[36rem] min-h-80 min-w-0 flex-col bg-background text-foreground", className)}
        onKeyDown={onKeyDown}
      >
        <h2 id={headingId} className="sr-only">{copy.heading}</h2>
        <p className="sr-only">{copy.instructions}</p>
        <p className="sr-only" aria-live="polite" data-slot="workflow-live">{announcement}</p>
        <div data-slot="workflow-publish" className="flex flex-wrap items-center gap-2 border-b border-border px-2 py-1">
          <Button type="button" size="sm" disabled={readOnly || !publication.ok} onClick={() => publication.ok && onPublishRequest?.(graph)}>
            {copy.publish}
          </Button>
          {!publication.ok ? (
            <p role="status" className="min-w-0 text-xs text-destructive">
              <span className="font-medium">{copy.publishBlocked}. </span>
              {publication.reasons[0]}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{workspace || copy.heading}</p>
          )}
          {draftDiff ? (
            <div data-slot="workflow-diff" className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {diffLines(draftDiff, lang).map((line) => (
                <span key={line} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{line}</span>
              ))}
              {published ? (
                <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={() => onRollbackRequest?.(published.version)}>
                  {copy.rollback}
                </Button>
              ) : null}
            </div>
          ) : null}
          {run ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onReplayRequest?.(run.id)}>
              {copy.timeline}
            </Button>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1">
          {isNarrow ? null : (
            <aside aria-label={copy.sidebar} className={cn("flex shrink-0 flex-col overflow-hidden border-border bg-card", sidebarOpen ? "w-56 border-e" : "w-0")}>
              {sidebarOpen ? <Palette copy={copy} groups={grouped} locale={lang} query={query} onQuery={setQuery} disabled={readOnly} onAdd={(type) => addOfType(type, { x: 48, y: 48 })} /> : null}
            </aside>
          )}
          <div className="relative flex min-w-0 flex-1 flex-col">
            {loading ? (
              <div className="flex flex-1 flex-col gap-2 p-3" aria-busy="true">
                <span className="sr-only">{copy.loading}</span>
                <Skeleton className="h-8 w-40" />
                <Skeleton className="min-h-48 flex-1" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="m-3">
                <AlertTitle>{copy.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div
                ref={canvasRef}
                role="application"
                aria-label={copy.canvas}
                tabIndex={0}
                className="relative min-h-0 flex-1 overflow-hidden bg-muted/30 touch-none outline-none focus-visible:ring-3 focus-visible:ring-ring"
                onPointerDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  const origin = { ...viewportRef.current }
                  const startX = event.clientX
                  const startY = event.clientY
                  const target = event.currentTarget
                  target.setPointerCapture(event.pointerId)
                  const move = (ev: PointerEvent) => paintViewport({ ...origin, x: origin.x + ev.clientX - startX, y: origin.y + ev.clientY - startY })
                  const up = (ev: PointerEvent) => {
                    target.removeEventListener("pointermove", move)
                    target.removeEventListener("pointerup", up)
                    const next = { ...origin, x: origin.x + ev.clientX - startX, y: origin.y + ev.clientY - startY }
                    setViewport(next)
                  }
                  target.addEventListener("pointermove", move)
                  target.addEventListener("pointerup", up)
                }}
              >
                <div
                  ref={worldRef}
                  className="absolute top-0 left-0 origin-top-left bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
                  style={{ width: 4800, height: 3200, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
                >
                  <svg className="pointer-events-none absolute overflow-visible" width={4800} height={3200} aria-hidden="true">
                    <defs>
                      <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                        <path d="M0 0 L8 4 L0 8 Z" className="fill-primary" />
                      </marker>
                    </defs>
                    {graph.edges.map((link) => {
                      const drawn = edgeGeometry(graph, nodeTypes, link)
                      if (!drawn) return null
                      const broken = issues.some((issue) => issue.edgeId === link.id)
                      return <path key={link.id} d={drawn.d} markerEnd={`url(#${markerId})`} className={cn("fill-none", broken ? "stroke-destructive" : "stroke-muted-foreground")} strokeWidth={1.5} />
                    })}
                    <path ref={draftRef} className="fill-none stroke-primary" strokeWidth={1.5} strokeDasharray="4 4" />
                  </svg>
                  {reduced
                    ? null
                    : graph.edges.map((link) => {
                        const drawn = edgeGeometry(graph, nodeTypes, link)
                        if (!drawn) return null
                        return <FlowParticles key={link.id} points={sampleConnector(drawn.from, drawn.to, 12)} />
                      })}
                  {graph.nodes.map((node) => (
                    <NodeView
                      key={node.id}
                      node={node}
                      registry={nodeTypes}
                      copy={copy}
                      selected={selection.nodeIds.includes(node.id)}
                      issues={nodeIssues(issues, node.id)}
                      status={run?.nodes[node.id]?.status ?? "idle"}
                      readOnly={readOnly}
                      onSelect={() => selectNode(node.id)}
                      onNudge={(key) => {
                        if (readOnly) return
                        const step = 16
                        const dx = key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0
                        const dy = key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0
                        if (!dx && !dy) return
                        emit({ type: "move-nodes", moves: [{ id: node.id, x: node.position.x + dx, y: node.position.y + dy }] })
                        announce(copy.moved(nodeTitle(node, nodeTypes)))
                      }}
                      onPort={(port, event) => {
                        if (port.direction === "in" && armed) {
                          tryConnect(armed.source, armed.sourcePort, node.id, port.id)
                          return
                        }
                        if (readOnly || port.direction !== "out") return
                        const start = portAnchor(node, nodePorts(node, nodeTypes), port.id)
                        const target = event.currentTarget
                        const move = (ev: PointerEvent) => {
                          if (start && draftRef.current) draftRef.current.setAttribute("d", connectorPath(start, clientToWorld(ev.clientX, ev.clientY)))
                        }
                        const up = (ev: PointerEvent) => {
                          target.removeEventListener("pointermove", move)
                          target.removeEventListener("pointerup", up)
                          if (draftRef.current) draftRef.current.removeAttribute("d")
                          const hit = document.elementFromPoint(ev.clientX, ev.clientY)
                          const input = hit instanceof Element ? hit.closest<HTMLElement>("[data-port-direction=in]") : null
                          const moved = Math.hypot(ev.clientX - event.clientX, ev.clientY - event.clientY) > 6
                          if (input?.dataset.nodeId && input.dataset.portId) {
                            tryConnect(node.id, port.id, input.dataset.nodeId, input.dataset.portId)
                            return
                          }
                          if (moved) {
                            const world = clientToWorld(ev.clientX, ev.clientY)
                            setMenu({ clientX: ev.clientX, clientY: ev.clientY, worldX: world.x, worldY: world.y, pending: { source: node.id, sourcePort: port.id } })
                          } else setArmed({ source: node.id, sourcePort: port.id })
                        }
                        target.addEventListener("pointermove", move)
                        target.addEventListener("pointerup", up)
                      }}
                      onGesture={(event) => {
                        if (readOnly || tool === "pan") return
                        const pointer = event.pointerType === "touch" ? "touch" : event.pointerType === "pen" ? "pen" : "mouse"
                        const selected = selection.nodeIds.includes(node.id)
                        const target = event.currentTarget
                        const origin = { ...node.position }
                        const state = { held: false, dragged: false }
                        if (pointer !== "touch") target.setPointerCapture(event.pointerId)
                        const timer = window.setTimeout(() => {
                          state.held = true
                          target.setAttribute("data-gesture", "holding")
                        }, LONG_PRESS_MS)
                        const move = (ev: PointerEvent) => {
                          const dx = ev.clientX - event.clientX
                          const dy = ev.clientY - event.clientY
                          const decision = resolveNodeGesture({ pointer, selected, held: state.held, dx, dy, phase: "move" })
                          if (decision === "drag") {
                            state.dragged = true
                            const zoom = viewportRef.current.zoom || 1
                            const x = origin.x + dx / zoom
                            const y = origin.y + dy / zoom
                            positions.current.set(node.id, { x, y })
                            target.parentElement?.style.setProperty("transform", `translate(${x}px, ${y}px)`)
                          }
                        }
                        const up = (ev: PointerEvent) => {
                          window.clearTimeout(timer)
                          target.removeEventListener("pointermove", move)
                          target.removeEventListener("pointerup", up)
                          const dx = ev.clientX - event.clientX
                          const dy = ev.clientY - event.clientY
                          const decision = resolveNodeGesture({ pointer, selected, held: state.held, dx, dy, phase: "up" })
                          if (state.dragged) {
                            const point = positions.current.get(node.id) ?? origin
                            emit({ type: "move-nodes", moves: [{ id: node.id, x: point.x, y: point.y }] })
                          } else if (decision === "open") selectNode(node.id)
                        }
                        target.addEventListener("pointermove", move)
                        target.addEventListener("pointerup", up)
                      }}
                    />
                  ))}
                </div>
                {graph.nodes.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                    <Empty className="pointer-events-auto max-w-sm border border-dashed bg-card">
                      <EmptyHeader>
                        <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                        <EmptyDescription>{copy.emptyHint}</EmptyDescription>
                      </EmptyHeader>
                      <Button type="button" disabled={readOnly || !nodeTypes[0]} onClick={() => nodeTypes[0] && addOfType(nodeTypes[0].type, { x: 48, y: 48 })}>
                        <Plus data-icon="inline-start" />
                        {copy.addNode}
                      </Button>
                    </Empty>
                  </div>
                ) : null}
                <div role="toolbar" aria-label={copy.toolbar} className="absolute inset-x-0 bottom-3 z-20 mx-auto flex w-fit max-w-[calc(100%-1rem)] flex-wrap items-center gap-1 rounded-xl border border-border bg-popover p-1 shadow-md">
                  <IconButton label={copy.stop} disabled={!running} onClick={() => abortRef.current?.abort()}><Square /></IconButton>
                  <IconButton label={copy.run} disabled={readOnly || running || structural} onClick={() => void startRun()}><Play /></IconButton>
                  <Separator orientation="vertical" className="mx-0.5 h-6" />
                  <IconButton label={copy.pan} pressed={tool === "pan"} onClick={() => setTool("pan")}><Hand /></IconButton>
                  <IconButton label={copy.select} pressed={tool === "select"} onClick={() => setTool("select")}><MousePointer2 /></IconButton>
                  <IconButton label={copy.zoomOut} onClick={() => setViewport((current) => ({ ...current, zoom: Math.max(0.35, current.zoom - 0.1) }))}><Minus /></IconButton>
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">{Math.round(viewport.zoom * 100)}%</span>
                  <IconButton label={copy.zoomIn} onClick={() => setViewport((current) => ({ ...current, zoom: Math.min(1.8, current.zoom + 0.1) }))}><Plus /></IconButton>
                  <IconButton label={copy.fit} onClick={() => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const next = fitViewport(graphBounds(graph, nodeTypes), { width: canvas.clientWidth, height: canvas.clientHeight })
                    setViewport(next)
                    paintViewport(next)
                  }}><Expand /></IconButton>
                  <IconButton label={sidebarOpen ? copy.hideSidebar : copy.showSidebar} pressed={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}><PanelLeft /></IconButton>
                  <IconButton label={copy.importJson} disabled={readOnly} onClick={() => setImportOpen(true)}><Upload /></IconButton>
                  <IconButton label={copy.exportJson} onClick={() => void navigator.clipboard?.writeText(JSON.stringify(exportWorkflowValue({ version: 1, workspace, draft: graph, ...(published ? { published } : {}) }), null, 2))}><Download /></IconButton>
                </div>
                <button type="button" aria-label={copy.minimap} className="absolute end-3 bottom-16 z-20 h-24 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <Minimap graph={graph} registry={nodeTypes} />
                </button>
                {feedback ? <p role="status" className="absolute start-3 top-3 z-20 max-w-xs rounded-lg border border-border bg-card px-2 py-1 text-xs shadow-sm">{feedback}</p> : null}
              </div>
            )}
            <div className={cn("border-t border-border bg-card shadow-md transition-[transform,opacity] duration-200", reduced && "duration-0", runOpen ? "translate-y-0 opacity-100" : "pointer-events-none h-0 translate-y-full overflow-hidden opacity-0")}>
              <RunPanel copy={copy} lang={lang} graph={graph} registry={nodeTypes} run={run} issues={issues} payloadText={payloadText} readOnly={readOnly} running={Boolean(running)} onPayload={setPayloadText} onStart={() => void startRun()} onClose={() => setRunOpen(false)} />
            </div>
            {!runOpen && !loading && !error ? (
              <div className="absolute end-3 bottom-3 z-20">
                <Button type="button" size="sm" variant="secondary" onClick={() => setRunOpen(true)}>{copy.showRuns}</Button>
              </div>
            ) : null}
          </div>
          {inspected && !loading && !error ? (
            <Properties
              copy={copy}
              node={inspected}
              registry={nodeTypes}
              issues={issues}
              readOnly={readOnly}
              sheet={isNarrow}
              graph={graph}
              pinned={pinnedData}
              {...(run ? { run } : {})}
              onChange={(config) => emit({ type: "update-node", id: inspected.id, config })}
              onName={(displayName) => emit({ type: "update-node", id: inspected.id, displayName })}
              onClose={() => commitSelection(emptySelection())}
              onPin={(data) => onPinData?.(inspected.id, data)}
              onRunNode={(mode) => void startRun(mode, inspected.id)}
            />
          ) : null}
        </div>
        {menu ? (
          <div role="menu" aria-label={copy.addNode} data-slot="workflow-menu" className="fixed z-40 flex max-h-80 w-64 flex-col gap-2 rounded-xl border border-border bg-popover p-2 shadow-md" style={{ left: Math.max(8, menu.clientX), top: Math.max(8, menu.clientY) }}>
            <Palette copy={copy} groups={grouped} locale={lang} query={query} onQuery={setQuery} disabled={readOnly} onAdd={(type) => addOfType(type, { x: menu.worldX, y: menu.worldY }, menu.pending)} />
          </div>
        ) : null}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{copy.importTitle}</DialogTitle>
              <DialogDescription>{copy.importHint}</DialogDescription>
            </DialogHeader>
            <Textarea value={importText} aria-label={copy.importJson} onChange={(event) => setImportText(event.target.value)} />
            {importErrors.length ? (
              <Alert variant="destructive">
                <AlertTitle>{copy.rejected}</AlertTitle>
                <AlertDescription>{importErrors.join(" ")}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>{copy.cancel}</Button>
              <Button
                type="button"
                onClick={() => {
                  const result = importWorkflow(importText, { registry: nodeTypes, locale: lang })
                  if (!result.ok) {
                    setImportErrors(result.errors)
                    return
                  }
                  emit({ type: "replace", graph: result.graph })
                  setImportOpen(false)
                  setImportText("")
                  setImportErrors([])
                }}
              >
                {copy.importAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </TooltipProvider>
  )
}

function edgeGeometry(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[], edge: WorkflowEdge) {
  const source = graph.nodes.find((node) => node.id === edge.source)
  const target = graph.nodes.find((node) => node.id === edge.target)
  if (!source || !target) return null
  const from = portAnchor(source, nodePorts(source, registry), edge.sourcePort)
  const to = portAnchor(target, nodePorts(target, registry), edge.targetPort)
  if (!from || !to) return null
  return { d: connectorPath(from, to), from, to }
}

function IconButton({ label, children, pressed, disabled, onClick }: { label: string; children: React.ReactNode; pressed?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <Button type="button" size="icon" variant={pressed ? "secondary" : "ghost"} aria-pressed={pressed} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}

function FlowParticles({ points }: { points: { x: number; y: number }[] }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const signature = points.map((point) => `${point.x}:${point.y}`).join("|")
  React.useEffect(() => {
    const frames = points.map((point) => ({ transform: `translate(${point.x}px, ${point.y}px)`, opacity: 0.85 }))
    if (frames.length < 2 || typeof ref.current?.animate !== "function") return
    const animation = ref.current.animate(frames, { duration: 1800, iterations: Infinity, easing: "linear" })
    return () => animation.cancel()
  }, [signature, points])
  return <span ref={ref} aria-hidden data-slot="workflow-particle" className="pointer-events-none absolute top-0 left-0 size-1.5 rounded-full bg-primary" />
}

function Minimap({ graph, registry }: { graph: WorkflowGraph; registry: readonly NodeTypeDefinition[] }) {
  const bounds = graphBounds(graph, registry)
  return (
    <svg viewBox={`${bounds.x - 16} ${bounds.y - 16} ${bounds.width + 32} ${bounds.height + 32}`} className="size-full">
      {graph.nodes.map((node) => {
        const size = nodeSize(nodePorts(node, registry))
        return <rect key={node.id} x={node.position.x} y={node.position.y} width={size.width} height={size.height} rx={12} className="fill-muted stroke-border" />
      })}
    </svg>
  )
}

function Palette({ copy, groups, locale, query, onQuery, disabled, onAdd }: { copy: WorkflowBuilderLabels; groups: [string, NodeTypeDefinition[]][]; locale: WorkflowLocale; query: string; onQuery: (value: string) => void; disabled: boolean; onAdd: (type: string) => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <Input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={copy.searchNodes} aria-label={copy.searchNodes} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3">
          {groups.map(([category, entries]) => (
            <div key={category} className="flex flex-col gap-1">
              <p className="px-1 text-xs font-medium text-muted-foreground">{copy.categories[category] ?? categoryLabel(category, locale)}</p>
              {entries.map((entry) => (
                <Tooltip key={entry.type}>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" className="h-8 justify-start px-2" disabled={disabled} onClick={() => onAdd(entry.type)}>
                      <span className="truncate">{entry.title}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{entry.description}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function NodeView({ node, registry, copy, selected, issues, status, readOnly, onSelect, onNudge, onPort, onGesture }: { node: WorkflowNode; registry: readonly NodeTypeDefinition[]; copy: WorkflowBuilderLabels; selected: boolean; issues: { message: string }[]; status: NodeRunState; readOnly: boolean; onSelect: () => void; onNudge: (key: string) => void; onPort: (port: PortTemplate, event: React.PointerEvent<HTMLButtonElement>) => void; onGesture: (event: React.PointerEvent<HTMLButtonElement>) => void }) {
  const ports = nodePorts(node, registry)
  const size = nodeSize(ports)
  const title = nodeTitle(node, registry)
  const subtitle = nodeSubtitle(node, registry)
  const invalid = issues.length > 0
  return (
    <div data-node-id={node.id} data-slot="workflow-node" data-state={invalid ? "error" : status} className={cn("absolute top-0 left-0 rounded-xl border bg-card text-card-foreground shadow-sm", invalid ? "border-destructive" : selected ? "border-ring ring-2 ring-ring" : "border-border")} style={{ width: size.width, height: size.height, transform: `translate(${node.position.x}px, ${node.position.y}px)` }}>
      <button type="button" disabled={readOnly} aria-pressed={selected} aria-describedby={invalid ? `${node.id}-error` : undefined} aria-label={`${title}${subtitle ? `, ${subtitle}` : ""}, ${invalid ? copy.notConfigured : copy.statusWord[status]}`} className="flex h-full w-full touch-pan-y flex-col gap-0.5 rounded-xl px-3 py-2 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring" onClick={onSelect} onKeyDown={(event) => { if (event.key.startsWith("Arrow")) { event.preventDefault(); event.stopPropagation(); onNudge(event.key) } }} onPointerDown={(event) => { if (event.button === 0) onGesture(event) }}>
        <span className="truncate text-sm font-medium" title={title}>{title}</span>
        {subtitle ? <span className="truncate font-mono text-xs text-muted-foreground">{subtitle}</span> : null}
        <span className={cn("text-xs", invalid ? "text-destructive" : "text-muted-foreground")}>{invalid ? copy.notConfigured : copy.statusWord[status]}</span>
      </button>
      {issues[0] ? <span id={`${node.id}-error`} className="sr-only">{issues[0].message}</span> : null}
      {ports.map((port) => {
        const siblings = ports.filter((entry) => entry.direction === port.direction && entry.role === port.role)
        const index = Math.max(0, siblings.findIndex((entry) => entry.id === port.id))
        const top = (port.role === "primary" ? 36 : 68) + index * 26
        return (
          <button key={port.id} type="button" data-port-id={port.id} data-port-direction={port.direction} data-node-id={node.id} title={port.direction === "out" ? copy.connectHint : port.label} aria-label={`${port.label}, ${port.kind}`} className="absolute z-10 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background touch-none outline-none focus-visible:ring-3 focus-visible:ring-ring group-data-[coarse=true]/wf:size-11" style={{ top, left: port.direction === "out" ? size.width : 0 }} onPointerDown={(event) => { event.stopPropagation(); if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); onPort(port, event) }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onPort(port, event as unknown as React.PointerEvent<HTMLButtonElement>) } }}>
            {port.role === "secondary" ? <span className={cn("pointer-events-none absolute top-1/2 text-[10px] text-muted-foreground", port.direction === "out" ? "right-4 -translate-y-1/2" : "left-4 -translate-y-1/2")}>{port.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function Properties({ copy, node, registry, issues, readOnly, sheet, graph, pinned, run, onChange, onName, onClose, onPin, onRunNode }: { copy: WorkflowBuilderLabels; node: WorkflowNode; registry: readonly NodeTypeDefinition[]; issues: WorkflowIssue[]; readOnly: boolean; sheet: boolean; graph: WorkflowGraph; pinned: Record<string, unknown>; run?: WorkflowRun; onChange: (config: Record<string, unknown>) => void; onName: (name: string) => void; onClose: () => void; onPin: (data: unknown | null) => void; onRunNode: (mode: "single" | "from") => void }) {
  const definition = typeByName(registry, node.type)
  const pinnedOn = Object.prototype.hasOwnProperty.call(pinned, node.id)
  const body = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h3 className="text-sm font-medium">{copy.properties}</h3>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>{copy.close}</Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <FieldGroup className="px-3 pb-3">
          <Field>
            <FieldLabel htmlFor={`${node.id}-name`}>{copy.displayName}</FieldLabel>
            <Input id={`${node.id}-name`} value={node.displayName ?? ""} disabled={readOnly} onChange={(event) => onName(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-1">
            <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={() => onRunNode("single")}>{copy.runNode}</Button>
            <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={() => onRunNode("from")}>{copy.runFrom}</Button>
            <Button type="button" size="sm" variant={pinnedOn ? "secondary" : "outline"} disabled={readOnly} onClick={() => onPin(pinnedOn ? null : (run?.nodes[node.id]?.output ?? { pinned: true }))}>{pinnedOn ? copy.unpin : copy.pin}</Button>
            {pinnedOn ? <Badge variant="outline">{copy.pinned}</Badge> : null}
          </div>
          {run?.nodes[node.id] ? (
            <div data-slot="workflow-inspector" className="rounded-lg bg-muted p-2 text-xs">
              <p className="font-medium">{copy.inspector}</p>
              <p>{copy.input}</p>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(run.nodes[node.id]?.input ?? null, null, 2)}</pre>
              <p>{copy.output}</p>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(run.nodes[node.id]?.output ?? null, null, 2)}</pre>
            </div>
          ) : null}
          {definition?.fields.map((field) => {
            const message = issues.find((issue) => issue.nodeId === node.id && issue.field === field.key)?.message
            return <SchemaField key={field.key} field={field} node={node} copy={copy} readOnly={readOnly} graph={graph} registry={registry} pinned={pinned} {...(message ? { message } : {})} onChange={(value) => onChange({ [field.key]: value })} />
          })}
        </FieldGroup>
      </ScrollArea>
    </div>
  )
  if (sheet) {
    return <aside role="dialog" aria-modal="true" aria-label={copy.properties} data-slot="workflow-properties" className="absolute inset-x-0 bottom-0 z-30 flex max-h-[70%] flex-col rounded-t-xl border border-border bg-popover shadow-lg">{body}</aside>
  }
  return <aside data-slot="workflow-properties" aria-label={copy.properties} className="flex w-72 shrink-0 flex-col border-s border-border bg-card">{body}</aside>
}

function SchemaField({ field, node, copy, readOnly, message, graph, registry, pinned, onChange }: { field: ConfigField; node: WorkflowNode; copy: WorkflowBuilderLabels; readOnly: boolean; message?: string; graph: WorkflowGraph; registry: readonly NodeTypeDefinition[]; pinned: Record<string, unknown>; onChange: (value: unknown) => void }) {
  const value = node.config[field.key]
  const id = `${node.id}-${field.key}`
  const invalid = Boolean(message)
  if (field.kind === "select") {
    return (
      <Field data-invalid={invalid || undefined}>
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        <Select value={typeof value === "string" ? value : ""} disabled={readOnly} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full"><SelectValue placeholder={copy.choose} /></SelectTrigger>
          <SelectContent><SelectGroup>{(field.options ?? []).map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        {message ? <FieldError>{message}</FieldError> : null}
      </Field>
    )
  }
  if (field.kind === "radio") {
    return (
      <FieldSet>
        <FieldLegend variant="label">{field.label}</FieldLegend>
        {(field.options ?? []).map((option) => (
          <Field key={option.value} orientation="horizontal">
            <input type="radio" name={id} className="size-4 accent-primary" checked={value === option.value} disabled={readOnly} onChange={() => onChange(option.value)} />
            <FieldLabel>{option.label}</FieldLabel>
          </Field>
        ))}
      </FieldSet>
    )
  }
  if (field.kind === "pills") {
    const selected = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
    return (
      <Field>
        <FieldLabel>{field.label}</FieldLabel>
        <div className="flex flex-wrap gap-1">
          {(field.options ?? []).map((option) => {
            const on = selected.includes(option.value)
            return <Button key={option.value} type="button" size="sm" variant={on ? "secondary" : "outline"} aria-pressed={on} disabled={readOnly} onClick={() => onChange(on ? selected.filter((item) => item !== option.value) : [...selected, option.value])}>{option.label}</Button>
          })}
        </div>
      </Field>
    )
  }
  if (field.kind === "switch") {
    return (
      <Field orientation="horizontal">
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        <Switch id={id} checked={value === true} disabled={readOnly} onCheckedChange={(checked) => onChange(checked)} />
      </Field>
    )
  }
  if (field.kind === "json") {
    const text = typeof value === "string" ? value : ""
    return (
      <Field data-invalid={invalid || undefined}>
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        <Textarea id={id} value={text} disabled={readOnly} onChange={(event) => onChange(event.target.value)} className="font-mono text-xs" />
        <p className="font-mono text-xs">{highlightJson(text).map((token, index) => <span key={`${token.kind}-${index}`} className={token.kind === "invalid" ? "text-destructive" : "text-muted-foreground"}>{token.text}</span>)}</p>
        {message ? <FieldError>{message}</FieldError> : null}
      </Field>
    )
  }
  const text = typeof value === "string" ? value : ""
  const suggestions = field.expression ? expressionSuggestions(text, node.id, graph, registry, pinned) : []
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <Input id={id} value={text} disabled={readOnly} aria-invalid={invalid || undefined} onChange={(event) => onChange(event.target.value)} />
      {suggestions.length ? (
        <ul role="listbox" aria-label={copy.suggestions} data-slot="workflow-suggestions" className="flex flex-col rounded-lg border border-border bg-popover">
          {suggestions.map((item) => (
            <li key={item.label}>
              <button type="button" role="option" aria-selected={false} className="w-full px-2 py-1 text-start text-sm" onClick={() => onChange(`${text}${item.insert}`)}>
                <span className="font-medium">{item.label}</span>
                <span className="ms-2 text-xs text-muted-foreground">{item.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {message ? <FieldError>{message}</FieldError> : null}
    </Field>
  )
}

function expressionSuggestions(text: string, nodeId: string, graph: WorkflowGraph, registry: readonly NodeTypeDefinition[], pinned: Record<string, unknown>) {
  const nodes: Record<string, { json?: unknown }> = {}
  const extra: Record<string, string[]> = {}
  for (const entry of graph.nodes) {
    if (entry.id === nodeId) continue
    const schema = typeByName(registry, entry.type)?.outputSchema
    const sample = Object.prototype.hasOwnProperty.call(pinned, entry.id) ? pinned[entry.id] : schema && typeof schema === "object" && schema.properties && typeof schema.properties === "object" ? Object.fromEntries(schemaKeys(schema).map((key) => [key, ""])) : schema
    if (sample === undefined) continue
    nodes[entry.id] = { json: sample }
    extra[entry.id] = schemaKeys(sample)
  }
  return expressionCompletions(text, text.length, { nodes }, extra)
}

function RunPanel({ copy, lang, graph, registry, run, issues, payloadText, readOnly, running, onPayload, onStart, onClose }: { copy: WorkflowBuilderLabels; lang: WorkflowLocale; graph: WorkflowGraph; registry: readonly NodeTypeDefinition[]; run: WorkflowRun | null; issues: WorkflowIssue[]; payloadText: string; readOnly: boolean; running: boolean; onPayload: (value: string) => void; onStart: () => void; onClose: () => void }) {
  const triggers = graph.nodes.filter((node) => typeByName(registry, node.type)?.startsRun)
  const records = run ? Object.entries(run.nodes) : []
  const rows = run && run.events.length > 0 ? run.events : []
  return (
    <div className="flex max-h-56 flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{copy.runPanel}</h3>
        <div className="flex gap-1">
          <Button type="button" size="sm" disabled={readOnly || running} onClick={onStart}><Play data-icon="inline-start" />{copy.start}</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>{copy.hideRuns}</Button>
        </div>
      </div>
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="payload">{copy.payload}</TabsTrigger>
          <TabsTrigger value="triggers">{copy.triggers}</TabsTrigger>
          <TabsTrigger value="error">{copy.errors}</TabsTrigger>
          <TabsTrigger value="timeline">{copy.timeline}</TabsTrigger>
          <TabsTrigger value="runs">{copy.runs}</TabsTrigger>
        </TabsList>
        <TabsContent value="payload"><Textarea value={payloadText} aria-label={copy.payload} onChange={(event) => onPayload(event.target.value)} className="font-mono text-xs" /></TabsContent>
        <TabsContent value="triggers">{triggers.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noTriggers}</p> : <ul className="text-sm">{triggers.map((node) => <li key={node.id}>{nodeTitle(node, registry)}</li>)}</ul>}</TabsContent>
        <TabsContent value="error">{issues.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noIssues}</p> : <ul className="text-sm text-destructive">{issues.map((issue) => <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>)}</ul>}</TabsContent>
        <TabsContent value="timeline">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noRuns}</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>{copy.node}</TableHead><TableHead>{copy.status}</TableHead><TableHead>{copy.tokensIn}</TableHead><TableHead>{copy.tokensOut}</TableHead><TableHead>{copy.cacheTokens}</TableHead><TableHead>{copy.cost}</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((event, index) => (
                  <TableRow key={`${event.at}-${event.nodeId}-${index}`}>
                    <TableCell>{event.nodeId}</TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell className="tabular-nums">{event.tokens?.input ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{event.tokens?.output ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{event.tokens?.cache ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{typeof event.cost === "number" ? formatCost(event.cost, lang) : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        <TabsContent value="runs">
          {records.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noRuns}</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>{copy.node}</TableHead><TableHead>{copy.status}</TableHead><TableHead>{copy.duration}</TableHead><TableHead>{copy.tokensIn}</TableHead><TableHead>{copy.tokensOut}</TableHead><TableHead>{copy.cacheTokens}</TableHead><TableHead>{copy.cost}</TableHead></TableRow></TableHeader>
              <TableBody>
                {records.map(([id, record]) => (
                  <TableRow key={id}>
                    <TableCell>{graph.nodes.find((entry) => entry.id === id) ? nodeTitle(graph.nodes.find((entry) => entry.id === id) as WorkflowNode, registry) : id}</TableCell>
                    <TableCell>{copy.statusWord[record.status]}</TableCell>
                    <TableCell className="tabular-nums">{formatDuration(record.durationMs, lang)}</TableCell>
                    <TableCell className="tabular-nums">{record.usage?.inputTokens ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{record.usage?.outputTokens ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{record.usage?.cacheTokens ?? ""}</TableCell>
                    <TableCell className="tabular-nums">{formatCost(record.usage?.costUsd ?? record.cost, lang)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
