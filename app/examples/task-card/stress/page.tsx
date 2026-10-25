"use client"

import { TaskCard } from "@/registry/ui/task-card"
import type { TaskRecord } from "@/registry/lib/task-board"

import { demoPeople, demoStages } from "../../task-board/data"

const token = "Y".repeat(60)

function card(task: TaskRecord, width: string) {
  return (
    <div className={width}>
      <TaskCard task={task} people={demoPeople} stages={demoStages} overdue />
    </div>
  )
}

const base: TaskRecord = {
  id: "base",
  title: "Una",
  stageId: "por-hacer",
  priority: "low",
  assigneeIds: [],
  subtasks: [],
  comments: [],
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío, una palabra, frases y token</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {card({ ...base, id: "empty", title: "" }, "max-w-xs")}
          {card({ ...base, id: "word", title: "Horno" }, "max-w-xs")}
          {card(
            {
              ...base,
              id: "long",
              title: "Preparar el horno, avisar al grupo y dejar las placas listas para el sábado.",
              description: "Varias frases.",
              assigneeIds: ["ana", "leo", "noa", "iris"],
              subtasks: [{ id: "s", title: "Medir", statusId: "pendiente" }],
              comments: [{ id: "c", authorId: "ana", body: "Listo", createdAt: "2026-10-01T00:00:00.000Z" }],
            },
            "max-w-xs",
          )}
          {card({ ...base, id: "token", title: token, priority: "critical" }, "w-80 max-w-full")}
        </div>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Emoji, números y derecha a izquierda</h2>
        {card({ ...base, id: "mix", title: "📦 1.250,00 مهمة", assigneeIds: ["ana"] }, "max-w-sm")}
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y fila apretada</h2>
        <div className="flex gap-2">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          {card(base, "w-80 max-w-full min-w-0")}
        </div>
      </section>
    </main>
  )
}
