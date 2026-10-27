"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentPlan } from "@/registry/ui/agent-plan"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Plan del agente</h1>
      <StressCase label="Vacío">
        <AgentPlan />
      </StressCase>
      <StressCase label="Carga y error">
        <AgentPlan loading />
        <AgentPlan error="No pudimos leer el plan." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentPlan
          goal={token}
          steps={[{ id: "largo", title: token, detail: token, estimateMin: 999, elapsedMin: 40, status: "running" }]}
          onRename={() => {}}
          onMove={() => {}}
          onRemove={() => {}}
          onAdd={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentPlan steps={[{ id: "a", title: "خطوة طويلة", detail: token, estimateMin: 12, status: "failed" }]} onRetry={() => {}} onRemove={() => {}} />
        </div>
      </StressCase>
      <StressCase label="Diez pasos">
        <AgentPlan
          steps={Array.from({ length: 10 }, (_, index) => ({
            id: `p${index}`,
            title: index === 0 ? "" : `Paso ${index}`,
            estimateMin: index + 1,
            status: "pending" as const,
          }))}
          onMove={() => {}}
          onRemove={() => {}}
        />
      </StressCase>
    </main>
  )
}
