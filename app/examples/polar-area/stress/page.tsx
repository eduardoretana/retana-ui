"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PolarArea } from "@/registry/ui/polar-area"
import { filled } from "../fixtures"

const token = "Cama".repeat(15)

export default function StressPage() {
  const series = filled.series.map((item) => ({ id: item.id, label: item.en, value: item.value, wedges: item.wedges.map((wedge) => ({ id: wedge.id, label: wedge.en, value: wedge.value })) }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Área polar</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><PolarArea title={token} series={series} /></div></StressCase>
      <StressCase label="Vacío, carga, error y una"><div className="chart-demo flex flex-col gap-4"><PolarArea title="Vacío" series={[]} /><PolarArea title="Cargando" status="loading" series={series} /><PolarArea title="Error" status="error" series={series} onRetry={() => undefined} /><PolarArea title="Una" series={series.slice(0, 1)} /></div></StressCase>
    </main>
  )
}
