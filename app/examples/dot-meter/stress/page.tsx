"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DotMeter } from "@/registry/ui/dot-meter"

const token = "Punto".repeat(12)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Matriz de puntos</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><DotMeter title={token} value={18} limit={40} cells={40} /></div></StressCase>
      <StressCase label="0, 1 y muchos"><div className="chart-demo flex flex-col gap-4"><DotMeter title="Vacío" value={0} limit={0} /><DotMeter title="Uno" value={1} limit={1} cells={1} /><DotMeter title="Muchos" value={80} limit={100} cells={100} /></div></StressCase>
      <StressCase label="Carga, error y RTL"><div className="chart-demo flex flex-col gap-4"><DotMeter title="Cargando" status="loading" value={1} limit={2} /><DotMeter title="Error" status="error" value={1} limit={2} onRetry={() => undefined} /><div dir="rtl"><DotMeter title="نقاط" value={3} limit={8} cells={8} /></div></div></StressCase>
    </main>
  )
}
