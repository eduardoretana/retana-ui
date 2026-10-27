"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ConflictRadar } from "@/registry/ui/conflict-radar"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Donde se cruzan</h1>
      <StressCase label="Vacío">
        <ConflictRadar />
      </StressCase>
      <StressCase label="Carga y error">
        <ConflictRadar loading />
        <ConflictRadar error="No pudimos leer los cruces." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ConflictRadar
          agents={[{ id: "a", name: token, detail: token, working: true }]}
          clashes={[{ id: "c", topic: token, left: { agentId: "a", text: token }, right: { agentId: "b", text: token } }]}
          onKeep={() => {}}
          onFile={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ConflictRadar
            agents={[{ id: "a", name: "عامل", working: true }]}
            clashes={[{ id: "c", topic: "سعر", left: { agentId: "a", text: "١٨٬٤٠٠" }, right: { agentId: "b", text: "١٦٬٢٠٠" }, kept: "left" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez cruces">
        <ConflictRadar
          clashes={Array.from({ length: 10 }, (_, index) => ({
            id: `c${index}`,
            topic: index === 0 ? "" : `Cruce ${index}`,
            left: { agentId: "a", text: index === 0 ? "" : `Izquierda ${index}` },
            right: { agentId: "b", text: `Derecha ${index}` },
            kept: index % 2 === 0 ? ("left" as const) : null,
          }))}
        />
      </StressCase>
    </main>
  )
}
