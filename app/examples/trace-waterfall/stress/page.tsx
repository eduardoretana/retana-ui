"use client"

import { StressCase } from "@/app/examples/stress-case"
import { TraceWaterfall } from "@/registry/ui/trace-waterfall"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Trazo de la corrida</h1>
      <StressCase label="Vacío">
        <TraceWaterfall />
      </StressCase>
      <StressCase label="Carga y error">
        <TraceWaterfall loading />
        <TraceWaterfall error="No pudimos leer el trazo." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <TraceWaterfall
          spans={[{ id: "largo", title: token, agent: token, kind: "note", startMs: 0, durationMs: 4000, tokens: 99999, costCents: 123456, status: "slow" }]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <TraceWaterfall spans={[{ id: "a", parentId: "root", title: "خطوة", agent: "عامل", kind: "tool", startMs: 100, durationMs: 400, status: "error" }, { id: "root", title: "جذر", agent: "عامل", kind: "run", startMs: 0, durationMs: 800, status: "ok" }]} />
        </div>
      </StressCase>
      <StressCase label="Diez tramos">
        <TraceWaterfall
          spans={Array.from({ length: 10 }, (_, index) => ({
            id: `s${index}`,
            parentId: index === 0 ? undefined : "s0",
            title: index === 0 ? "" : `Tramo ${index}`,
            agent: "Bruma",
            kind: "note" as const,
            startMs: index * 300,
            durationMs: 200,
            status: "ok" as const,
          }))}
        />
      </StressCase>
    </main>
  )
}
