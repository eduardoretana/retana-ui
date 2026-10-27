"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentLanes } from "@/registry/ui/agent-lanes"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Carriles de agentes</h1>
      <StressCase label="Vacío">
        <AgentLanes />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentLanes loading />
        <AgentLanes error="No pudimos leer el piso." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentLanes
          window={{ startMin: 600, endMin: 720, nowMin: 700 }}
          agents={[{ id: "bruma", name: token, role: token }]}
          blocks={[{ id: "largo", agentId: "bruma", title: token, startMin: 610, durationMin: 40, tone: "ask", handoffTo: "horno" }]}
          onApprove={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentLanes
            window={{ startMin: 0, endMin: 60, nowMin: 30 }}
            agents={[{ id: "a", name: "عامل", role: "دور" }]}
            blocks={[{ id: "b", agentId: "a", title: "مهمة", startMin: 10, durationMin: 20, tone: "work" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez bloques">
        <AgentLanes
          window={{ startMin: 0, endMin: 120, nowMin: 60 }}
          agents={[{ id: "bruma", name: "Bruma", role: "Cotizaciones" }]}
          blocks={Array.from({ length: 10 }, (_, index) => ({
            id: `b${index}`,
            agentId: "bruma",
            title: index === 0 ? "" : `Bloque ${index}`,
            startMin: index * 8,
            durationMin: 6,
            tone: "work" as const,
          }))}
        />
      </StressCase>
    </main>
  )
}
