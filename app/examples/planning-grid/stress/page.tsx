"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PlanningGrid } from "@/registry/ui/planning-grid"

const token = "N".repeat(60)
const periods = [
  { id: "a", label: "A", kind: "actual" as const },
  { id: "b", label: "B", kind: "forecast" as const },
]

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Plan</h1>
      <StressCase label="Vacío"><PlanningGrid /></StressCase>
      <StressCase label="Carga y error"><PlanningGrid loading /><PlanningGrid error={token} rows={[{ id: "g", label: token, weight: 1, prior: 1, plan: 1, locked: [], values: { a: 1, b: 2 } }]} periods={periods} /></StressCase>
      <StressCase label="320px" width={320}>
        <PlanningGrid rows={[{ id: "g", label: token, weight: 1, prior: 10, plan: 12, locked: ["b"], values: { a: 4, b: 9 }, children: [{ id: "c", label: "Línea", weight: 1, prior: 10, plan: 12, locked: [], values: { a: 4, b: 9 } }] }]} periods={periods} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl"><PlanningGrid rows={[{ id: "g", label: "مجموعة", weight: 1, prior: 1, plan: 2, locked: [], values: { a: 1, b: 2 } }]} periods={periods} labels={{ title: "خطة" }} /></div>
      </StressCase>
      <StressCase label="Diez grupos">
        <PlanningGrid
          periods={periods}
          rows={Array.from({ length: 10 }, (_, index) => ({ id: `g${index}`, label: `Grupo ${index}`, weight: 1, prior: index, plan: index + 1, locked: [], values: { a: index, b: index + 2 } }))}
        />
      </StressCase>
    </main>
  )
}
