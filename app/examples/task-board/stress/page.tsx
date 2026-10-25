"use client"

import { TaskBoard } from "@/registry/blocks/task-board"
import type { TaskRecord } from "@/registry/lib/task-board"

import { demoCategories, demoNow, demoPeople, demoStages, demoTasks, manyDemoTasks } from "../data"

const token = "X".repeat(60)
const rtlTitle = "مهمة تجريبية للأرشيف"

const shared = {
  stages: demoStages,
  categories: demoCategories,
  people: demoPeople,
  now: demoNow,
  locale: "es",
  doneStageIds: ["hecho"],
}

function one(overrides: Partial<TaskRecord> & Pick<TaskRecord, "id" | "title">): TaskRecord {
  return {
    stageId: "por-hacer",
    priority: "medium",
    assigneeIds: ["ana"],
    description: "Texto de demostración.",
    subtasks: [],
    comments: [],
    ...overrides,
  }
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tablero de encargos</h1>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-80 max-w-full">
          <TaskBoard {...shared} tasks={[]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <div className="h-80">
          <TaskBoard {...shared} tasks={demoTasks} loading className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <div className="h-64">
          <TaskBoard {...shared} tasks={[]} error="Fallo de demostración." onRetry={() => undefined} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Una sola tarjeta</h2>
        <div className="h-80">
          <TaskBoard {...shared} tasks={[one({ id: "solo", title: "Una" })]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token largo, emoji y números</h2>
        <div className="h-[36rem]">
          <TaskBoard
            {...shared}
            className="h-full"
            tasks={[
              one({ id: "token", title: token, description: token, priority: "critical" }),
              one({ id: "emoji", title: "📦 Inventario", description: "🙂 🙂 🙂", priority: "low" }),
              one({
                id: "nums",
                title: "1.250,00 piezas",
                description: "100000200000300000",
                assigneeIds: ["ana", "leo", "noa", "iris"],
              }),
            ]}
          />
        </div>
      </section>

      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <div className="h-80">
          <TaskBoard {...shared} tasks={[one({ id: "rtl", title: rtlTitle, description: rtlTitle })]} className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Muchos encargos y solo lectura</h2>
        <div className="h-[36rem]">
          <TaskBoard {...shared} tasks={manyDemoTasks(40)} readOnly className="h-full" />
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Contenedor ancho, apretado por un hermano</h2>
        <div className="flex gap-3">
          <div className="h-80 w-40 shrink-0 rounded-lg border border-border" />
          <div className="h-80 min-w-0 flex-1">
            <TaskBoard {...shared} tasks={demoTasks.slice(0, 2)} className="h-full" />
          </div>
        </div>
      </section>
    </main>
  )
}
