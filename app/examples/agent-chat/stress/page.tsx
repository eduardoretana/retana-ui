"use client"

import { StressCase } from "@/app/examples/stress-case"

import { AgentChat } from "@/registry/blocks/agent-chat"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Chat de agentes</h1>
      <StressCase label="320px" width={320}>
        <AgentChat shell={false} className="h-[28rem]" />
      </StressCase>
      <StressCase label="Vacío y 60 caracteres">
        <AgentChat
          shell={false}
          className="h-[24rem]"
          title={long}
          messages={[]}
          agents={[]}
          brief={{ product: long, angle: "", audience: "مرحبا", channels: [], palette: [], cta: "😀" }}
        />
      </StressCase>
      <StressCase label="Diez mensajes" width={640}>
        <AgentChat
          shell={false}
          className="h-[24rem]"
          messages={Array.from({ length: 10 }, (_, index) => ({
            id: `m-${index}`,
            role: index % 2 === 0 ? "user" : "agent",
            author: `Persona ${index + 1}`,
            body: `Nota ${index + 1}`,
          }))}
          agents={Array.from({ length: 10 }, (_, index) => ({
            id: `a-${index}`,
            name: `Agente ${index + 1}`,
            task: "Tarea",
            status: "queued",
          }))}
        />
      </StressCase>
    </main>
  )
}
