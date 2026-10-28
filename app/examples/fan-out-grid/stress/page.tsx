"use client"

import { StressCase } from "@/app/examples/stress-case"
import { FanOutGrid } from "@/registry/ui/fan-out-grid"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Abanico de trabajo</h1>
      <StressCase label="Vacío">
        <FanOutGrid />
      </StressCase>
      <StressCase label="Carga y error">
        <FanOutGrid loading />
        <FanOutGrid error="No pudimos leer las muestras." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <FanOutGrid job={token} cells={[{ id: "a", title: token, detail: token, worker: token, status: "failed" }]} onRetry={() => {}} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <FanOutGrid cells={[{ id: "a", title: "عينة", worker: "عامل", status: "running" }]} />
        </div>
      </StressCase>
      <StressCase label="Diez piezas">
        <FanOutGrid
          cells={Array.from({ length: 10 }, (_, index) => ({
            id: `c${index}`,
            title: index === 0 ? "" : `Pieza ${index}`,
            status: (["waiting", "running", "done", "failed"] as const)[index % 4],
          }))}
        />
      </StressCase>
    </main>
  )
}
