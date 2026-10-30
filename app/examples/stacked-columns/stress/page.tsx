"use client"

import { StressCase } from "@/app/examples/stress-case"
import { StackedColumns } from "@/registry/ui/stacked-columns"
import { filled } from "../fixtures"

const token = "Serie".repeat(12)

export default function StressPage() {
  const series = filled.series.map((item) => ({ id: item.id, label: item.en }))
  const periods = filled.periods.map((period) => ({ id: period.id, label: period.en, points: period.points.map((point) => ({ key: point.key, label: point.en, axisLabel: point.axis, values: point.values })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Columnas apiladas</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><StackedColumns title={token} series={series} periods={periods} note={{ title: token, body: "Varias frases sobre la cosecha de la semana." }} /></div></StressCase>
      <StressCase label="Vacío, carga y error"><div className="chart-demo flex flex-col gap-4"><StackedColumns title="Vacío" series={[]} periods={[{ id: "w", label: "Week", points: [] }]} /><StackedColumns title="Cargando" status="loading" series={series} periods={periods} /><StackedColumns title="Error" status="error" series={series} periods={periods} onRetry={() => undefined} /></div></StressCase>
    </main>
  )
}
