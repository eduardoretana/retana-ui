"use client"

import { TaskList } from "@/registry/ui/task-list"

export default function TaskListPreview() {
  return (
    <div className="h-full bg-background p-3">
      <TaskList
        title="Tareas"
        progressLabel="Progreso"
        tasks={[
          { id: "1", title: "Leer el anexo", done: true },
          { id: "2", title: "Marcar plazos", done: true },
          { id: "3", title: "Avisar a Orilla", done: false },
        ]}
      />
    </div>
  )
}
