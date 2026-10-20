"use client"

import { AgentTree, type AgentNode, type AgentStatus } from "@/registry/ui/agent-tree"
import { StressCase } from "@/app/examples/stress-case"

import { bulletinNodes } from "../fixtures"

function node(partial: Partial<AgentNode> & Pick<AgentNode, "id" | "role">): AgentNode {
  return {
    parentId: null,
    model: "bruma-mini",
    task: partial.role,
    status: "done",
    costUsd: 0.01,
    elapsedMs: 1_000,
    ...partial,
  }
}

const word = [node({ id: "w", role: "Faro" })]

const sentences = [
  node({
    id: "s",
    role: "Crónica",
    task: "Primera frase del parte. Segunda frase con el relevo. Tercera frase sobre la niebla de la mañana.",
  }),
]

const unbroken = "x".repeat(60)
const longToken = [
  node({
    id: "long",
    role: unbroken,
    task: unbroken,
    model: unbroken,
  }),
]

const emoji = [node({ id: "e", role: "🌊 Faro", task: "Fotos del malecón 🌊", status: "running" })]

const numbers = [
  node({ id: "n", role: "Caja", costUsd: 1234.5, elapsedMs: 3_661_000, status: "done" }),
  node({ id: "n2", parentId: "n", role: "Cambio", costUsd: 0.0004, elapsedMs: 400, status: "running" }),
]

const crowd: AgentNode[] = [
  node({ id: "root", role: "Mesa", status: "running", task: "Repartir el parte." }),
  ...Array.from({ length: 10 }, (_, index) =>
    node({
      id: `hijo-${index + 1}`,
      parentId: "root",
      role: `Enlace ${index + 1}`,
      status: (["running", "done", "needs-you", "failed", "stopped"] as const)[index % 5] satisfies AgentStatus,
      costUsd: (index + 1) / 100,
      elapsedMs: (index + 1) * 1_000,
    }),
  ),
]

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Árbol de agentes</h1>

      <StressCase label="Tarea vacía">
        <AgentTree nodes={[node({ id: "empty-task", role: "Vacío", task: "" })]} />
      </StressCase>

      <StressCase label="Una palabra">
        <AgentTree nodes={word} />
      </StressCase>

      <StressCase label="Varias frases">
        <AgentTree nodes={sentences} />
      </StressCase>

      <StressCase label="60 caracteres sin espacios">
        <AgentTree nodes={longToken} nodeWidth={220} />
      </StressCase>

      <StressCase label="Emoji">
        <AgentTree nodes={emoji} />
      </StressCase>

      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentTree nodes={bulletinNodes.slice(0, 3)} />
        </div>
      </StressCase>

      <StressCase label="Números">
        <AgentTree nodes={numbers} />
      </StressCase>

      <StressCase label="Cantidad 0">
        <AgentTree nodes={[]} />
      </StressCase>

      <StressCase label="Cantidad 1">
        <AgentTree nodes={word} />
      </StressCase>

      <StressCase label="Caso realista">
        <AgentTree nodes={bulletinNodes} />
      </StressCase>

      <StressCase label="Diez veces más">
        <AgentTree nodes={crowd} />
      </StressCase>

      <StressCase label="320px" width={320}>
        <AgentTree nodes={bulletinNodes} />
      </StressCase>

      <StressCase label="Apretado por un hermano">
        <div className="flex w-[640px] max-w-full gap-3">
          <div className="w-36 shrink-0 rounded-lg bg-muted p-3 text-sm text-muted-foreground">Hermano</div>
          <div className="min-w-0 flex-1">
            <AgentTree nodes={bulletinNodes.slice(0, 3)} />
          </div>
        </div>
      </StressCase>

      <StressCase label="Muy ancho">
        <div className="w-[960px] max-w-none">
          <AgentTree nodes={bulletinNodes} />
        </div>
      </StressCase>

      <StressCase label="Carga">
        <AgentTree nodes={[]} loading />
      </StressCase>

      <StressCase label="Vacío">
        <AgentTree nodes={[]} />
      </StressCase>

      <StressCase label="Error">
        <AgentTree nodes={bulletinNodes} error="Se cortó la señal del faro antes de cerrar el parte." />
      </StressCase>
    </main>
  )
}
