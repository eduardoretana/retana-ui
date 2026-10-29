"use client"

import { StressCase } from "@/app/examples/stress-case"
import { FlowSankey } from "@/registry/ui/flow-sankey"
import { filled } from "../fixtures"

const token = "Nodo".repeat(15)

export default function StressPage() {
  const nodes = filled.nodes.map((node) => ({ id: node.id, label: node.en, column: node.column }))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Flujo</h1>
      <StressCase label="320px" width={320}><div className="chart-demo"><FlowSankey title={token} nodes={nodes} links={filled.links} /></div></StressCase>
      <StressCase label="RTL" width={320}><div className="chart-demo" dir="rtl"><FlowSankey title="تدفق" nodes={[{ id: "a", label: "منبع", column: 0 }, { id: "b", label: "مقصد", column: 1 }]} links={[{ id: "l", source: "a", target: "b", value: 3 }]} /></div></StressCase>
      <StressCase label="Vacío, carga y error"><div className="chart-demo flex flex-col gap-4"><FlowSankey title="Vacío" nodes={[]} links={[]} /><FlowSankey title="Cargando" status="loading" nodes={nodes} links={filled.links} /><FlowSankey title="Error" status="error" nodes={nodes} links={filled.links} onRetry={() => undefined} /></div></StressCase>
      <StressCase label="Ancho"><div className="chart-demo w-[960px]"><FlowSankey title="Ancho" nodes={nodes} links={filled.links} /></div></StressCase>
    </main>
  )
}
