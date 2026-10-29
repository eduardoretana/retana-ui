"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ComboChart } from "@/registry/ui/combo-chart"
import { filled } from "../fixtures"

const token = "Dia".repeat(20)

export default function StressPage() {
  const points = filled.points.map((point) => ({ key: point.key, label: point.en, axisLabel: point.axis, bar: point.bar, line: point.line, parts: point.parts.map((part) => ({ id: part.id, label: part.en, value: part.value })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Barras y línea</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><ComboChart title={token} points={points} units={filled.units} /></div></StressCase>
      <StressCase label="Vacío, carga, error y uno"><div className="chart-demo flex flex-col gap-4"><ComboChart title="Vacío" points={[]} /><ComboChart title="Cargando" status="loading" points={points} /><ComboChart title="Error" status="error" points={points} onRetry={() => undefined} /><ComboChart title="Uno" points={points.slice(0, 1)} units={[{ id: "mxn", label: "MXN", currency: "MXN" }]} locale="es-MX" /></div></StressCase>
    </main>
  )
}
