import type { AgentNode, AgentStatus } from "@/registry/ui/agent-tree"

export const LIVE_ROLES = ["Mareas", "Archivo", "Citas", "Fotos", "Imprenta", "Puerto"]
export const LIVE_MODELS = ["bruma-mini", "bruma-large", "niebla-small"]
export const LIVE_TASKS = [
  "Anotar el cambio de guardia del torrero.",
  "Comparar el parte de niebla con el cuaderno de ayer.",
  "Elegir un pie de foto para el malecón.",
  "Cerrar el pliego antes de las cinco.",
]
export const LIVE_FAILURE = "El parte llegó incompleto y no se pudo cerrar la nota."

export const SIM_STEP_MS = 1000
export const SIM_COST_PER_SECOND = 0.0015

function pick<T>(items: readonly T[], random: () => number) {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length))
  return items[index]
}

/**
 * One beat of the live demo. Running nodes gain cost and time from props.
 * Sometimes a running node settles, and sometimes a new child is spawned.
 */
export function advanceAgentRun(nodes: readonly AgentNode[], random: () => number = Math.random): AgentNode[] {
  let next = nodes.map((node) => {
    if (node.status !== "running") return { ...node }
    return {
      ...node,
      elapsedMs: node.elapsedMs + SIM_STEP_MS,
      costUsd: node.costUsd + SIM_COST_PER_SECOND,
    }
  })

  const running = next.filter((node) => node.status === "running")
  if (running.length > 0 && random() < 0.45) {
    const pickIndex = random()
    const outcome = random()
    const chosen = running[Math.min(running.length - 1, Math.floor(pickIndex * running.length))]
    const status: AgentStatus = outcome < 0.55 ? "done" : outcome < 0.8 ? "needs-you" : "failed"
    next = next.map((node) =>
      node.id === chosen.id
        ? { ...node, status, error: status === "failed" ? LIVE_FAILURE : node.error }
        : node,
    )
  }

  if (next.length < 12 && random() < 0.55) {
    const parents = next.filter((node) => node.status === "running" || node.status === "done")
    const pool = parents.length > 0 ? parents : next
    if (pool.length > 0) {
      const parent = pick(pool, random)
      const ids = new Set(next.map((node) => node.id))
      let id = `agente-${next.length + 1}`
      let salt = 2
      while (ids.has(id)) id = `agente-${next.length + 1}-${salt++}`
      const child: AgentNode = {
        id,
        parentId: parent.id,
        role: pick(LIVE_ROLES, random),
        model: pick(LIVE_MODELS, random),
        task: pick(LIVE_TASKS, random),
        status: "running",
        costUsd: 0.0004,
        elapsedMs: 0,
      }
      next = [...next, child]
    }
  }

  return next
}

export function addManualAgent(nodes: readonly AgentNode[], id: string): AgentNode[] {
  const parent = nodes.find((node) => node.parentId == null)
  const child: AgentNode = {
    id,
    parentId: parent?.id ?? null,
    role: "Enlace",
    model: "bruma-mini",
    task: "Sumar un aviso suelto al boletín.",
    status: "running",
    costUsd: 0,
    elapsedMs: 0,
  }
  return [...nodes.map((node) => ({ ...node })), child]
}
