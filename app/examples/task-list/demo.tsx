"use client"

import { useState } from "react"

import { TaskList, type AgentTask } from "@/registry/ui/task-list"

const seed: AgentTask[] = [
  { id: "read", title: "Leer el contrato de Bruma", detail: "Anexo B incluido", done: true },
  { id: "dates", title: "Confirmar el nuevo plazo", detail: "45 días desde la firma", done: true },
  { id: "mail", title: "Avisar a Estudio Orilla", done: false },
  { id: "file", title: "Archivar la nota en el expediente", done: false },
]

export function Demo() {
  const [tasks, setTasks] = useState(seed)
  return (
    <TaskList
      title="Tareas del agente"
      progressLabel="Progreso"
      tasks={tasks}
      onToggle={(id, done) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, done } : task)))}
    />
  )
}
