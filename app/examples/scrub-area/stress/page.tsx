"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ScrubArea } from "@/registry/ui/scrub-area"
import { filled } from "../fixtures"

const token = "Mes".repeat(20)

export default function StressPage() {
  const periods = filled.periods.map((period) => ({ id: period.id, label: period.en, points: period.points.map((point) => ({ key: point.key, label: point.en, axisLabel: point.axis, value: point.value })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Área con cursor</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><ScrubArea title={token} periods={periods} /></div></StressCase>
      <StressCase label="Vacío, carga, error y uno"><div className="chart-demo flex flex-col gap-4"><ScrubArea title="Vacío" periods={[{ id: "y", label: "Año", points: [] }]} /><ScrubArea title="Cargando" status="loading" periods={periods} /><ScrubArea title="Error" status="error" periods={periods} onRetry={() => undefined} /><ScrubArea title="Uno" periods={[{ id: "y", label: "Año", points: periods[0]!.points.slice(0, 1) }]} /></div></StressCase>
    </main>
  )
}
