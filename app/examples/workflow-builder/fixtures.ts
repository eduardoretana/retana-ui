import type { CredentialRef, PublishedSnapshot } from "@/registry/lib/workflow-policy"
import type { NodeTypeDefinition, WorkflowGraph, WorkflowRun } from "@/registry/lib/workflow-builder"

type Copy = { es: string; en: string }
const text = (locale: "es" | "en", copy: Copy) => (locale === "en" ? copy.en : copy.es)

export function workflowNodeTypes(locale: "es" | "en"): NodeTypeDefinition[] {
  const port = (id: string, direction: "in" | "out", kind: "main" | "model" | "tools" | "memory" | "error", role: "primary" | "secondary", label: Copy) => ({ id, direction, kind, role, label: text(locale, label) })
  return [
    { type: "trigger", category: "logic", title: text(locale, { es: "Mensaje entrante", en: "Incoming message" }), description: text(locale, { es: "Arranca con un mensaje de ejemplo.", en: "Starts from a sample message." }), startsRun: true, sideEffect: "none", ports: [port("out", "out", "main", "primary", { es: "Salida", en: "Out" })], fields: [{ kind: "select", key: "channel", label: text(locale, { es: "Canal", en: "Channel" }), required: true, options: [{ value: "message", label: text(locale, { es: "Mensaje", en: "Message" }) }] }], outputSchema: { properties: { text: { type: "string" } } } },
    { type: "ai-agent", category: "tools", title: text(locale, { es: "Clasificar intención", en: "Classify intent" }), description: text(locale, { es: "Lee el mensaje y propone una intención.", en: "Reads the message and proposes an intent." }), sideEffect: "read", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("model", "in", "model", "secondary", { es: "Modelo", en: "Model" }), port("tools", "in", "tools", "secondary", { es: "Herramientas", en: "Tools" }), port("memory", "in", "memory", "secondary", { es: "Memoria", en: "Memory" }), port("out", "out", "main", "primary", { es: "Salida", en: "Out" })], fields: [{ kind: "radio", key: "task", label: text(locale, { es: "Tarea", en: "Task" }), required: true, options: [{ value: "classify", label: text(locale, { es: "Clasificar", en: "Classify" }) }] }], outputSchema: { properties: { intent: { type: "string" }, confidence: { type: "number" } } } },
    { type: "branch", category: "logic", title: text(locale, { es: "Decidir ruta", en: "Choose a path" }), description: text(locale, { es: "Sigue la ruta de la intención.", en: "Follows the intent path." }), sideEffect: "none", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("yes", "out", "main", "primary", { es: "Sí", en: "Yes" }), port("no", "out", "main", "secondary", { es: "No", en: "No" })], fields: [] },
    { type: "guard", category: "logic", title: text(locale, { es: "Guarda", en: "Guard" }), description: text(locale, { es: "Comprueba que la intención es segura.", en: "Checks that the intent is safe." }), behavior: "guard", sideEffect: "read", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("out", "out", "main", "primary", { es: "Pasa", en: "Pass" })], fields: [] },
    { type: "approval", category: "action", title: text(locale, { es: "Aprobación humana", en: "Human approval" }), description: text(locale, { es: "Una persona del equipo confirma el envío.", en: "A teammate confirms the send." }), behavior: "approval", sideEffect: "none", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("out", "out", "main", "primary", { es: "Salida", en: "Out" })], fields: [{ kind: "switch", key: "required", label: text(locale, { es: "Activa", en: "Enabled" }) }] },
    { type: "database", category: "tools", title: text(locale, { es: "Buscar contacto", en: "Find contact" }), description: text(locale, { es: "Lee un contacto de ejemplo.", en: "Reads a sample contact." }), sideEffect: "read", subtitleKey: "operation", subtitleBrackets: true, ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("out", "out", "main", "primary", { es: "Salida", en: "Out" })], fields: [{ kind: "text", key: "operation", label: text(locale, { es: "Operación", en: "Operation" }), required: true }], outputSchema: { properties: { contactId: { type: "string" } } } },
    { type: "crm.write", category: "action", title: text(locale, { es: "Responder", en: "Reply" }), description: text(locale, { es: "Escribe la respuesta en el hilo.", en: "Writes the reply on the thread." }), sideEffect: "write", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" }), port("out", "out", "main", "primary", { es: "Salida", en: "Out" }), port("error", "out", "error", "secondary", { es: "Error", en: "Error" })], fields: [{ kind: "text", key: "body", label: text(locale, { es: "Mensaje", en: "Message" }), expression: true }, { kind: "pills", key: "formats", label: text(locale, { es: "Formatos", en: "Formats" }), options: [{ value: "text", label: "Texto" }, { value: "image", label: "Imagen" }] }] },
    { type: "escalate", category: "action", title: text(locale, { es: "Escalar a una persona", en: "Hand off to a person" }), description: text(locale, { es: "Deja el hilo en la bandeja del equipo.", en: "Leaves the thread in the team queue." }), sideEffect: "none", ports: [port("in", "in", "main", "primary", { es: "Entrada", en: "In" })], fields: [] },
    { type: "handler", category: "logic", title: text(locale, { es: "Aviso de error", en: "Error notice" }), description: text(locale, { es: "Recibe la rama de error.", en: "Receives the error branch." }), sideEffect: "none", ports: [port("in", "in", "error", "primary", { es: "Error", en: "Error" })], fields: [] },
  ]
}

export const workflowCredentials: CredentialRef[] = [
  { id: "cred-norte", name: "Llave del taller norte", type: "crm", workspace: "marca-norte" },
  { id: "cred-sur", name: "Llave del taller sur", type: "crm", workspace: "marca-sur" },
]

function at(id: string, type: string, x: number, y: number, config: Record<string, unknown> = {}) {
  return { id, type, position: { x, y }, config }
}

export const filledGraph: WorkflowGraph = {
  nodes: [
    at("entrada", "trigger", 24, 80, { channel: "message" }),
    at("clasificar", "ai-agent", 280, 48, { task: "classify" }),
    at("guarda", "guard", 540, 48),
    at("persona", "approval", 800, 48, { required: true }),
    at("ruta", "branch", 1060, 48, { route: "yes" }),
    at("contacto", "database", 1320, 8, { operation: "contact.find" }),
    at("respuesta", "crm.write", 1580, 8, { body: '{{ $node["clasificar"].json.intent }}', formats: ["text"], credentialId: "cred-norte" }),
    at("escalar", "escalate", 1320, 180),
  ],
  edges: [
    { id: "e1", source: "entrada", sourcePort: "out", target: "clasificar", targetPort: "in" },
    { id: "e2", source: "clasificar", sourcePort: "out", target: "guarda", targetPort: "in" },
    { id: "e3", source: "guarda", sourcePort: "out", target: "persona", targetPort: "in" },
    { id: "e4", source: "persona", sourcePort: "out", target: "ruta", targetPort: "in" },
    { id: "e5", source: "ruta", sourcePort: "yes", target: "contacto", targetPort: "in" },
    { id: "e6", source: "contacto", sourcePort: "out", target: "respuesta", targetPort: "in" },
    { id: "e7", source: "ruta", sourcePort: "no", target: "escalar", targetPort: "in" },
  ],
}

export const emptyGraph: WorkflowGraph = { nodes: [], edges: [] }
export const invalidGraph: WorkflowGraph = {
  nodes: [at("entrada", "trigger", 24, 40), at("clasificar", "ai-agent", 280, 40), at("bucle", "branch", 540, 40)],
  edges: [
    { id: "e1", source: "clasificar", sourcePort: "out", target: "bucle", targetPort: "in" },
    { id: "e2", source: "bucle", sourcePort: "yes", target: "clasificar", targetPort: "in" },
    { id: "colgante", source: "entrada", sourcePort: "out", target: "fantasma", targetPort: "in" },
  ],
}
export const blockedGraph: WorkflowGraph = { nodes: [at("escribir", "crm.write", 40, 48, { body: "hola", credentialId: "cred-norte" })], edges: [] }
export const expressionGraph: WorkflowGraph = {
  nodes: [at("clasificar", "ai-agent", 24, 48, { task: "classify" }), at("respuesta", "crm.write", 320, 48, { body: '{{ $node["clasificar"].json.', formats: ["text"], credentialId: "cred-norte" })],
  edges: [{ id: "e1", source: "clasificar", sourcePort: "out", target: "respuesta", targetPort: "in" }],
}
export const foreignCredentialGraph: WorkflowGraph = {
  nodes: [at("guarda", "guard", 24, 48), at("persona", "approval", 280, 48, { required: true }), at("respuesta", "crm.write", 540, 48, { body: "hola", credentialId: "cred-sur", formats: ["text"] })],
  edges: [
    { id: "e1", source: "guarda", sourcePort: "out", target: "persona", targetPort: "in" },
    { id: "e2", source: "persona", sourcePort: "out", target: "respuesta", targetPort: "in" },
  ],
}
export const publishedSnapshot: PublishedSnapshot = { version: 2, publishedAt: "2026-11-01T15:00:00.000Z", graph: { nodes: filledGraph.nodes.filter((node) => node.id !== "escalar"), edges: filledGraph.edges.filter((edge) => edge.target !== "escalar") } }
export const pinnedData = { contacto: { contactId: "c-204" } }
export const runningRun: WorkflowRun = {
  id: "run-demo",
  status: "running",
  startedAt: 1000,
  payload: { text: "¿Siguen abiertos?" },
  nodes: { entrada: { status: "success", durationMs: 12, cost: 0.0005, output: { text: "¿Siguen abiertos?" } }, clasificar: { status: "running", durationMs: 40, cost: 0 } },
  timeline: [{ at: 1012, nodeId: "entrada", status: "success", message: "Listo." }],
  events: [{ type: "step.completed", runId: "run-demo", nodeId: "entrada", attempt: 1, at: 1012, tokens: { input: 8, output: 0 }, cost: 0.0005 }],
}
export const failedGraph: WorkflowGraph = {
  nodes: [{ ...at("escribir", "crm.write", 40, 40, { body: "hola", credentialId: "cred-norte" }), onError: "errorBranch", retry: { maxAttempts: 3, backoff: "exponential", initialMs: 10, maxMs: 40 } }, at("aviso", "handler", 320, 40)],
  edges: [{ id: "err", source: "escribir", sourcePort: "error", target: "aviso", targetPort: "in" }],
}
export const failedRun: WorkflowRun = {
  id: "run-retry",
  status: "error",
  startedAt: 2000,
  finishedAt: 2080,
  payload: { text: "ejemplo" },
  nodes: {
    escribir: { status: "error", durationMs: 70, cost: 0, error: "intento 2", attempts: [{ attempt: 1, at: 2010, error: "intento 1" }, { attempt: 2, at: 2030, error: "intento 2" }] },
    aviso: { status: "success", durationMs: 8, cost: 0.0005, output: { noted: true } },
  },
  timeline: [{ at: 2070, nodeId: "escribir", status: "error", message: "intento 2" }, { at: 2078, nodeId: "aviso", status: "success", message: "Listo." }],
  events: [
    { type: "step.failed", runId: "run-retry", nodeId: "escribir", attempt: 2, at: 2070, tokens: { input: 4, output: 0 }, cost: 0 },
    { type: "step.completed", runId: "run-retry", nodeId: "aviso", attempt: 1, at: 2078, tokens: { input: 0, output: 0 }, cost: 0.0005 },
  ],
}
export const longName = "N".repeat(60)
export const filled = filledGraph
export const empty = emptyGraph
export const loading = { loading: true as const }
export const error = { message: "No se pudo leer el flujo." }
