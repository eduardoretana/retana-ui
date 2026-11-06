"use client"

import { StressCase } from "@/app/examples/stress-case"
import { importWorkflow } from "@/registry/lib/workflow-builder"
import { WorkflowBuilder } from "@/registry/ui/workflow-builder"
import { emptyGraph, filledGraph, invalidGraph, longName, workflowNodeTypes } from "../fixtures"

const types = workflowNodeTypes("es")
const corrupt = importWorkflow("{ esto no es json", { registry: types })
const many = {
  nodes: Array.from({ length: 200 }, (_, index) => ({
    id: `n${index}`,
    type: "ai-agent",
    position: { x: (index % 20) * 40, y: Math.floor(index / 20) * 36 },
    config: index === 0 ? {} : { task: "classify" },
    displayName: index === 3 ? longName : `Nodo ${index}`,
  })),
  edges: Array.from({ length: 199 }, (_, index) => ({ id: `e${index}`, source: `n${index}`, sourcePort: "out", target: `n${index + 1}`, targetPort: "in" })),
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Constructor de flujos</h1>
      <StressCase label="Vacío"><WorkflowBuilder nodeTypes={types} graph={emptyGraph} className="h-80" /></StressCase>
      <StressCase label="Carga y error">
        <WorkflowBuilder nodeTypes={types} loading className="h-48" />
        <WorkflowBuilder nodeTypes={types} error="No se pudo leer el flujo de ejemplo." className="h-48" />
      </StressCase>
      <StressCase label="390 px" width={390}>
        <WorkflowBuilder nodeTypes={types} graph={filledGraph} compact className="h-[36rem] w-[390px]" selection={{ nodeIds: ["respuesta"], edgeIds: [] }} />
      </StressCase>
      <StressCase label="Grafo inválido y JSON corrupto">
        <WorkflowBuilder nodeTypes={types} graph={invalidGraph} className="h-80" />
        <pre className="text-sm text-destructive">{corrupt.ok ? "" : corrupt.errors.join("\n")}</pre>
      </StressCase>
      <StressCase label="200 nodos"><WorkflowBuilder nodeTypes={types} graph={many} className="h-80" /></StressCase>
    </main>
  )
}
