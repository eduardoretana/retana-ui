"use client"

import { StressCase } from "@/app/examples/stress-case"
import { IsoBars } from "@/registry/ui/iso-bars"
import { filled } from "../fixtures"

const token = "Mes".repeat(20)

export default function StressPage() {
  const periods = filled.periods.map((period) => ({ id: period.id, label: period.en, points: period.points.map((point) => ({ key: point.key, label: point.en, value: point.value, axisLabel: point.axis })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Barras isométricas</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><IsoBars title={token} periods={periods} caption={token} /></div></StressCase>
      <StressCase label="Vacío, carga y error"><div className="chart-demo flex flex-col gap-4"><IsoBars title="Vacío" periods={[{ id: "x", label: "None", points: [] }]} /><IsoBars title="Cargando" status="loading" periods={periods} /><IsoBars title="Error" status="error" periods={periods} onRetry={() => undefined} /></div></StressCase>
      <StressCase label="Una barra y negativos"><div className="chart-demo"><IsoBars title="Una" periods={[{ id: "1", label: "1", points: [{ key: "a", label: "🌱", value: -4 }] }]} /></div></StressCase>
    </main>
  )
}
