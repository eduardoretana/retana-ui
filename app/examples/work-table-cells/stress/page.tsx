"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DEMO_NOW } from "@/registry/lib/work-table-demo"
import {
  WorkDueCell,
  WorkEffortCell,
  WorkNumberCell,
  WorkPersonCell,
  WorkPriorityCell,
  WorkRankCell,
  WorkSlaCell,
  WorkStatusCell,
  WorkTitleCell,
} from "@/registry/ui/work-table-cells"

const long = "Revisión".repeat(12)

export default function WorkTableCellsStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Celdas de la tabla de trabajo</h1>
      <StressCase label="Vacío y sin asignar" width={320}>
        <div className="flex flex-col gap-2">
          <WorkTitleCell title="" />
          <WorkPersonCell person={null} />
          <WorkDueCell value={null} now={DEMO_NOW} />
          <WorkSlaCell value={null} now={DEMO_NOW} />
          <WorkEffortCell points={0} />
          <WorkNumberCell value={0} />
          <WorkRankCell rank={0} />
        </div>
      </StressCase>
      <StressCase label="Una palabra, 60 caracteres, emoji y RTL" width={320}>
        <div className="flex flex-col gap-2">
          <WorkTitleCell title="Horno" code="B-1" kind="Nota" />
          <WorkTitleCell title={long} code="B-99" kind="Incidencia" />
          <WorkTitleCell title="🔥 revisión" code="مر" kind="مهمة" />
          <WorkPersonCell person={{ id: "rtl", name: "مرحبا بالجدول", initials: "مر" }} />
          <WorkPriorityCell priority="p0" label="حرج" />
          <WorkStatusCell label="مرحبا" tone="warning" appearance="outline" />
          <WorkNumberCell value={1_250_000} />
          <WorkNumberCell value={12.4} kind="percent" />
          <WorkNumberCell value={240} kind="minutes" />
        </div>
      </StressCase>
      <StressCase label="Diez esfuerzos">
        <div className="flex flex-col gap-1">
          {Array.from({ length: 10 }, (_, index) => (
            <WorkEffortCell key={index} points={index} />
          ))}
        </div>
      </StressCase>
    </main>
  )
}
