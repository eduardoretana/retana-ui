"use client"

import { StressCase } from "@/app/examples/stress-case"
import { RangeLanes } from "@/registry/ui/range-lanes"
import { filled } from "../fixtures"

const token = "Cultivo".repeat(10)

export default function StressPage() {
  const lanes = filled.lanes.map((lane) => ({ id: lane.id, label: lane.en, start: lane.start, end: lane.end }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Rangos horizontales</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><RangeLanes title={token} lanes={[{ ...lanes[0]!, label: token }]} domain={{ min: 1, max: 12 }} /></div></StressCase>
      <StressCase label="Vacío, carga, error y diez"><div className="chart-demo flex flex-col gap-4"><RangeLanes title="Vacío" lanes={[]} /><RangeLanes title="Cargando" status="loading" lanes={lanes} /><RangeLanes title="Error" status="error" lanes={lanes} onRetry={() => undefined} /><RangeLanes title="Diez" lanes={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: index === 0 ? "🌱" : "Fila " + (index + 1), start: 1, end: 2 + (index % 4) }))} /></div></StressCase>
    </main>
  )
}
