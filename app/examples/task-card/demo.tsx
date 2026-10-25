"use client"

import { useState } from "react"

import { TaskCard } from "@/registry/ui/task-card"
import { isTaskOverdue } from "@/registry/lib/task-board"

import { demoNow, demoPeople, demoStages, demoTasks } from "../task-board/data"

export function TaskCardDemo() {
  const [stageById, setStageById] = useState<Record<string, string>>({})
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground" role="status">
        {open ? `Abierto: ${open}` : "Ninguna tarjeta abierta"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {demoTasks.slice(0, 4).map((task) => {
          const stageId = stageById[task.id] ?? task.stageId
          const current = { ...task, stageId }
          return (
            <TaskCard
              key={task.id}
              task={current}
              people={demoPeople}
              stages={demoStages}
              overdue={isTaskOverdue(current, demoNow, ["hecho"])}
              onOpen={setOpen}
              onMoveTo={(stageIdNext) => setStageById((map) => ({ ...map, [task.id]: stageIdNext }))}
              dragHandleProps={{ "aria-roledescription": "sortable" }}
            />
          )
        })}
      </div>
    </div>
  )
}
