"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentGraph } from "@/registry/ui/agent-graph"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Red de agentes</h1>
      <StressCase label="Vacío">
        <AgentGraph />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentGraph loading />
        <AgentGraph error="No pudimos leer la red." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentGraph
          nodes={[{ id: "a", name: token, kind: "agent", pulse: "waiting", column: 0, row: 0 }]}
          links={[{ id: "l", from: "a", to: "b", calls: 9, tone: "blocked" }, { id: "b", from: "b", to: "a", calls: 1, tone: "call" }]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentGraph
            nodes={[
              { id: "a", name: "عامل", kind: "agent", pulse: "working", column: 0, row: 0 },
              { id: "b", name: "أداة", kind: "tool", pulse: "failed", column: 1, row: 0 },
            ]}
            links={[{ id: "l", from: "a", to: "b", calls: 2, tone: "blocked" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez nodos">
        <AgentGraph
          nodes={Array.from({ length: 10 }, (_, index) => ({
            id: `n${index}`,
            name: index === 0 ? "" : `Nodo ${index}`,
            kind: "agent" as const,
            pulse: "quiet" as const,
            column: index % 5,
            row: Math.floor(index / 5),
          }))}
          links={Array.from({ length: 9 }, (_, index) => ({ id: `l${index}`, from: `n${index}`, to: `n${index + 1}`, calls: 1, tone: "call" as const }))}
        />
      </StressCase>
    </main>
  )
}
