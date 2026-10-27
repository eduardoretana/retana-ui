"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentQueue } from "@/registry/ui/agent-queue"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cola de agentes</h1>
      <StressCase label="Vacío">
        <AgentQueue />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentQueue loading />
        <AgentQueue error="No pudimos leer la cola." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentQueue
          paused
          jobs={[{ id: "largo", title: token, detail: token, lane: "queued", waitedMs: 9 * 60 * 60000 }]}
          workers={[{ id: "bruma", name: token, slots: 1 }]}
          depth={[1, 8, 3, 12]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentQueue
            jobs={[
              { id: "a", title: "مهمة طويلة جداً", detail: token, lane: "running", workerId: "b", progress: 0.4 },
              { id: "c", title: "واحدة", lane: "failed" },
            ]}
            workers={[{ id: "b", name: "عامل", slots: 2 }]}
            onRetry={() => {}}
            onMoveUp={() => {}}
          />
        </div>
      </StressCase>
      <StressCase label="Diez en espera">
        <AgentQueue
          jobs={Array.from({ length: 10 }, (_, index) => ({
            id: `j${index}`,
            title: index === 0 ? "" : `Pedido ${index}`,
            lane: "queued" as const,
            waitedMs: index * 60000,
          }))}
          workers={[{ id: "bruma", name: "Bruma", slots: 1 }]}
          onMoveUp={() => {}}
        />
      </StressCase>
    </main>
  )
}
