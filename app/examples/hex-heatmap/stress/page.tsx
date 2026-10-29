"use client"

import { StressCase } from "@/app/examples/stress-case"
import { HexHeatmap } from "@/registry/ui/hex-heatmap"
import { filled } from "../fixtures"

const token = "Cama".repeat(15)

export default function StressPage() {
  const series = filled.series.map((item) => ({ id: item.id, label: item.en, value: item.value }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Mapa hexagonal</h1>
      <StressCase label="320px" width={320}>
        <div className="chart-demo"><HexHeatmap title={token} description="Una frase corta." series={series} cells={filled.cells.slice(0, 7)} rows={[{ id: "a", label: token, value: 12 }]} /></div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div className="chart-demo" dir="rtl"><HexHeatmap title="رطوبة" series={[{ id: "sun", label: "شمس", value: 4 }]} cells={[{ id: "c", q: 0, r: 0, seriesId: "sun" }]} locale="ar" /></div>
      </StressCase>
      <StressCase label="Vacío, carga y error">
        <div className="chart-demo flex flex-col gap-4">
          <HexHeatmap title="Vacío" series={[]} cells={[]} />
          <HexHeatmap title="Cargando" status="loading" series={series} cells={filled.cells} />
          <HexHeatmap title="Error" status="error" series={series} cells={filled.cells} onRetry={() => undefined} />
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="chart-demo w-[960px] max-w-none"><HexHeatmap title="Diez veces" series={series} cells={filled.cells} /></div>
      </StressCase>
    </main>
  )
}
