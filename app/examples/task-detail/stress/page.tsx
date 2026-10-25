"use client"

import { TaskDetail } from "@/registry/ui/task-detail"
import type { TaskRecord } from "@/registry/lib/task-board"

import { demoCategories, demoPeople, demoStages } from "../../task-board/data"

const token = "Z".repeat(60)

function panel(task: TaskRecord, label: string, readOnly = false) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="h-[32rem] w-full min-w-0 max-w-80 overflow-hidden rounded-xl border border-border">
        <TaskDetail
          task={task}
          people={demoPeople}
          stages={demoStages}
          categories={demoCategories}
          readOnly={readOnly}
          position={1}
          total={1}
        />
      </div>
    </section>
  )
}

const base: TaskRecord = {
  id: "base",
  title: "Una",
  stageId: "por-hacer",
  priority: "low",
  assigneeIds: [],
  description: "",
  subtasks: [],
  comments: [],
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Detalle</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {panel(base, "Vacío")}
        {panel(
          {
            ...base,
            id: "token",
            title: token,
            description: token,
            priority: "critical",
            assigneeIds: ["ana", "leo", "noa", "iris"],
            comments: Array.from({ length: 8 }, (_, index) => ({
              id: `c-${index}`,
              authorId: "ana",
              body: index === 3 ? token : "Comentario de demostración.",
              createdAt: "2026-10-24T15:00:00.000Z",
              parentId: index % 2 === 1 ? "c-0" : null,
            })),
          },
          "Token, muchos comentarios",
        )}
        {panel({ ...base, id: "emoji", title: "📦", description: "🙂" }, "Emoji", true)}
      </div>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Derecha a izquierda</h2>
        <div className="h-[28rem] w-full min-w-0 max-w-md overflow-hidden rounded-xl border border-border">
          <TaskDetail
            task={{ ...base, id: "rtl", title: "مهمة", description: "وصف تجريبي" }}
            people={demoPeople}
            stages={demoStages}
            position={2}
            total={10}
          />
        </div>
      </section>
    </main>
  )
}
