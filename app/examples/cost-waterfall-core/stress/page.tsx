"use client"

import { StressCase } from "@/app/examples/stress-case"
import { blendedCostPer1k, rollupRun, runFromWorkflowNodes } from "@/registry/lib/cost-waterfall"

import { examplePricing, filledRun } from "../../cost-waterfall/example-data"

export default function StressPage() {
  const rollup = rollupRun(filledRun("es"), examplePricing)
  const nodes = runFromWorkflowNodes({
    id: "nodo",
    title: "Ejemplo de nodo",
    nodes: [{ nodeId: "a", label: "N".repeat(60), kind: "llm", model: "ejemplo-rapido", tokensIn: 0, tokensOut: 0, replay: true }],
  })
  const per1k = blendedCostPer1k(examplePricing, "ejemplo-rapido", { input: 800, output: 200, cacheRead: 0, cacheWrite: 0 })
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Núcleo de costo</h1>
      <StressCase label="Vacío"><p className="text-sm tabular-nums">{rollupRun({ steps: [] }, examplePricing).totalCost.toString()}</p></StressCase>
      <StressCase label="Costo total de ejemplo" width={320}>
        <p className="text-sm break-all tabular-nums">{rollup.totalCost.toString()} micro</p>
        <p className="text-sm break-all">1K mixto: {per1k.toString()}</p>
        <p className="text-sm break-all">{nodes.steps[0]?.name}</p>
      </StressCase>
    </main>
  )
}
