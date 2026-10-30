"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CoupledLines } from "@/registry/ui/coupled-lines"
import { filled } from "../fixtures"

const token = "Serie".repeat(12)

export default function StressPage() {
  const categories = filled.categories.map((item) => ({ key: item.key, label: item.en, axisLabel: item.axis }))
  const series = filled.series.map((item) => ({ id: item.id, label: item.en, points: categories.map((category, index) => ({ key: category.key, value: item.values[index] ?? 0 })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Líneas acopladas</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><CoupledLines title={token} categories={categories} series={series} /></div></StressCase>
      <StressCase label="Vacío, carga, error y una"><div className="chart-demo flex flex-col gap-4"><CoupledLines title="Vacío" categories={[]} series={[]} /><CoupledLines title="Cargando" status="loading" categories={categories} series={series} /><CoupledLines title="Error" status="error" categories={categories} series={series} onRetry={() => undefined} /><CoupledLines title="Una" categories={categories.slice(0, 2)} series={series.slice(0, 1)} /></div></StressCase>
    </main>
  )
}
