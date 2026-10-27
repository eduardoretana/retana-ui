"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DecisionTree } from "@/registry/ui/decision-tree"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Qué camino</h1>
      <StressCase label="Vacío">
        <DecisionTree />
      </StressCase>
      <StressCase label="Carga y error">
        <DecisionTree loading />
        <DecisionTree error="No pudimos leer las decisiones." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <DecisionTree
          forks={[{ id: "a", prompt: token, detail: token, options: [{ id: "b", title: token, detail: token, risk: "high", preferred: true }] }]}
          onChoose={() => {}}
          onCustom={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <DecisionTree forks={[{ id: "a", prompt: "ماذا نفعل؟", options: [{ id: "b", title: "نؤجل", risk: "low" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Diez opciones">
        <DecisionTree
          forks={[
            {
              id: "a",
              prompt: "Elige",
              options: Array.from({ length: 10 }, (_, index) => ({
                id: `o${index}`,
                title: index === 0 ? "" : `Opción ${index}`,
                risk: index % 2 === 0 ? ("high" as const) : ("low" as const),
                preferred: index === 1,
              })),
            },
          ]}
        />
      </StressCase>
    </main>
  )
}
