"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentInbox } from "@/registry/ui/agent-inbox"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Bandeja de agentes</h1>
      <StressCase label="Vacío">
        <AgentInbox />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentInbox loading />
        <AgentInbox error="No pudimos leer la bandeja." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentInbox
          now={Date.parse("2026-10-27T17:40:00.000Z")}
          openIds={["largo"]}
          tasks={[
            {
              id: "largo",
              title: token,
              summary: token,
              agent: token,
              status: "needs-you",
              startedAt: Date.parse("2026-10-27T17:40:00.000Z") - 90 * 60_000,
              steps: [{ id: "s", label: token, at: Date.parse("2026-10-27T17:40:00.000Z") }],
            },
          ]}
          onApprove={() => {}}
          onSendBack={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentInbox
            tasks={[{ id: "a", title: "مهمة طويلة", summary: token, agent: "عامل", status: "failed", startedAt: 0 }]}
            onRetry={() => {}}
          />
        </div>
      </StressCase>
      <StressCase label="Diez tareas">
        <AgentInbox
          tasks={Array.from({ length: 10 }, (_, index) => ({
            id: `t${index}`,
            title: index === 0 ? "" : `Pedido ${index}`,
            summary: "Detalle",
            agent: "Bruma",
            status: "running" as const,
            startedAt: 0,
          }))}
        />
      </StressCase>
    </main>
  )
}
