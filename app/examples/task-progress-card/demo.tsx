"use client"

import { aeTasks } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { TaskProgressCard } from "@/registry/blocks/ae/task-progress-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <TaskProgressCard tasks={aeTasks} />
      </AeStagger>
    </div>
  )
}
