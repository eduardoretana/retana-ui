"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PlanVsActual } from "@/registry/ui/plan-vs-actual"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Plan contra lo real</h1>
      <StressCase label="Vacío">
        <PlanVsActual />
      </StressCase>
      <StressCase label="Carga y error">
        <PlanVsActual loading />
        <PlanVsActual error="No pudimos comparar el plan." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <PlanVsActual steps={[{ id: "largo", title: token, detail: token, plannedMin: 40, actualMin: 90, status: "running" }]} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <PlanVsActual steps={[{ id: "a", title: "خطوة", detail: token, plannedMin: 10, actualMin: 4, status: "done" }]} />
        </div>
      </StressCase>
      <StressCase label="Diez pasos">
        <PlanVsActual
          steps={Array.from({ length: 10 }, (_, index) => ({
            id: `s${index}`,
            title: index === 0 ? "" : `Paso ${index}`,
            plannedMin: 5,
            actualMin: index % 3 === 0 ? 9 : 4,
            status: index > 7 ? ("pending" as const) : ("done" as const),
          }))}
        />
      </StressCase>
    </main>
  )
}
