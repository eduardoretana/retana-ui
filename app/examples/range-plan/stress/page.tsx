"use client"

import { StressCase } from "@/app/examples/stress-case"
import { RangePlan } from "@/registry/ui/range-plan"

const token = "Plan".repeat(15)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Plan con control</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><RangePlan title={token} description="Una frase, otra frase, y una más." min={0} max={40} defaultValue={12} suffix="h" actions={[{ id: "a", label: token, variant: "outline" }, { id: "b", label: "OK" }]} /></div></StressCase>
      <StressCase label="Vacío, carga y error"><div className="chart-demo flex flex-col gap-4"><RangePlan title="Vacío" min={0} max={0} /><RangePlan title="Cargando" status="loading" max={10} defaultValue={2} /><RangePlan title="Error" status="error" max={10} onRetry={() => undefined} /></div></StressCase>
      <StressCase label="RTL y negativo" width={320}><div className="chart-demo" dir="rtl"><RangePlan title="خطة" min={-5} max={5} defaultValue={-2} /></div></StressCase>
    </main>
  )
}
