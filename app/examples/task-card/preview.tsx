"use client"

import { TaskCard } from "@/registry/ui/task-card"
import { isTaskOverdue } from "@/registry/lib/task-board"

import { demoNow, demoPeople, demoStages, demoTasks } from "../task-board/data"

export default function Preview() {
  const task = demoTasks[0]!
  return (
    <div className="grid h-full content-center bg-background p-4">
      <TaskCard
        task={task}
        people={demoPeople}
        stages={demoStages}
        overdue={isTaskOverdue(task, demoNow, ["hecho"])}
      />
    </div>
  )
}
