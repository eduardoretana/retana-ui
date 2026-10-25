"use client"

import { formatTaskPosition, isTaskOverdue } from "@/registry/lib/task-board"

export default function Preview() {
  const overdue = isTaskOverdue(
    { dueAt: "2026-10-01T00:00:00.000Z", stageId: "open" },
    "2026-10-24T00:00:00.000Z",
    [],
  )
  return (
    <div className="grid h-full content-center gap-1 bg-background p-3 text-sm">
      <p className="tabular-nums">{formatTaskPosition(1, 100, "de")}</p>
      <p>{overdue ? "Vencido" : "A tiempo"}</p>
    </div>
  )
}
