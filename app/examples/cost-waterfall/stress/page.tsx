"use client"

import { StressCase } from "@/app/examples/stress-case"
import { reduceRunEvents, type RunEvent, type RunStep } from "@/registry/lib/cost-waterfall"
import { CostWaterfall, costWaterfallLabelsEs } from "@/registry/ui/cost-waterfall"

import { examplePricing, filledRun } from "../example-data"

const token = "N".repeat(60)

function stressSteps(): RunStep[] {
  const steps: RunStep[] = []
  for (let index = 0; index < 300; index += 1) {
    const depth = index % 8
    const step: RunStep = {
      id: `n${index}`,
      name: index === 3 ? token : index === 7 ? "خطوة مثال" : `Paso ${index}`,
      kind: index % 5 === 0 ? "save" : index % 2 === 0 ? "llm" : "tool",
      tokensIn: index,
      tokensOut: index % 3,
      cacheRead: index % 4 === 0 ? 80 : 0,
      cacheWrite: index % 9 === 0 ? 10 : 0,
      status: index === 11 ? "error" : index === 12 ? "skipped" : "success",
      latencyMs: index === 0 ? 0 : index * 15,
      input: index === 7 ? token : "entrada de ejemplo",
      output: "salida de ejemplo",
    }
    if (depth > 0) step.parentId = `n${index - 1}`
    if (index % 2 === 0) step.model = index % 4 === 0 ? "ejemplo-amplio" : "ejemplo-rapido"
    else step.destination = "ejemplo-archivo"
    if (index === 0) step.costMicro = 0n
    if (index === 20) step.costMicro = 10n ** 18n
    if (index === 11) step.error = "El paso de ejemplo no pudo guardar."
    steps.push(step)
  }
  return steps
}

function disorderedCount() {
  const events: RunEvent[] = stressSteps().flatMap((step, index) => {
    const started: RunEvent = {
      type: "step.started",
      at: index,
      stepId: step.id,
      name: step.name,
      kind: step.kind,
    }
    if (step.parentId) started.parentId = step.parentId
    if (step.model) started.model = step.model
    if (step.destination) started.destination = step.destination
    const completed: RunEvent = { type: "step.completed", at: 1_000 + index, stepId: step.id, tokensIn: step.tokensIn, output: step.output }
    if (step.costMicro !== undefined) completed.costMicro = step.costMicro
    return [completed, started]
  })
  events.reverse()
  return reduceRunEvents({ id: "stress", title: "Eventos desordenados", status: "queued", steps: [] }, events).steps.length
}

export default function StressPage() {
  const count = disorderedCount()
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Costo de la corrida</h1>
      <p className="text-sm text-muted-foreground">Usa las flechas dentro de la cuadrícula. El toque expande la fila.</p>
      <StressCase label="Vacío">
        <CostWaterfall labels={costWaterfallLabelsEs} pricing={examplePricing} />
      </StressCase>
      <StressCase label="Carga y error">
        <CostWaterfall loading labels={costWaterfallLabelsEs} />
        <CostWaterfall error="No se pudo leer el costo. Vuelve a pedir la corrida." onRetry={() => undefined} labels={costWaterfallLabelsEs} />
      </StressCase>
      <StressCase label="390px" width={390}>
        <CostWaterfall run={filledRun("es")} pricing={examplePricing} labels={costWaterfallLabelsEs} money={{ locale: "es-MX", currency: "USD" }} defaultWaterfallOpen={false} />
      </StressCase>
      <StressCase label="Nombre largo, RTL, costo 0 y costo enorme" width={390}>
        <div dir="rtl">
          <CostWaterfall
            labels={costWaterfallLabelsEs}
            pricing={examplePricing}
            run={{
              id: "rtl",
              title: "مثال",
              status: "done",
              steps: [
                { id: "a", name: token, kind: "llm", model: token, tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheWrite: 0, costMicro: 0n, status: "success", input: token },
                { id: "b", parentId: "a", name: "خطوة", kind: "tool", destination: "ejemplo-archivo", tokensIn: 3, tokensOut: 1, cacheRead: 0, cacheWrite: 0, costMicro: 10n ** 18n, status: "error", error: token },
              ],
            }}
          />
        </div>
      </StressCase>
      <StressCase label="300 pasos, 8 niveles, eventos desordenados">
        <p className="text-xs text-muted-foreground">{count} pasos tras eventos invertidos.</p>
        <CostWaterfall run={{ id: "stress", title: "Ejemplo de estrés", status: "error", steps: stressSteps(), closedAt: 1 }} pricing={examplePricing} labels={costWaterfallLabelsEs} maxHeight={420} defaultCollapsed={["n1"]} />
      </StressCase>
    </main>
  )
}
