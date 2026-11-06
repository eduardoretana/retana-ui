import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"

import {
  applyWorkflowChange,
  createWorkflowSimulator,
  importWorkflow,
  previewConnection,
  replayPins,
  retryDelay,
  runWorkflow,
  serializeWorkflowJson,
  validateGraph,
  type NodeTypeDefinition,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowNode,
} from "@/registry/lib/workflow-builder"
import { expressionCompletions, resolveExpression } from "@/registry/lib/workflow-expr"
import { diffGraphs, exportWorkflowValue, publishDecision, rollbackDraft, validateWorkflow, type CredentialRef } from "@/registry/lib/workflow-policy"

const kinds = ["main", "model", "tools", "memory", "error"] as const

function node(partial: Partial<WorkflowNode> & Pick<WorkflowNode, "id" | "type">): WorkflowNode {
  return { position: { x: 0, y: 0 }, config: {}, ...partial }
}

function edge(partial: Partial<WorkflowEdge> & Pick<WorkflowEdge, "id" | "source" | "target">): WorkflowEdge {
  return { sourcePort: "out", targetPort: "in", ...partial }
}

const registry: NodeTypeDefinition[] = [
  {
    type: "trigger",
    category: "logic",
    title: "Disparador",
    description: "Empieza el flujo.",
    startsRun: true,
    sideEffect: "none",
    ports: [{ id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" }],
    fields: [{ kind: "select", key: "channel", label: "Canal", required: true, options: [{ value: "message", label: "Mensaje" }] }],
    outputSchema: { properties: { text: { type: "string" } } },
  },
  {
    type: "ai-agent",
    category: "tools",
    title: "Agente",
    description: "Clasifica.",
    sideEffect: "read",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "model", direction: "in", kind: "model", role: "secondary", label: "Model" },
      { id: "tools", direction: "in", kind: "tools", role: "secondary", label: "Tools" },
      { id: "memory", direction: "in", kind: "memory", role: "secondary", label: "Memory" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" },
    ],
    fields: [],
    outputSchema: { properties: { intent: { type: "string" } } },
  },
  {
    type: "guard",
    category: "logic",
    title: "Guarda",
    description: "Revisa la intención.",
    behavior: "guard",
    sideEffect: "read",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Pasa" },
    ],
    fields: [],
  },
  {
    type: "approval",
    category: "action",
    title: "Aprobación",
    description: "Una persona confirma.",
    behavior: "approval",
    sideEffect: "none",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" },
    ],
    fields: [],
  },
  {
    type: "crm.write",
    category: "action",
    title: "Escribir en el CRM",
    description: "Guarda un dato.",
    sideEffect: "write",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" },
      { id: "error", direction: "out", kind: "error", role: "secondary", label: "Error" },
    ],
    fields: [
      { kind: "text", key: "body", label: "Mensaje", expression: true },
      { kind: "text", key: "credentialId", label: "Credencial" },
    ],
  },
  {
    type: "db.write",
    category: "tools",
    title: "Escribir en la base",
    description: "Inserta un registro.",
    sideEffect: "write",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" },
    ],
    fields: [],
  },
  {
    type: "handler",
    category: "logic",
    title: "Aviso",
    description: "Recibe el error.",
    sideEffect: "none",
    ports: [{ id: "in", direction: "in", kind: "error", role: "primary", label: "Error" }],
    fields: [],
  },
]

const credentials: CredentialRef[] = [
  { id: "cred-a", name: "Llave norte", type: "crm", workspace: "marca-a" },
  { id: "cred-b", name: "Llave sur", type: "crm", workspace: "marca-b" },
]

describe("puertos", () => {
  it("rechaza cada par de tipos distinto y acepta el mismo", () => {
    for (const from of kinds) {
      for (const to of kinds) {
        const local: NodeTypeDefinition[] = [
          {
            type: "custom",
            category: "logic",
            title: "N",
            description: "N",
            ports: [
              { id: "out", direction: "out", kind: from, role: "primary", label: from },
              { id: "in", direction: "in", kind: to, role: "primary", label: to },
            ],
            fields: [],
          },
        ]
        const graph: WorkflowGraph = {
          nodes: [node({ id: "s", type: "custom" }), node({ id: "t", type: "custom" })],
          edges: [edge({ id: "e", source: "s", target: "t" })],
        }
        const rejected = validateGraph(graph, local).some((issue) => issue.code === "incompatible-ports")
        expect(rejected).toBe(from !== to)
      }
    }
  })

  it("no conecta main con model", () => {
    const graph: WorkflowGraph = {
      nodes: [node({ id: "a", type: "trigger", config: { channel: "message" } }), node({ id: "b", type: "ai-agent" })],
      edges: [],
    }
    const issue = previewConnection(graph, registry, edge({ id: "e", source: "a", sourcePort: "out", target: "b", targetPort: "model" }))
    expect(issue?.code).toBe("incompatible-ports")
    expect(issue?.message).toMatch(/No se puede conectar/i)
  })
})

describe("expresiones", () => {
  const ctx = { nodes: { clasificar: { json: { intent: "pregunta", items: ["uno"] } } }, json: { text: "hola" } }

  it("lee rutas, índices y helpers", () => {
    expect(resolveExpression('{{ $node["clasificar"].json.intent }}', ctx).value).toBe("pregunta")
    expect(resolveExpression('{{ $node["clasificar"].json.items[0] }}', ctx).value).toBe("uno")
    expect(resolveExpression("{{ upper($json.text) }}", ctx).value).toBe("HOLA")
    expect(resolveExpression("Hola {{ $json.text }}", ctx).value).toBe("Hola hola")
  })

  it("sugiere claves del nodo previo", () => {
    const source = '{{ $node["clasificar"].json.'
    const items = expressionCompletions(source, source.length, ctx)
    expect(items.map((item) => item.label)).toEqual(["intent", "items"])
  })

  it("marca una ruta inexistente", () => {
    const graph: WorkflowGraph = {
      nodes: [
        node({ id: "clasificar", type: "ai-agent" }),
        node({ id: "escribir", type: "crm.write", config: { body: '{{ $node["clasificar"].json.missing }}', credentialId: "cred-a" } }),
      ],
      edges: [edge({ id: "e", source: "clasificar", target: "escribir" })],
    }
    const issues = validateWorkflow({ graph, registry, workspace: "marca-a", credentials })
    expect(issues.some((issue) => issue.code === "bad-expression" && issue.nodeId === "escribir")).toBe(true)
  })

  it("no ejecuta código ni camina por el prototipo", () => {
    const source = readFileSync(path.join(process.cwd(), "registry/lib/workflow-expr.ts"), "utf8")
    expect(source.includes("eval(")).toBe(false)
    expect(source.includes("new Function")).toBe(false)
    const attacks = ["{{ __proto__ }}", "{{ constructor }}", '{{ constructor.constructor("return 1")() }}', "{{ globalThis }}", "{{ process }}", '{{ $json["__proto__"] }}', '{{ $json["constructor"] }}', '{{ $node["__proto__"].json }}', "{{ evil() }}"]
    for (const attack of attacks) {
      const result = resolveExpression(attack, { json: {} })
      expect(result.error, attack).toBeTruthy()
      expect(result.value).toBeUndefined()
    }
    expect(resolveExpression("{{ $json.admin }}", { json: {} }).error).toBeTruthy()
  })
})

describe("ejecución", () => {
  const clock = () => {
    let now = 0
    return { now: () => now, wait: async (ms: number) => { now += ms } }
  }

  it("no llama al ejecutor de un nodo fijado", async () => {
    const spy = vi.fn(async (ctx: { node: { id: string } }) => {
      void ctx
      return { outputs: { from: "live" }, cost: 1 }
    })
    const graph: WorkflowGraph = {
      nodes: [node({ id: "contacto", type: "trigger", config: { channel: "message" } }), node({ id: "agente", type: "ai-agent" })],
      edges: [edge({ id: "e", source: "contacto", target: "agente" })],
    }
    const run = await runWorkflow({ graph, registry, executor: spy, clock: clock(), pinned: { contacto: { text: "fijado" } } })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]?.[0]?.node.id).toBe("agente")
    expect(run.nodes.contacto?.pinned).toBe(true)
    expect(run.nodes.agente?.input).toMatchObject({ in: { text: "fijado" } })
  })

  it("reintenta con backoff y deja tres intentos en la línea de tiempo", async () => {
    const graph: WorkflowGraph = {
      nodes: [node({ id: "escribir", type: "crm.write", config: { credentialId: "cred-a" }, retry: { maxAttempts: 3, backoff: "exponential", initialMs: 10, maxMs: 40 } })],
      edges: [],
    }
    const run = await runWorkflow({ graph, registry, clock: clock(), executor: createWorkflowSimulator({ stepMs: 5, failTimes: { escribir: 2 }, clock: clock() }) })
    expect(run.status).toBe("success")
    expect(run.nodes.escribir?.attempts).toHaveLength(3)
    expect(run.timeline.filter((entry) => entry.message.startsWith("Intento")).length).toBe(3)
    expect(retryDelay(1, { backoff: "exponential", initialMs: 10, maxMs: 40 })).toBe(10)
    expect(retryDelay(2, { backoff: "exponential", initialMs: 10, maxMs: 40 })).toBe(20)
    expect(retryDelay(8, { backoff: "exponential", initialMs: 10, maxMs: 40 })).toBe(40)
  })

  it("sigue la rama de error", async () => {
    const graph: WorkflowGraph = {
      nodes: [node({ id: "escribir", type: "crm.write", config: {}, onError: "errorBranch" }), node({ id: "aviso", type: "handler" })],
      edges: [edge({ id: "err", source: "escribir", sourcePort: "error", target: "aviso", targetPort: "in" })],
    }
    const run = await runWorkflow({
      graph,
      registry,
      clock: clock(),
      executor: async ({ node: current }) => (current.id === "escribir" ? { error: "falló" } : { outputs: { handled: true }, cost: 0 }),
    })
    expect(run.nodes.escribir?.status).toBe("error")
    expect(run.nodes.aviso?.status).toBe("success")
  })

  it("pausa hasta la aprobación del anfitrión", async () => {
    const graph: WorkflowGraph = { nodes: [node({ id: "ok", type: "approval" })], edges: [] }
    const paused = await runWorkflow({ graph, registry, clock: clock() })
    expect(paused.status).toBe("waiting-approval")
    const approved = await runWorkflow({ graph, registry, clock: clock(), onApprovalRequest: async () => "approve" })
    expect(approved.nodes.ok?.status).toBe("success")
  })

  it("copia en el evento los tokens y el costo que reporta el executor", async () => {
    const events: { type: string; tokens?: { input: number; output: number; cache?: number }; cost?: number }[] = []
    const graph: WorkflowGraph = { nodes: [node({ id: "agente", type: "ai-agent" })], edges: [] }
    const run = await runWorkflow({
      graph,
      registry,
      clock: clock(),
      onRunEvent: (event) => events.push(event),
      executor: async () => ({ outputs: { ok: true }, cost: 0.004, usage: { inputTokens: 12, outputTokens: 4, cacheTokens: 1, costUsd: 0.004 } }),
    })
    expect(events.map((event) => event.type)).toEqual(["step.started", "step.completed"])
    expect(events[1]?.tokens).toEqual({ input: 12, output: 4, cache: 1 })
    expect(events[1]?.cost).toBe(0.004)
    expect(run.nodes.agente?.usage?.costUsd).toBe(0.004)
    expect(run.events[1]?.cost).toBe(0.004)
  })

  it("reproduce un run desde un nodo con las salidas previas fijadas", async () => {
    const graph: WorkflowGraph = {
      nodes: [node({ id: "a", type: "trigger", config: { channel: "message" } }), node({ id: "b", type: "ai-agent" })],
      edges: [edge({ id: "e", source: "a", target: "b" })],
    }
    const first = await runWorkflow({ graph, registry, clock: clock(), executor: createWorkflowSimulator({ stepMs: 1, clock: clock() }) })
    const pins = replayPins(first, graph, "b")
    expect(pins.a).toBeTruthy()
    expect(pins.b).toBeUndefined()
  })
})

describe("guardas, borrador y secretos", () => {
  it("bloquea la publicación si una escritura no tiene guarda y aprobación", () => {
    const graph: WorkflowGraph = { nodes: [node({ id: "escribir", type: "crm.write", config: { credentialId: "cred-a" } })], edges: [] }
    const decision = publishDecision(validateWorkflow({ graph, registry, workspace: "marca-a", credentials }))
    expect(decision.ok).toBe(false)
    expect(decision.reasons.some((reason) => reason.includes("escribir"))).toBe(true)
  })

  it("acepta la publicación cuando la guarda y la aprobación están aguas arriba", () => {
    const graph: WorkflowGraph = {
      nodes: [node({ id: "guarda", type: "guard" }), node({ id: "persona", type: "approval" }), node({ id: "escribir", type: "db.write" })],
      edges: [edge({ id: "e1", source: "guarda", target: "persona" }), edge({ id: "e2", source: "persona", target: "escribir" })],
    }
    expect(publishDecision(validateWorkflow({ graph, registry, workspace: "marca-a", credentials })).ok).toBe(true)
  })

  it("rechaza una credencial de otra marca", () => {
    const graph: WorkflowGraph = {
      nodes: [
        node({ id: "guarda", type: "guard" }),
        node({ id: "persona", type: "approval" }),
        node({ id: "escribir", type: "crm.write", config: { credentialId: "cred-b" } }),
      ],
      edges: [edge({ id: "e1", source: "guarda", target: "persona" }), edge({ id: "e2", source: "persona", target: "escribir" })],
    }
    expect(validateWorkflow({ graph, registry, workspace: "marca-a", credentials }).some((issue) => issue.code === "foreign-credential")).toBe(true)
  })

  it("no escribe el valor secreto en el JSON exportado", () => {
    const secret = "llave-super-secreta-marca"
    const graph: WorkflowGraph = { nodes: [node({ id: "escribir", type: "crm.write", config: { credentialId: "cred-a", apiKey: secret } })], edges: [] }
    const exported = JSON.stringify(exportWorkflowValue({ version: 1, workspace: "marca-a", draft: graph }))
    expect(exported.includes(secret)).toBe(false)
    expect(exported.includes("cred-a")).toBe(true)
    expect(validateWorkflow({ graph, registry, workspace: "marca-a", credentials }).some((issue) => issue.code === "inline-secret")).toBe(true)
  })

  it("el borrador no altera lo publicado y el rollback restaura", () => {
    const publishedGraph: WorkflowGraph = { nodes: [node({ id: "a", type: "trigger", config: { channel: "message" } })], edges: [] }
    const draft: WorkflowGraph = { nodes: [node({ id: "a", type: "trigger", config: { channel: "message" } }), node({ id: "b", type: "guard" })], edges: [] }
    const value = { version: 1 as const, workspace: "marca-a", draft, published: { graph: publishedGraph, version: 3, publishedAt: "2026-11-04T00:00:00.000Z" } }
    expect(diffGraphs(publishedGraph, draft).addedNodes).toEqual(["b"])
    expect(rollbackDraft(value, 3)?.draft).toEqual(publishedGraph)
    expect(value.published?.graph).toEqual(publishedGraph)
  })
})

describe("documento", () => {
  it("importa JSON corrupto con un error legible y rechaza un ciclo", () => {
    expect(importWorkflow("{", { registry }).ok).toBe(false)
    const cyclic = importWorkflow(
      {
        version: 1,
        graph: {
          nodes: [
            { id: "a", type: "trigger", position: { x: 0, y: 0 }, config: { channel: "message" } },
            { id: "b", type: "ai-agent", position: { x: 10, y: 0 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "a", sourcePort: "out", target: "b", targetPort: "in" },
            { id: "e2", source: "b", sourcePort: "out", target: "a", targetPort: "in" },
          ],
        },
      },
      { registry },
    )
    expect(cyclic.ok).toBe(false)
    if (!cyclic.ok) expect(cyclic.errors.join(" ")).toMatch(/ciclo/i)
  })

  it("applyWorkflowChange no muta el grafo", () => {
    const graph: WorkflowGraph = { nodes: [node({ id: "a", type: "trigger", config: { channel: "message" } })], edges: [] }
    const next = applyWorkflowChange(graph, { type: "move-nodes", moves: [{ id: "a", x: 8, y: 4 }] })
    expect(graph.nodes[0]?.position).toEqual({ x: 0, y: 0 })
    expect(next.nodes[0]?.position).toEqual({ x: 8, y: 4 })
    expect(serializeWorkflowJson(graph)).toContain('"version": 1')
  })

  it("un nodo sin canal queda en error", () => {
    const issues = validateGraph({ nodes: [node({ id: "a", type: "trigger" })], edges: [] }, registry)
    expect(issues.some((issue) => issue.code === "missing-config" && issue.nodeId === "a")).toBe(true)
  })
})
