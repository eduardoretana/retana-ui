"use client"

import { StressCase } from "@/app/examples/stress-case"

import { AgentRun } from "@/registry/blocks/agent-run"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Corrida de agente</h1>
      <StressCase label="320px" width={320}>
        <AgentRun shell={false} />
      </StressCase>
      <StressCase label="Vacío y deshabilitado">
        <AgentRun
          shell={false}
          title="Horno"
          steps={[]}
          activity={[]}
          needsInput={null}
          draft={null}
          details={{ model: "", tokens: "", cost: "", duration: "" }}
        />
      </StressCase>
      <StressCase label="60 caracteres y diez pasos">
        <AgentRun
          shell={false}
          title={long}
          steps={Array.from({ length: 10 }, (_, index) => ({
            id: `s-${index}`,
            title: index === 0 ? long : `Paso ${index + 1}`,
            status: "pending",
            tools: ["buscar"],
          }))}
          draft={{ path: long, lines: [{ kind: "add", text: long }] }}
        />
      </StressCase>
    </main>
  )
}
