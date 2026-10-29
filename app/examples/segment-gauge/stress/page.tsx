"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SegmentGauge } from "@/registry/ui/segment-gauge"

const token = "Tramo".repeat(12)

export default function StressPage() {
  const segments = [{ id: "a", label: token, value: 20 }, { id: "b", label: "B", value: 10 }]
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Barra de uso</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><SegmentGauge title={token} segments={segments} limit={100} /></div></StressCase>
      <StressCase label="RTL" width={320}><div className="chart-demo" dir="rtl"><SegmentGauge title="استخدام" segments={[{ id: "a", label: "سرير", value: 4 }]} limit={10} /></div></StressCase>
      <StressCase label="Vacío, carga, error y diez"><div className="chart-demo flex flex-col gap-4"><SegmentGauge title="Vacío" segments={[]} limit={0} /><SegmentGauge title="Cargando" status="loading" segments={segments} limit={100} /><SegmentGauge title="Error" status="error" segments={segments} limit={100} onRetry={() => undefined} /><SegmentGauge title="Diez" limit={100} segments={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: "Fila " + (index + 1), value: 3 }))} /></div></StressCase>
    </main>
  )
}
