"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentCursors } from "@/registry/ui/agent-cursors"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cursores de agentes</h1>
      <StressCase label="Vacío">
        <AgentCursors />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentCursors loading />
        <AgentCursors error="No pudimos abrir la nota." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentCursors
          paragraphs={[{ id: "a", text: token }]}
          cursors={[{ id: "b", name: token, x: 10, y: 10, note: token }]}
          suggestions={[{ id: "s", cursorId: "b", text: token }]}
          onAccept={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentCursors paragraphs={[{ id: "a", text: "ملاحظة طويلة" }]} cursors={[{ id: "b", name: "عامل", x: 40, y: 30, away: true }]} />
        </div>
      </StressCase>
      <StressCase label="Diez cursores">
        <AgentCursors
          paragraphs={[{ id: "a", text: "Nota del taller." }]}
          cursors={Array.from({ length: 10 }, (_, index) => ({
            id: `c${index}`,
            name: index === 0 ? "" : `Agente ${index}`,
            x: (index % 5) * 18 + 4,
            y: Math.floor(index / 5) * 40 + 8,
          }))}
        />
      </StressCase>
    </main>
  )
}
