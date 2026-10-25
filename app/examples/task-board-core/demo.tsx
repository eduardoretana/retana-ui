"use client"

import {
  countTasksByPriority,
  formatTaskDate,
  formatTaskPosition,
  isTaskOverdue,
  taskMatchesQuery,
  threadComments,
} from "@/registry/lib/task-board"

import { demoNow, demoPeople, demoStages, demoTasks } from "../task-board/data"

const kiln = demoTasks[0]!
const closed = demoTasks.find((task) => task.id === "inventario")!

export function TaskBoardCoreDemo() {
  const counts = countTasksByPriority(demoTasks)
  const threads = threadComments(kiln.comments)
  return (
    <dl className="grid max-w-xl gap-3 text-sm">
      <div>
        <dt className="text-muted-foreground">Posición</dt>
        <dd className="tabular-nums">{formatTaskPosition(1, 100, "de")}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Fecha</dt>
        <dd>{formatTaskDate(kiln.dueAt, "es")}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Vencido y cerrado</dt>
        <dd>
          {isTaskOverdue(kiln, demoNow, ["hecho"]) ? "El horno está vencido" : "El horno no está vencido"}.{" "}
          {isTaskOverdue(closed, demoNow, ["hecho"]) ? "El inventario está vencido" : "El inventario cerrado no vence"}.
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Prioridades</dt>
        <dd className="tabular-nums">
          {counts.low} baja · {counts.medium} media · {counts.high} alta · {counts.critical} crítica
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Búsqueda</dt>
        <dd>{taskMatchesQuery(kiln, "esmaltes", { people: demoPeople, stages: demoStages }) ? "Coincide" : "No coincide"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Hilo</dt>
        <dd>
          {threads.length} comentario con {threads[0]?.replies.length ?? 0} respuesta
        </dd>
      </div>
    </dl>
  )
}
