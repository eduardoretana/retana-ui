"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentSteering } from "@/registry/ui/agent-steering"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Dirección en vivo</h1>
      <StressCase label="Vacío, carga y error">
        <AgentSteering title="" agent="" />
        <AgentSteering title="Plan" loading />
        <AgentSteering title="Plan" error="No pudimos leer el plan." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentSteering
          title={token}
          agent={token}
          status="paused"
          steps={[{ id: "a", title: token, status: "active", notes: [{ id: "n", text: token }] }]}
          queue={[{ id: "q", text: token }]}
          onPause={() => {}}
          onResume={() => {}}
          onQueue={() => {}}
          onInterrupt={() => {}}
          onRemove={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentSteering title="توجيه" agent="عامل" steps={[{ id: "a", title: "خطوة", status: "active" }]} onQueue={() => {}} />
        </div>
      </StressCase>
      <StressCase label="Diez pasos">
        <AgentSteering
          title="Turno"
          steps={Array.from({ length: 10 }, (_, index) => ({
            id: `s${index}`,
            title: index === 0 ? "" : `Paso ${index}`,
            status: index === 3 ? ("active" as const) : index < 3 ? ("done" as const) : ("pending" as const),
          }))}
        />
      </StressCase>
    </main>
  )
}
