"use client"

import { DEMO_NOW, demoPeople } from "@/registry/lib/work-table-demo"
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

export function CellsDemo() {
  return (
    <div className="flex flex-col gap-3">
      <WorkTitleCell title="Revisar el horno" code="B-12" kind="Tarea" />
      <WorkPersonCell person={demoPeople[0]} />
      <WorkPersonCell person={null} />
      <div className="flex flex-wrap gap-2">
        <WorkPriorityCell priority="p0" />
        <WorkPriorityCell priority="p1" />
        <WorkPriorityCell priority="p2" />
        <WorkPriorityCell priority="p3" />
      </div>
      <WorkDueCell value="2026-10-14T15:00:00.000Z" now={DEMO_NOW} />
      <WorkDueCell value="2026-10-16T15:00:00.000Z" now={DEMO_NOW} />
      <div className="flex flex-wrap gap-2">
        <WorkStatusCell label="Por hacer" tone="neutral" appearance="text" />
        <WorkStatusCell label="En curso" tone="info" appearance="soft" />
        <WorkStatusCell label="Hecho" tone="positive" appearance="outline" />
      </div>
      <WorkSlaCell value="2026-10-15T12:00:00.000Z" now={DEMO_NOW} />
      <WorkSlaCell value="2026-10-15T17:00:00.000Z" now={DEMO_NOW} />
      <WorkEffortCell points={5} />
      <div className="flex gap-4">
        <WorkNumberCell value={6300} />
        <WorkNumberCell value={62} kind="percent" />
        <WorkNumberCell value={18} kind="minutes" />
        <WorkRankCell rank={1} />
      </div>
    </div>
  )
}

export default function WorkTableCellsPreview() {
  return (
    <div className="bg-background p-4">
      <CellsDemo />
    </div>
  )
}
