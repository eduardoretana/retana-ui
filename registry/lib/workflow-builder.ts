/**
 * Clean-room workflow graph.
 * The host owns the graph. applyWorkflowChange is the pure merge a host
 * calls after onGraphChangeRequest. This module never reads a database
 * and does not price tokens. Cost and token counts are copied from the executor.
 *
 * Canvas engine: own SVG canvas. @xyflow/react was evaluated and not used.
 * See docs/learnings/L-KULESZO-workflow-builder.md.
 */

export const WORKFLOW_VERSION = 1 as const
export const PORT_DIRECTIONS = ["in", "out"] as const
export const PORT_KINDS = ["main", "model", "tools", "memory", "error"] as const
export const PORT_ROLES = ["primary", "secondary"] as const
export const NODE_RUN_STATES = ["idle", "running", "success", "error", "skipped", "waiting-approval"] as const
export const RUN_STATES = ["running", "success", "error", "cancelled", "waiting-approval"] as const
export const SIDE_EFFECTS = ["none", "read", "write"] as const
export const NODE_BEHAVIORS = ["standard", "guard", "approval"] as const
export const WORKFLOW_STEP_EVENTS = ["step.started", "step.completed", "step.failed"] as const

export type PortDirection = (typeof PORT_DIRECTIONS)[number]
export type PortKind = (typeof PORT_KINDS)[number]
export type PortRole = (typeof PORT_ROLES)[number]
export type NodeRunState = (typeof NODE_RUN_STATES)[number]
export type RunState = (typeof RUN_STATES)[number]
export type SideEffect = (typeof SIDE_EFFECTS)[number]
export type NodeBehavior = (typeof NODE_BEHAVIORS)[number]
export type WorkflowLocale = "es" | "en"
export type WorkflowStepEventType = (typeof WORKFLOW_STEP_EVENTS)[number]

export type PortTemplate = {
  id: string
  direction: PortDirection
  kind: PortKind
  role: PortRole
  label: string
}

export type FieldOption = { value: string; label: string }

export type ConfigField = {
  kind: "select" | "radio" | "pills" | "switch" | "text" | "json"
  key: string
  label: string
  required?: boolean
  description?: string
  options?: readonly FieldOption[]
  expression?: boolean
}

export type NodeTypeDefinition = {
  type: string
  category: string
  title: string
  description: string
  ports: readonly PortTemplate[]
  fields: readonly ConfigField[]
  subtitleKey?: string
  subtitleBrackets?: boolean
  startsRun?: boolean
  sideEffect?: SideEffect
  behavior?: NodeBehavior
  outputSchema?: Record<string, unknown>
}

export type RetryPolicy = {
  maxAttempts: number
  backoff: "fixed" | "exponential"
  initialMs: number
  maxMs?: number
}

export type WorkflowNode = {
  id: string
  type: string
  position: { x: number; y: number }
  config: Record<string, unknown>
  displayName?: string
  retry?: RetryPolicy
  onError?: "stop" | "continue" | "errorBranch"
}

export type WorkflowEdge = {
  id: string
  source: string
  sourcePort: string
  target: string
  targetPort: string
}

export type WorkflowGraph = { nodes: WorkflowNode[]; edges: WorkflowEdge[] }
export type WorkflowSelection = { nodeIds: string[]; edgeIds: string[] }

export type WorkflowIssueCode =
  | "missing-config"
  | "cycle"
  | "incompatible-ports"
  | "dangling-edge"
  | "unknown-type"
  | "duplicate-id"
  | "unknown-port"
  | "occupied-port"
  | "unguarded-write"
  | "unknown-credential"
  | "foreign-credential"
  | "inline-secret"
  | "bad-expression"

export type WorkflowIssue = {
  code: WorkflowIssueCode
  message: string
  nodeId?: string
  edgeId?: string
  field?: string
}

export type WorkflowChangeRequest =
  | { type: "add-node"; node: WorkflowNode }
  | { type: "add-graph"; nodes: WorkflowNode[]; edges: WorkflowEdge[] }
  | { type: "move-nodes"; moves: { id: string; x: number; y: number }[] }
  | { type: "remove"; nodeIds: string[]; edgeIds: string[] }
  | { type: "connect"; edge: WorkflowEdge }
  | { type: "update-node"; id: string; displayName?: string; config?: Record<string, unknown> }
  | { type: "replace"; graph: WorkflowGraph }

export type WorkflowDocument = { version: typeof WORKFLOW_VERSION; graph: WorkflowGraph }
export type ImportResult = { ok: true; graph: WorkflowGraph; issues: WorkflowIssue[] } | { ok: false; errors: string[] }

/** Figures the executor already measured. This module does not price them. */
export type NodeUsage = {
  model?: string
  inputTokens: number
  outputTokens: number
  cacheTokens?: number
  costUsd: number
}

export type ExecutorContext = {
  node: WorkflowNode
  type: NodeTypeDefinition | undefined
  inputs: Record<string, unknown>
  signal: AbortSignal
}

export type ExecutorResult = {
  outputs?: Record<string, unknown>
  cost?: number
  error?: string
  usage?: NodeUsage
}

export type NodeExecutor = (ctx: ExecutorContext) => Promise<ExecutorResult>

export type RunAttempt = { attempt: number; at: number; error?: string }

export type RunNodeRecord = {
  status: NodeRunState
  durationMs: number
  cost: number
  error?: string
  startedAt?: number
  finishedAt?: number
  input?: unknown
  output?: unknown
  attempts?: RunAttempt[]
  usage?: NodeUsage
  pinned?: boolean
}

export type TimelineEntry = { at: number; nodeId: string; status: NodeRunState; message: string }

export type WorkflowStepTokens = { input: number; output: number; cache?: number }

/** One row per step for a future cost-waterfall reducer. No price math here. */
export type WorkflowStepEvent = {
  type: WorkflowStepEventType
  runId: string
  nodeId: string
  attempt: number
  at: number
  tokens?: WorkflowStepTokens
  cost?: number
}

export type WorkflowRun = {
  id: string
  status: RunState
  startedAt: number
  finishedAt?: number
  nodes: Record<string, RunNodeRecord>
  timeline: TimelineEntry[]
  events: WorkflowStepEvent[]
  payload: unknown
}

export type WorkflowClock = { now: () => number; wait: (ms: number, signal: AbortSignal) => Promise<void> }
export type WorkflowHistory = { past: WorkflowGraph[]; future: WorkflowGraph[] }
export type ApprovalRequest = { nodeId: string; runId: string; input: unknown }
export type ApprovalDecision = "approve" | "reject"

export const WORKFLOW_NODE_WIDTH = 220
export const LONG_PRESS_MS = 360
export const TOUCH_SLOP_PX = 8
export const MOUSE_SLOP_PX = 4

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  tools: { es: "Herramientas", en: "Tools" },
  logic: { es: "Lógica", en: "Logic" },
  action: { es: "Acción", en: "Action" },
}

export function emptyGraph(): WorkflowGraph {
  return { nodes: [], edges: [] }
}

export function emptySelection(): WorkflowSelection {
  return { nodeIds: [], edgeIds: [] }
}

export function categoryLabel(category: string, locale: WorkflowLocale = "es") {
  return CATEGORY_LABELS[category]?.[locale] ?? category
}

export function typeByName(registry: readonly NodeTypeDefinition[], type: string) {
  return registry.find((entry) => entry.type === type)
}

export function nodePorts(node: WorkflowNode, registry: readonly NodeTypeDefinition[]) {
  return typeByName(registry, node.type)?.ports ?? []
}

export function nodeSize(ports: readonly PortTemplate[]) {
  const secondary = ports.filter((port) => port.role === "secondary").length
  const primaryOut = ports.filter((port) => port.role === "primary" && port.direction === "out").length
  return { width: WORKFLOW_NODE_WIDTH, height: 76 + Math.max(secondary, Math.max(0, primaryOut - 1)) * 26 }
}

export function nodeTitle(node: WorkflowNode, registry: readonly NodeTypeDefinition[]) {
  const named = node.displayName?.trim()
  if (named) return named
  return typeByName(registry, node.type)?.title ?? node.type
}

export function nodeSubtitle(node: WorkflowNode, registry: readonly NodeTypeDefinition[]) {
  const definition = typeByName(registry, node.type)
  if (!definition?.subtitleKey) return ""
  const value = node.config[definition.subtitleKey]
  if (typeof value !== "string" || !value.trim()) return ""
  return definition.subtitleBrackets ? `[${value.trim()}]` : value.trim()
}

export function portAnchor(node: WorkflowNode, ports: readonly PortTemplate[], portId: string) {
  const port = ports.find((entry) => entry.id === portId)
  if (!port) return null
  const siblings = ports.filter((entry) => entry.direction === port.direction && entry.role === port.role)
  const index = Math.max(0, siblings.findIndex((entry) => entry.id === portId))
  const size = nodeSize(ports)
  return {
    x: port.direction === "out" ? node.position.x + size.width : node.position.x,
    y: node.position.y + (port.role === "primary" ? 36 : 68) + index * 26,
  }
}

function roundTenth(value: number) {
  return Math.round(value * 10) / 10
}

export function connectorPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = Math.max(48, Math.abs(to.x - from.x) * 0.45)
  const forward = to.x >= from.x
  const c1 = from.x + (forward ? dx : -dx)
  const c2 = to.x + (forward ? -dx : dx)
  return `M ${roundTenth(from.x)} ${roundTenth(from.y)} C ${roundTenth(c1)} ${roundTenth(from.y)}, ${roundTenth(c2)} ${roundTenth(to.y)}, ${roundTenth(to.x)} ${roundTenth(to.y)}`
}

export function sampleConnector(from: { x: number; y: number }, to: { x: number; y: number }, steps = 16) {
  const dx = Math.max(48, Math.abs(to.x - from.x) * 0.45)
  const forward = to.x >= from.x
  const c1x = from.x + (forward ? dx : -dx)
  const c2x = to.x + (forward ? -dx : dx)
  const points: { x: number; y: number }[] = []
  const count = Math.max(2, steps)
  for (let index = 0; index <= count; index += 1) {
    const t = index / count
    const u = 1 - t
    const x = u * u * u * from.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * to.x
    const y = u * u * u * from.y + 3 * u * u * t * from.y + 3 * u * t * t * to.y + t * t * t * to.y
    points.push({ x: roundTenth(x), y: roundTenth(y) })
  }
  return points
}

export function graphBounds(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[]) {
  if (graph.nodes.length === 0) return { x: 0, y: 0, width: WORKFLOW_NODE_WIDTH, height: 120 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of graph.nodes) {
    const size = nodeSize(nodePorts(node, registry))
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + size.width)
    maxY = Math.max(maxY, node.position.y + size.height)
  }
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}

function issueText(locale: WorkflowLocale, es: string, en: string) {
  return locale === "en" ? en : es
}

function missingField(field: ConfigField, value: unknown) {
  if (!field.required) return false
  if (field.kind === "switch") return typeof value !== "boolean"
  if (field.kind === "pills") return !Array.isArray(value) || value.length === 0
  if (field.kind === "json") {
    if (typeof value !== "string" || !value.trim()) return true
    try {
      JSON.parse(value)
      return false
    } catch {
      return true
    }
  }
  return typeof value !== "string" || value.trim() === ""
}

export function validateGraph(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[] = [], locale: WorkflowLocale = "es"): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  const nodes = new Map<string, WorkflowNode>()
  for (const node of graph.nodes) {
    if (nodes.has(node.id)) {
      issues.push({ code: "duplicate-id", nodeId: node.id, message: issueText(locale, `El id de nodo "${node.id}" está repetido.`, `Node id "${node.id}" is duplicated.`) })
      continue
    }
    nodes.set(node.id, node)
    const definition = typeByName(registry, node.type)
    if (registry.length > 0 && !definition) {
      issues.push({ code: "unknown-type", nodeId: node.id, message: issueText(locale, `El nodo "${node.id}" usa un tipo desconocido (${node.type}).`, `Node "${node.id}" uses an unknown type (${node.type}).`) })
      continue
    }
    for (const field of definition?.fields ?? []) {
      if (!missingField(field, node.config[field.key])) continue
      issues.push({ code: "missing-config", nodeId: node.id, field: field.key, message: issueText(locale, `Falta ${field.label}. El nodo no está configurado.`, `${field.label} is missing. The node is not configured.`) })
    }
  }
  const edgeIds = new Set<string>()
  const occupied = new Set<string>()
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push({ code: "duplicate-id", edgeId: edge.id, message: issueText(locale, `El id de enlace "${edge.id}" está repetido.`, `Edge id "${edge.id}" is duplicated.`) })
    }
    edgeIds.add(edge.id)
    const source = nodes.get(edge.source)
    const target = nodes.get(edge.target)
    if (!source || !target) {
      const missing = !source ? edge.source : edge.target
      issues.push({ code: "dangling-edge", edgeId: edge.id, message: issueText(locale, `El enlace "${edge.id}" apunta a un nodo que no existe (${missing}).`, `Edge "${edge.id}" points at a missing node (${missing}).`) })
      continue
    }
    const sourcePort = nodePorts(source, registry).find((port) => port.id === edge.sourcePort)
    const targetPort = nodePorts(target, registry).find((port) => port.id === edge.targetPort)
    if (registry.length > 0 && (!sourcePort || !targetPort)) {
      const missing = !sourcePort ? edge.sourcePort : edge.targetPort
      issues.push({ code: "unknown-port", edgeId: edge.id, nodeId: !sourcePort ? source.id : target.id, message: issueText(locale, `El enlace "${edge.id}" usa un puerto que no existe (${missing}).`, `Edge "${edge.id}" uses a missing port (${missing}).`) })
      continue
    }
    if (source.id === target.id) {
      issues.push({ code: "incompatible-ports", edgeId: edge.id, nodeId: source.id, message: issueText(locale, "Un nodo no se conecta consigo mismo.", "A node cannot connect to itself.") })
      continue
    }
    if (sourcePort && targetPort && (sourcePort.direction !== "out" || targetPort.direction !== "in" || sourcePort.kind !== targetPort.kind)) {
      issues.push({ code: "incompatible-ports", edgeId: edge.id, message: issueText(locale, `No se puede conectar ${sourcePort.label} (${sourcePort.kind}) con ${targetPort.label} (${targetPort.kind}).`, `Cannot connect ${sourcePort.label} (${sourcePort.kind}) to ${targetPort.label} (${targetPort.kind}).`) })
      continue
    }
    const slot = `${target.id}:${edge.targetPort}`
    if (occupied.has(slot)) {
      issues.push({ code: "occupied-port", edgeId: edge.id, nodeId: target.id, message: issueText(locale, `El puerto de entrada ya tiene un enlace (${edge.targetPort}).`, `The input port already has a connection (${edge.targetPort}).`) })
      continue
    }
    occupied.add(slot)
  }
  const cycle = findCycle(graph)
  if (cycle) {
    const chain = [...cycle, cycle[0]].filter(Boolean).join(" → ")
    issues.push({ code: "cycle", message: issueText(locale, `El grafo tiene un ciclo: ${chain}.`, `The graph has a cycle: ${chain}.`) })
  }
  return issues
}

function findCycle(graph: WorkflowGraph) {
  const adj = new Map<string, string[]>()
  for (const node of graph.nodes) adj.set(node.id, [])
  for (const edge of graph.edges) {
    if (!adj.has(edge.source) || !adj.has(edge.target)) continue
    adj.get(edge.source)?.push(edge.target)
  }
  const color = new Map<string, 0 | 1 | 2>()
  const stack: string[] = []
  const visit = (id: string): string[] | null => {
    color.set(id, 1)
    stack.push(id)
    for (const next of adj.get(id) ?? []) {
      const state = color.get(next) ?? 0
      if (state === 1) {
        const start = stack.indexOf(next)
        return start >= 0 ? stack.slice(start) : [next]
      }
      if (state === 0) {
        const found = visit(next)
        if (found) return found
      }
    }
    stack.pop()
    color.set(id, 2)
    return null
  }
  for (const node of graph.nodes) {
    if ((color.get(node.id) ?? 0) === 0) {
      const found = visit(node.id)
      if (found) return found
    }
  }
  return null
}

const NODE_ERROR_CODES = new Set<WorkflowIssue["code"]>(["missing-config", "unknown-type", "unguarded-write", "unknown-credential", "foreign-credential", "inline-secret", "bad-expression"])

export function nodeIssues(issues: readonly WorkflowIssue[], nodeId: string) {
  return issues.filter((issue) => issue.nodeId === nodeId && NODE_ERROR_CODES.has(issue.code))
}

export function cloneGraph(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node, position: { ...node.position }, config: { ...node.config }, ...(node.retry ? { retry: { ...node.retry } } : {}) })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  }
}

export function applyWorkflowChange(graph: WorkflowGraph, request: WorkflowChangeRequest): WorkflowGraph {
  if (request.type === "replace") return cloneGraph(request.graph)
  const next = cloneGraph(graph)
  if (request.type === "add-node") {
    if (!next.nodes.some((node) => node.id === request.node.id)) next.nodes.push({ ...request.node, position: { ...request.node.position }, config: { ...request.node.config } })
    return next
  }
  if (request.type === "add-graph") {
    const ids = new Set(next.nodes.map((node) => node.id))
    for (const node of request.nodes) {
      if (ids.has(node.id)) continue
      ids.add(node.id)
      next.nodes.push({ ...node, position: { ...node.position }, config: { ...node.config } })
    }
    const edgeIds = new Set(next.edges.map((edge) => edge.id))
    for (const edge of request.edges) {
      if (edgeIds.has(edge.id)) continue
      edgeIds.add(edge.id)
      next.edges.push({ ...edge })
    }
    return next
  }
  if (request.type === "move-nodes") {
    const moves = new Map(request.moves.map((move) => [move.id, move]))
    next.nodes = next.nodes.map((node) => {
      const move = moves.get(node.id)
      return move ? { ...node, position: { x: move.x, y: move.y } } : node
    })
    return next
  }
  if (request.type === "remove") {
    const dropNodes = new Set(request.nodeIds)
    const dropEdges = new Set(request.edgeIds)
    next.nodes = next.nodes.filter((node) => !dropNodes.has(node.id))
    next.edges = next.edges.filter((edge) => !dropEdges.has(edge.id) && !dropNodes.has(edge.source) && !dropNodes.has(edge.target))
    return next
  }
  if (request.type === "connect") {
    const same = next.edges.some((edge) => edge.source === request.edge.source && edge.sourcePort === request.edge.sourcePort && edge.target === request.edge.target && edge.targetPort === request.edge.targetPort)
    if (!same) next.edges.push({ ...request.edge })
    return next
  }
  next.nodes = next.nodes.map((node) => {
    if (node.id !== request.id) return node
    const updated: WorkflowNode = { ...node, config: request.config ? { ...node.config, ...request.config } : node.config }
    if (request.displayName !== undefined) updated.displayName = request.displayName
    return updated
  })
  return next
}

export function pushHistory(history: WorkflowHistory, current: WorkflowGraph): WorkflowHistory {
  return { past: [...history.past, cloneGraph(current)].slice(-80), future: [] }
}

export function undoHistory(history: WorkflowHistory, current: WorkflowGraph) {
  const previous = history.past[history.past.length - 1]
  if (!previous) return null
  return { graph: cloneGraph(previous), history: { past: history.past.slice(0, -1), future: [cloneGraph(current), ...history.future].slice(0, 80) } }
}

export function redoHistory(history: WorkflowHistory, current: WorkflowGraph) {
  const next = history.future[0]
  if (!next) return null
  return { graph: cloneGraph(next), history: { past: [...history.past, cloneGraph(current)].slice(-80), future: history.future.slice(1) } }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function serializeWorkflow(graph: WorkflowGraph): WorkflowDocument {
  return { version: WORKFLOW_VERSION, graph: cloneGraph(graph) }
}

export function serializeWorkflowJson(graph: WorkflowGraph) {
  return JSON.stringify(serializeWorkflow(graph), null, 2)
}

export function importWorkflow(input: unknown, options?: { registry?: readonly NodeTypeDefinition[]; locale?: WorkflowLocale }): ImportResult {
  const locale = options?.locale ?? "es"
  const registry = options?.registry ?? []
  let parsed: unknown = input
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input)
    } catch {
      return { ok: false, errors: [issueText(locale, "El JSON está corrupto y no se pudo leer.", "The JSON is corrupt and could not be read.")] }
    }
  }
  if (!isRecord(parsed)) return { ok: false, errors: [issueText(locale, "El documento no es un objeto.", "The document is not an object.")] }
  if (parsed.version !== WORKFLOW_VERSION) {
    return { ok: false, errors: [issueText(locale, `La versión ${String(parsed.version)} no es compatible. Esta pieza lee la versión ${WORKFLOW_VERSION}.`, `Version ${String(parsed.version)} is not supported. This piece reads version ${WORKFLOW_VERSION}.`)] }
  }
  if (!isRecord(parsed.graph) || !Array.isArray(parsed.graph.nodes) || !Array.isArray(parsed.graph.edges)) {
    return { ok: false, errors: [issueText(locale, "Faltan los arreglos de nodos o de enlaces.", "Node or edge arrays are missing.")] }
  }
  const errors: string[] = []
  const nodes: WorkflowNode[] = []
  for (const entry of parsed.graph.nodes) {
    if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.type !== "string" || !isRecord(entry.position) || typeof entry.position.x !== "number" || typeof entry.position.y !== "number" || !isRecord(entry.config)) {
      errors.push(issueText(locale, "Un nodo del documento no tiene id, tipo, posición o configuración.", "A node is missing an id, type, position, or config."))
      continue
    }
    const node: WorkflowNode = { id: entry.id, type: entry.type, position: { x: entry.position.x, y: entry.position.y }, config: { ...entry.config } }
    if (typeof entry.displayName === "string") node.displayName = entry.displayName
    nodes.push(node)
  }
  const edges: WorkflowEdge[] = []
  for (const entry of parsed.graph.edges) {
    if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.source !== "string" || typeof entry.sourcePort !== "string" || typeof entry.target !== "string" || typeof entry.targetPort !== "string") {
      errors.push(issueText(locale, "Un enlace no tiene sus campos.", "An edge is missing a field."))
      continue
    }
    edges.push({ id: entry.id, source: entry.source, sourcePort: entry.sourcePort, target: entry.target, targetPort: entry.targetPort })
  }
  if (errors.length) return { ok: false, errors }
  const graph = { nodes, edges }
  const issues = validateGraph(graph, registry, locale)
  const blocking = issues.filter((issue) => issue.code !== "missing-config")
  if (blocking.length) return { ok: false, errors: blocking.map((issue) => issue.message) }
  return { ok: true, graph, issues }
}

export function previewConnection(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[], edge: WorkflowEdge, locale: WorkflowLocale = "es") {
  return validateGraph(applyWorkflowChange(graph, { type: "connect", edge }), registry, locale).find((issue) => issue.edgeId === edge.id) ?? null
}

export function executionOrder(graph: WorkflowGraph) {
  const indegree = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  for (const node of graph.nodes) {
    indegree.set(node.id, 0)
    outgoing.set(node.id, [])
  }
  for (const edge of graph.edges) {
    if (!indegree.has(edge.source) || !indegree.has(edge.target)) continue
    outgoing.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }
  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift()
    if (!id) break
    order.push(id)
    for (const next of outgoing.get(id) ?? []) {
      const degree = (indegree.get(next) ?? 1) - 1
      indegree.set(next, degree)
      if (degree === 0) queue.push(next)
    }
  }
  return order.length === graph.nodes.length ? order : null
}

function abortError() {
  const error = new Error("aborted")
  error.name = "AbortError"
  return error
}

export function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError())
      return
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    signal.addEventListener("abort", onAbort, { once: true })
  })
}

export const systemClock: WorkflowClock = { now: () => Date.now(), wait: delay }

export function retryDelay(failedAttempt: number, policy: Pick<RetryPolicy, "backoff" | "initialMs" | "maxMs">) {
  const initial = Math.max(0, policy.initialMs)
  const cap = policy.maxMs ?? 30_000
  const raw = policy.backoff === "fixed" ? initial : initial * 2 ** Math.max(0, failedAttempt - 1)
  return Math.min(cap, raw)
}

export function reachableFrom(graph: WorkflowGraph, startId: string) {
  const seen = new Set<string>([startId])
  const stack = [startId]
  while (stack.length) {
    const current = stack.pop()
    if (!current) break
    for (const edge of graph.edges) {
      if (edge.source !== current || seen.has(edge.target)) continue
      seen.add(edge.target)
      stack.push(edge.target)
    }
  }
  return seen
}

export function replayPins(run: WorkflowRun, graph: WorkflowGraph, fromNodeId?: string) {
  const order = executionOrder(graph) ?? graph.nodes.map((node) => node.id)
  const pins: Record<string, unknown> = {}
  for (const id of order) {
    if (fromNodeId && id === fromNodeId) break
    const record = run.nodes[id]
    if (record?.status === "success" && record.output !== undefined) pins[id] = record.output
  }
  return pins
}

function reportedSample(type: string): { cost: number; usage: NodeUsage } {
  const cost = type === "ai-agent" ? 0.004 : type === "database" ? 0.001 : 0.0005
  if (type === "ai-agent") return { cost, usage: { model: "synthetic-small", inputTokens: 12, outputTokens: 4, cacheTokens: 0, costUsd: cost } }
  return { cost, usage: { inputTokens: 0, outputTokens: 0, costUsd: cost } }
}

export function createWorkflowSimulator(options?: { stepMs?: number; clock?: WorkflowClock; fail?: Record<string, string>; failTimes?: Record<string, number> }): NodeExecutor {
  const stepMs = options?.stepMs ?? 40
  const clock = options?.clock ?? systemClock
  const seen = new Map<string, number>()
  return async ({ node, signal }) => {
    await clock.wait(stepMs, signal)
    const calls = (seen.get(node.id) ?? 0) + 1
    seen.set(node.id, calls)
    const flaky = options?.failTimes?.[node.id]
    if (flaky != null && calls <= flaky) return { error: `intento ${calls}`, cost: 0 }
    const reason = options?.fail?.[node.id]
    if (reason) return { error: reason, cost: 0 }
    const sample = reportedSample(node.type)
    const outputs: Record<string, unknown> = { nodeId: node.id }
    if (typeof node.config.route === "string") outputs.route = node.config.route
    return { outputs, cost: sample.cost, usage: sample.usage }
  }
}

export async function runWorkflow(options: {
  graph: WorkflowGraph
  registry?: readonly NodeTypeDefinition[]
  executor?: NodeExecutor
  signal?: AbortSignal
  payload?: unknown
  onUpdate?: (run: WorkflowRun) => void
  clock?: WorkflowClock
  id?: string
  locale?: WorkflowLocale
  mode?: "all" | "single" | "from"
  startNodeId?: string
  pinned?: Record<string, unknown>
  onRunEvent?: (event: WorkflowStepEvent) => void
  onApprovalRequest?: (request: ApprovalRequest) => Promise<ApprovalDecision>
}): Promise<WorkflowRun> {
  const locale = options.locale ?? "es"
  const registry = options.registry ?? []
  const clock = options.clock ?? systemClock
  const executor = options.executor ?? createWorkflowSimulator({ clock })
  const signal = options.signal ?? new AbortController().signal
  const issues = validateGraph(options.graph, registry, locale)
  const blocking = issues.filter((issue) => issue.code !== "missing-config")
  const nodes: Record<string, RunNodeRecord> = {}
  for (const node of options.graph.nodes) nodes[node.id] = { status: "idle", durationMs: 0, cost: 0 }
  const run: WorkflowRun = { id: options.id ?? "run-1", status: "running", startedAt: clock.now(), nodes, timeline: [], events: [], payload: options.payload ?? null }
  const publish = () => options.onUpdate?.(structuredClone(run))
  const stepEvent = (type: WorkflowStepEventType, nodeId: string, attempt: number, reported?: { usage?: NodeUsage; cost?: number }) => {
    const event: WorkflowStepEvent = { type, runId: run.id, nodeId, attempt, at: clock.now() }
    const usage = reported?.usage
    if (usage) {
      const tokens: WorkflowStepTokens = { input: usage.inputTokens, output: usage.outputTokens }
      if (typeof usage.cacheTokens === "number") tokens.cache = usage.cacheTokens
      event.tokens = tokens
      event.cost = usage.costUsd
    } else if (typeof reported?.cost === "number") event.cost = reported.cost
    run.events.push(event)
    options.onRunEvent?.(event)
  }
  const note = (nodeId: string, status: NodeRunState, message: string) => {
    const record = run.nodes[nodeId]
    if (record) record.status = status
    run.timeline.push({ at: clock.now(), nodeId, status, message })
  }
  if (blocking.length) {
    run.status = "error"
    run.finishedAt = clock.now()
    run.timeline.push({ at: clock.now(), nodeId: "", status: "error", message: blocking.map((issue) => issue.message).join(" ") })
    publish()
    return run
  }
  const fullOrder = executionOrder(options.graph)
  if (!fullOrder) {
    run.status = "error"
    run.finishedAt = clock.now()
    run.timeline.push({ at: clock.now(), nodeId: "", status: "error", message: issueText(locale, "No se puede ejecutar un grafo con ciclo.", "A graph with a cycle cannot run.") })
    publish()
    return run
  }
  const mode = options.mode ?? "all"
  const focus = options.startNodeId
  const order = mode === "single" && focus ? fullOrder.filter((id) => id === focus) : mode === "from" && focus ? fullOrder.filter((id) => reachableFrom(options.graph, focus).has(id)) : fullOrder
  const activated = new Set<string>()
  const byId = new Map(options.graph.nodes.map((node) => [node.id, node]))
  const pinned = options.pinned ?? {}
  let failed = false
  const activateFrom = (node: WorkflowNode, route: string | null, kinds: ReadonlySet<string>) => {
    for (const edge of options.graph.edges) {
      if (edge.source !== node.id) continue
      const port = nodePorts(node, registry).find((entry) => entry.id === edge.sourcePort)
      const kind = port?.kind ?? "main"
      if (!kinds.has(kind)) continue
      if (route && kind === "main" && edge.sourcePort !== route) continue
      activated.add(edge.id)
    }
  }
  for (const id of order) {
    const node = byId.get(id)
    if (!node) continue
    if (signal.aborted) {
      note(id, "skipped", issueText(locale, "Ejecución cancelada.", "Run cancelled."))
      for (const rest of order.slice(order.indexOf(id) + 1)) note(rest, "skipped", issueText(locale, "Ejecución cancelada.", "Run cancelled."))
      run.status = "cancelled"
      run.finishedAt = clock.now()
      publish()
      return run
    }
    const incoming = options.graph.edges.filter((edge) => edge.target === id)
    const ready = incoming.filter((edge) => {
      if (!activated.has(edge.id) && !Object.prototype.hasOwnProperty.call(pinned, edge.source)) return false
      const sourceStatus = run.nodes[edge.source]?.status
      return sourceStatus === "success" || sourceStatus === "error" || Object.prototype.hasOwnProperty.call(pinned, edge.source)
    })
    if (mode !== "single" && incoming.length > 0 && ready.length === 0) {
      note(id, "skipped", issueText(locale, "Omitido: la entrada no llegó.", "Skipped: the input did not arrive."))
      publish()
      continue
    }
    const configError = issues.find((issue) => issue.nodeId === id && issue.code === "missing-config")
    if (configError) {
      const record = run.nodes[id]
      if (record) {
        record.status = "error"
        record.error = configError.message
        record.finishedAt = clock.now()
      }
      run.timeline.push({ at: clock.now(), nodeId: id, status: "error", message: configError.message })
      failed = true
      publish()
      continue
    }
    const record = run.nodes[id]
    const inputs: Record<string, unknown> = {}
    for (const edge of incoming) {
      if (Object.prototype.hasOwnProperty.call(pinned, edge.source)) inputs[edge.targetPort] = pinned[edge.source]
      else if (ready.some((item) => item.id === edge.id)) inputs[edge.targetPort] = run.nodes[edge.source]?.output
    }
    if (record) record.input = inputs
    if (Object.prototype.hasOwnProperty.call(pinned, id)) {
      if (record) {
        record.status = "success"
        record.output = pinned[id]
        record.pinned = true
        record.finishedAt = clock.now()
      }
      run.timeline.push({ at: clock.now(), nodeId: id, status: "success", message: issueText(locale, "Salida fijada.", "Pinned output.") })
      stepEvent("step.completed", id, 0, { cost: 0 })
      activateFrom(node, null, new Set(["main", "model", "tools", "memory"]))
      publish()
      continue
    }
    const definition = typeByName(registry, node.type)
    if (definition?.behavior === "approval") {
      if (record) record.status = "waiting-approval"
      run.timeline.push({ at: clock.now(), nodeId: id, status: "waiting-approval", message: issueText(locale, "Espera aprobación.", "Waiting for approval.") })
      publish()
      if (!options.onApprovalRequest) {
        run.status = "waiting-approval"
        run.finishedAt = clock.now()
        publish()
        return run
      }
      const decision = await options.onApprovalRequest({ nodeId: id, runId: run.id, input: inputs })
      if (decision !== "approve") {
        if (record) {
          record.status = "error"
          record.error = issueText(locale, "Aprobación rechazada.", "Approval rejected.")
          record.finishedAt = clock.now()
        }
        stepEvent("step.failed", id, 1)
        run.timeline.push({ at: clock.now(), nodeId: id, status: "error", message: issueText(locale, "Aprobación rechazada.", "Approval rejected.") })
        failed = true
        publish()
        continue
      }
    }
    const policy = node.retry
    const maxAttempts = Math.max(1, policy?.maxAttempts ?? 1)
    const started = clock.now()
    let succeeded = false
    let lastError = ""
    let lastUsage: NodeUsage | undefined
    let lastOutputs: Record<string, unknown> | undefined
    let lastCost = 0
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (signal.aborted) throw abortError()
        if (attempt > 1 && policy) {
          const wait = retryDelay(attempt - 1, policy)
          run.timeline.push({ at: clock.now(), nodeId: id, status: "running", message: issueText(locale, `Reintento ${attempt}. Espera ${wait} ms.`, `Retry ${attempt}. Wait ${wait} ms.`) })
          publish()
          await clock.wait(wait, signal)
        }
        stepEvent("step.started", id, attempt)
        run.timeline.push({ at: clock.now(), nodeId: id, status: "running", message: issueText(locale, `Intento ${attempt}.`, `Attempt ${attempt}.`) })
        const result = await executor({ node, type: definition, inputs, signal })
        if (record) record.attempts = [...(record.attempts ?? []), { attempt, at: clock.now(), ...(result.error ? { error: result.error } : {}) }]
        if (result.error) {
          lastError = result.error
          lastUsage = result.usage
          lastCost = result.usage?.costUsd ?? result.cost ?? 0
          if (attempt < maxAttempts) continue
          stepEvent("step.failed", id, attempt, { ...(result.usage ? { usage: result.usage } : {}), cost: lastCost })
          break
        }
        succeeded = true
        lastOutputs = result.outputs ?? {}
        lastCost = result.usage?.costUsd ?? result.cost ?? 0
        lastUsage = result.usage
        break
      }
      const finished = clock.now()
      if (!succeeded) {
        if (record) {
          record.status = "error"
          record.error = lastError
          record.durationMs = Math.max(0, finished - started)
          record.finishedAt = finished
          record.cost = lastCost
          if (lastUsage) record.usage = lastUsage
        }
        run.timeline.push({ at: finished, nodeId: id, status: "error", message: lastError })
        if (node.onError === "errorBranch") activateFrom(node, null, new Set(["error"]))
        else if (node.onError === "continue") activateFrom(node, null, new Set(["main", "model", "tools", "memory"]))
        else failed = true
      } else {
        if (record) {
          record.status = "success"
          record.durationMs = Math.max(0, finished - started)
          record.finishedAt = finished
          record.cost = lastCost
          record.output = lastOutputs ?? {}
          if (lastUsage) record.usage = lastUsage
        }
        stepEvent("step.completed", id, record?.attempts?.length ?? 1, { ...(lastUsage ? { usage: lastUsage } : {}), cost: lastCost })
        run.timeline.push({ at: finished, nodeId: id, status: "success", message: issueText(locale, "Listo.", "Done.") })
        const route = typeof lastOutputs?.route === "string" ? lastOutputs.route : null
        activateFrom(node, route, new Set(["main", "model", "tools", "memory"]))
      }
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError"
      const finished = clock.now()
      if (aborted) {
        if (record) {
          record.status = "skipped"
          record.durationMs = Math.max(0, finished - started)
          record.finishedAt = finished
          record.error = issueText(locale, "Cancelado.", "Cancelled.")
        }
        run.timeline.push({ at: finished, nodeId: id, status: "skipped", message: issueText(locale, "Cancelado.", "Cancelled.") })
        for (const rest of order.slice(order.indexOf(id) + 1)) note(rest, "skipped", issueText(locale, "Ejecución cancelada.", "Run cancelled."))
        run.status = "cancelled"
        run.finishedAt = finished
        publish()
        return run
      }
      const message = error instanceof Error ? error.message : issueText(locale, "Falló el ejecutor.", "The executor failed.")
      if (record) {
        record.status = "error"
        record.error = message
        record.finishedAt = finished
      }
      run.timeline.push({ at: finished, nodeId: id, status: "error", message })
      failed = true
    }
    publish()
  }
  run.status = failed ? "error" : "success"
  run.finishedAt = clock.now()
  publish()
  return run
}

export function formatDuration(ms: number, locale: WorkflowLocale = "es") {
  if (ms < 1000) return `${ms} ms`
  const text = (ms / 1000).toLocaleString(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: 1 })
  return `${text} s`
}

export function formatCost(cost: number, locale: WorkflowLocale = "es") {
  const text = cost.toLocaleString(locale === "en" ? "en-US" : "es-MX", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  return locale === "en" ? `${text} credits` : `${text} créditos`
}

export function fitViewport(bounds: { x: number; y: number; width: number; height: number }, view: { width: number; height: number }) {
  const pad = 48
  const zoom = Math.min(1.4, Math.max(0.35, Math.min((view.width - pad) / bounds.width, (view.height - pad) / bounds.height)))
  const safe = Number.isFinite(zoom) ? zoom : 1
  return { x: (view.width - bounds.width * safe) / 2 - bounds.x * safe, y: (view.height - bounds.height * safe) / 2 - bounds.y * safe, zoom: safe }
}

export type NodeGesture = "open" | "drag" | "pan" | "wait"

export function resolveNodeGesture(input: { pointer: "touch" | "mouse" | "pen"; selected: boolean; held: boolean; dx: number; dy: number; phase: "move" | "up" }): NodeGesture {
  const distance = Math.hypot(input.dx, input.dy)
  if (input.pointer !== "touch") {
    if (input.phase === "up") return distance >= MOUSE_SLOP_PX ? "drag" : "open"
    return distance >= MOUSE_SLOP_PX ? "drag" : "wait"
  }
  if (input.held || input.selected) {
    if (distance >= TOUCH_SLOP_PX) return "drag"
    return input.phase === "up" ? "open" : "wait"
  }
  if (distance >= TOUCH_SLOP_PX) return "pan"
  return input.phase === "up" ? "open" : "wait"
}

export type JsonToken = { kind: "key" | "string" | "number" | "punct" | "bool" | "null" | "invalid"; text: string }

export function highlightJson(source: string): JsonToken[] {
  if (!source) return []
  try {
    JSON.parse(source)
  } catch {
    return [{ kind: "invalid", text: source }]
  }
  const tokens: JsonToken[] = []
  const pattern = /"(?:\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:]|\s+/g
  let cursor = 0
  for (const match of source.matchAll(pattern)) {
    const text = match[0]
    const index = match.index ?? 0
    if (index > cursor) tokens.push({ kind: "invalid", text: source.slice(cursor, index) })
    cursor = index + text.length
    if (/^\s+$/.test(text)) tokens.push({ kind: "punct", text })
    else if (text.startsWith('"')) tokens.push({ kind: /^\s*:/.test(source.slice(cursor)) ? "key" : "string", text })
    else if (text === "true" || text === "false") tokens.push({ kind: "bool", text })
    else if (text === "null") tokens.push({ kind: "null", text })
    else if (/^-?\d/.test(text)) tokens.push({ kind: "number", text })
    else tokens.push({ kind: "punct", text })
  }
  if (cursor < source.length) tokens.push({ kind: "invalid", text: source.slice(cursor) })
  return tokens
}
