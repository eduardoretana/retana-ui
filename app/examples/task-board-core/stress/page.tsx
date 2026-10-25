"use client"

import {
  formatFileSize,
  formatTaskDate,
  formatTaskPosition,
  fromDateTimeLocal,
  isTaskOverdue,
  taskMatchesQuery,
} from "@/registry/lib/task-board"
import type { TaskRecord } from "@/registry/lib/task-board"

const token = "Q".repeat(60)

const task: TaskRecord = {
  id: "x",
  title: token,
  description: "🙂",
  stageId: "open",
  priority: "low",
  assigneeIds: [],
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Núcleo</h1>
      <ul className="grid gap-2 text-sm break-all">
        <li>Vacío: “{formatTaskDate("", "es")}”</li>
        <li>Fecha inválida: “{formatTaskDate("no-es-fecha", "es")}”</li>
        <li>Posición 0: {formatTaskPosition(0, 0, "de")}</li>
        <li>Posición ancha: {formatTaskPosition(8, 1000, "de")}</li>
        <li>Tamaño: {formatFileSize(0)} / {formatFileSize(240_000)}</li>
        <li>Local vacío: {fromDateTimeLocal("") ?? "sin fecha"}</li>
        <li>Vencido sin fecha: {isTaskOverdue(task, "2026-10-24T00:00:00.000Z") ? "sí" : "no"}</li>
        <li>Búsqueda vacía: {taskMatchesQuery(task, "   ") ? "coincide" : "no"}</li>
        <li dir="rtl">{token}</li>
      </ul>
      <div className="w-80 max-w-full text-sm break-all">{token}</div>
    </main>
  )
}
