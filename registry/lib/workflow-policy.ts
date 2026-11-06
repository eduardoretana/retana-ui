/**
 * Publish guards, credential scope, and draft/published diff.
 * Ideas only. n8n is fair-code. Activepieces MIT was not copied.
 * No vendor names and no secret values belong in this module.
 */

import { expressionErrors, type ExpressionContext } from "@/registry/retana/lib/workflow-expr"
import {
  typeByName,
  validateGraph,
  type NodeTypeDefinition,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowIssue,
  type WorkflowLocale,
  type WorkflowNode,
} from "@/registry/retana/lib/workflow-builder"

export type CredentialRef = { id: string; name: string; type: string; workspace: string }

export type PublishedSnapshot = { graph: WorkflowGraph; version: number; publishedAt: string }

export type WorkflowValue = {
  version: 1
  workspace: string
  draft: WorkflowGraph
  published?: PublishedSnapshot
  versions?: PublishedSnapshot[]
}

export type GraphDiff = {
  addedNodes: string[]
  removedNodes: string[]
  changedNodes: { id: string; fields: string[] }[]
  addedEdges: string[]
  removedEdges: string[]
  changedEdges: string[]
}

const SECRET_KEY = /secret|password|token|api[_-]?key|access[_-]?key/i

function text(locale: WorkflowLocale, es: string, en: string) {
  return locale === "en" ? en : es
}

export function ancestorsOf(graph: WorkflowGraph, nodeId: string) {
  const seen = new Set<string>()
  const stack = [nodeId]
  while (stack.length) {
    const current = stack.pop()
    if (!current) break
    for (const edge of graph.edges) {
      if (edge.target !== current || seen.has(edge.source)) continue
      seen.add(edge.source)
      stack.push(edge.source)
    }
  }
  seen.delete(nodeId)
  return seen
}

export function isValidConnection(source: { direction: string; kind: string }, target: { direction: string; kind: string }) {
  return source.direction === "out" && target.direction === "in" && source.kind === target.kind
}

export function guardIssues(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[], locale: WorkflowLocale = "es"): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  for (const node of graph.nodes) {
    if (typeByName(registry, node.type)?.sideEffect !== "write") continue
    const ancestors = ancestorsOf(graph, node.id)
    let guard = false
    let approval = false
    for (const id of ancestors) {
      const ancestor = graph.nodes.find((entry) => entry.id === id)
      const behavior = ancestor ? typeByName(registry, ancestor.type)?.behavior : undefined
      if (behavior === "guard") guard = true
      if (behavior === "approval") approval = true
    }
    if (!guard || !approval) {
      const missing = [!guard ? (locale === "en" ? "a guard" : "una guarda") : null, !approval ? (locale === "en" ? "a human approval" : "una aprobación humana") : null].filter(Boolean).join(locale === "en" ? " and " : " y ")
      issues.push({
        code: "unguarded-write",
        nodeId: node.id,
        message: text(locale, `El nodo ${node.id} escribe y no tiene ${missing} aguas arriba. No se puede publicar.`, `Node ${node.id} writes and has no ${missing} upstream. It cannot be published.`),
      })
    }
  }
  return issues
}

function credentialIdOf(config: Record<string, unknown>) {
  if (typeof config.credentialId === "string") return config.credentialId
  const ref = config.credentialRef
  if (ref && typeof ref === "object" && typeof (ref as { id?: unknown }).id === "string") return (ref as { id: string }).id
  return null
}

export function credentialIssues(graph: WorkflowGraph, workspace: string, credentials: readonly CredentialRef[], locale: WorkflowLocale = "es"): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  for (const node of graph.nodes) {
    const id = credentialIdOf(node.config)
    if (!id) continue
    const credential = credentials.find((entry) => entry.id === id)
    if (!credential) {
      issues.push({ code: "unknown-credential", nodeId: node.id, field: "credentialId", message: text(locale, `La credencial ${id} no existe en este espacio.`, `Credential ${id} does not exist in this workspace.`) })
      continue
    }
    if (credential.workspace !== workspace) {
      issues.push({
        code: "foreign-credential",
        nodeId: node.id,
        field: "credentialId",
        message: text(locale, `La credencial ${credential.name} pertenece a otra marca (${credential.workspace}), no a ${workspace}.`, `Credential ${credential.name} belongs to another brand (${credential.workspace}), not ${workspace}.`),
      })
    }
  }
  return issues
}

export function secretIssues(graph: WorkflowGraph, locale: WorkflowLocale = "es"): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  const visit = (node: WorkflowNode, value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(node, entry, `${path}[${index}]`))
      return
    }
    if (!value || typeof value !== "object") return
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === "credentialId" || key === "credentialRef" || key === "id" || key === "name" || key === "type" || key === "workspace") {
        visit(node, child, `${path}.${key}`)
        continue
      }
      if (SECRET_KEY.test(key) && typeof child === "string" && child.trim()) {
        issues.push({ code: "inline-secret", nodeId: node.id, field: key, message: text(locale, `El nodo ${node.id} guarda un secreto en ${path}.${key}. Usa solo el id de la credencial.`, `Node ${node.id} stores a secret at ${path}.${key}. Keep only the credential id.`) })
        continue
      }
      visit(node, child, `${path}.${key}`)
    }
  }
  for (const node of graph.nodes) visit(node, node.config, "config")
  return issues
}

function schemaSample(schema: unknown): unknown {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return undefined
  const record = schema as Record<string, unknown>
  const properties = record.properties
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    const sample: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(properties as Record<string, unknown>)) {
      const kind = child && typeof child === "object" ? (child as { type?: unknown }).type : undefined
      sample[key] = kind === "number" ? 0 : kind === "boolean" ? false : ""
    }
    return sample
  }
  return record
}

export function expressionIssues(graph: WorkflowGraph, registry: readonly NodeTypeDefinition[], locale: WorkflowLocale = "es", pinned: Record<string, unknown> = {}): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  for (const node of graph.nodes) {
    const nodes: ExpressionContext["nodes"] = {}
    for (const id of ancestorsOf(graph, node.id)) {
      const ancestor = graph.nodes.find((entry) => entry.id === id)
      const sample = pinned[id] ?? schemaSample(ancestor ? typeByName(registry, ancestor.type)?.outputSchema : undefined)
      if (sample !== undefined) nodes[id] = { json: sample }
    }
    for (const message of expressionErrors(node.config, { nodes, json: pinned[node.id], input: pinned[node.id] })) {
      issues.push({ code: "bad-expression", nodeId: node.id, message: text(locale, `${node.id}: ${message}`, `${node.id}: ${message}`) })
    }
  }
  return issues
}

export function validateWorkflow(options: {
  graph: WorkflowGraph
  registry?: readonly NodeTypeDefinition[]
  locale?: WorkflowLocale
  workspace?: string
  credentials?: readonly CredentialRef[]
  pinned?: Record<string, unknown>
}): WorkflowIssue[] {
  const locale = options.locale ?? "es"
  const registry = options.registry ?? []
  return [
    ...validateGraph(options.graph, registry, locale),
    ...guardIssues(options.graph, registry, locale),
    ...credentialIssues(options.graph, options.workspace ?? "", options.credentials ?? [], locale),
    ...secretIssues(options.graph, locale),
    ...expressionIssues(options.graph, registry, locale, options.pinned ?? {}),
  ]
}

export function publishDecision(issues: readonly WorkflowIssue[]) {
  return { ok: issues.length === 0, reasons: issues.map((entry) => entry.message) }
}

function stable(value: unknown) {
  return JSON.stringify(value)
}

export function diffGraphs(before: WorkflowGraph, after: WorkflowGraph): GraphDiff {
  const previous = new Map(before.nodes.map((node) => [node.id, node]))
  const next = new Map(after.nodes.map((node) => [node.id, node]))
  const addedNodes = after.nodes.filter((node) => !previous.has(node.id)).map((node) => node.id)
  const removedNodes = before.nodes.filter((node) => !next.has(node.id)).map((node) => node.id)
  const changedNodes: { id: string; fields: string[] }[] = []
  for (const node of after.nodes) {
    const prior = previous.get(node.id)
    if (!prior) continue
    const fields: string[] = []
    if (prior.type !== node.type) fields.push("type")
    if (stable(prior.config) !== stable(node.config)) fields.push("config")
    if ((prior.displayName ?? "") !== (node.displayName ?? "")) fields.push("displayName")
    if (prior.position.x !== node.position.x || prior.position.y !== node.position.y) fields.push("position")
    if (fields.length) changedNodes.push({ id: node.id, fields })
  }
  const edgeKey = (edge: WorkflowEdge) => `${edge.source}:${edge.sourcePort}->${edge.target}:${edge.targetPort}`
  const previousEdges = new Map(before.edges.map((edge) => [edge.id, edge]))
  const nextEdges = new Map(after.edges.map((edge) => [edge.id, edge]))
  return {
    addedNodes,
    removedNodes,
    changedNodes,
    addedEdges: after.edges.filter((edge) => !previousEdges.has(edge.id)).map((edge) => edge.id),
    removedEdges: before.edges.filter((edge) => !nextEdges.has(edge.id)).map((edge) => edge.id),
    changedEdges: after.edges.filter((edge) => {
      const prior = previousEdges.get(edge.id)
      return prior ? edgeKey(prior) !== edgeKey(edge) : false
    }).map((edge) => edge.id),
  }
}

export function diffLines(diff: GraphDiff, locale: WorkflowLocale = "es") {
  const lines: string[] = []
  for (const id of diff.addedNodes) lines.push(text(locale, `Nodo agregado: ${id}`, `Node added: ${id}`))
  for (const id of diff.removedNodes) lines.push(text(locale, `Nodo quitado: ${id}`, `Node removed: ${id}`))
  for (const change of diff.changedNodes) lines.push(text(locale, `Nodo cambiado: ${change.id} (${change.fields.join(", ")})`, `Node changed: ${change.id} (${change.fields.join(", ")})`))
  for (const id of diff.addedEdges) lines.push(text(locale, `Enlace agregado: ${id}`, `Edge added: ${id}`))
  for (const id of diff.removedEdges) lines.push(text(locale, `Enlace quitado: ${id}`, `Edge removed: ${id}`))
  for (const id of diff.changedEdges) lines.push(text(locale, `Enlace cambiado: ${id}`, `Edge changed: ${id}`))
  if (!lines.length) lines.push(text(locale, "Sin diferencias.", "No differences."))
  return lines
}

export function rollbackDraft(value: WorkflowValue, version: number): WorkflowValue | null {
  const snapshot = value.published?.version === version ? value.published : value.versions?.find((entry) => entry.version === version)
  if (!snapshot) return null
  return {
    ...value,
    draft: {
      nodes: snapshot.graph.nodes.map((node) => ({ ...node, position: { ...node.position }, config: { ...node.config } })),
      edges: snapshot.graph.edges.map((edge) => ({ ...edge })),
    },
  }
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => redact(entry))
  if (!value || typeof value !== "object") return value
  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY.test(key) && typeof child === "string") continue
    next[key] = redact(child)
  }
  return next
}

export function exportWorkflowValue(value: WorkflowValue) {
  const scrub = (graph: WorkflowGraph) => ({
    nodes: graph.nodes.map((node) => ({ ...node, position: { ...node.position }, config: redact(node.config) as Record<string, unknown> })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  })
  return {
    version: value.version,
    workspace: value.workspace,
    draft: scrub(value.draft),
    ...(value.published ? { published: { version: value.published.version, publishedAt: value.published.publishedAt, graph: scrub(value.published.graph) } } : {}),
  }
}
