"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentFixTimeline, agentFixTimelineLabelsEs, type FixStep } from "@/registry/ui/agent-fix-timeline"

const long = "Z".repeat(60)

const many: FixStep[] = Array.from({ length: 20 }, (_, index) => ({
  id: `s-${index}`,
  kind: "edit" as const,
  label: index === 0 ? long : `Paso ${index}`,
  status: "done" as const,
  files: index === 1 ? [{ path: long }] : undefined,
}))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Línea de tiempo del arreglo</h1>
      <StressCase label="390 px y texto largo" width={390}>
        <AgentFixTimeline steps={many} labels={agentFixTimelineLabelsEs} />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <AgentFixTimeline steps={[]} labels={agentFixTimelineLabelsEs} />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <AgentFixTimeline
            labels={agentFixTimelineLabelsEs}
            steps={[{ id: "rtl", kind: "thought", label: "التشخيص طويل جداً", status: "active", files: [{ path: "فرن.ts" }] }]}
          />
        </div>
      </StressCase>
    </main>
  )
}
