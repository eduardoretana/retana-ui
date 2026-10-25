"use client"

import { useRef, useState } from "react"

import { TaskBoard } from "@/registry/blocks/task-board"
import type { TaskCommentInput, TaskPatch, TaskRecord, TaskSubtaskDraft } from "@/registry/lib/task-board"

import {
  demoCategories,
  demoDoneStages,
  demoNow,
  demoPeople,
  demoStages,
  demoSubtaskStatuses,
  demoTasks,
} from "./data"

export type DemoScenario = "ready" | "empty" | "loading" | "error" | "readOnly"

const scenarios: { id: DemoScenario; label: string }[] = [
  { id: "ready", label: "Listo" },
  { id: "empty", label: "Vacío" },
  { id: "loading", label: "Cargando" },
  { id: "error", label: "Error" },
  { id: "readOnly", label: "Solo lectura" },
]

export function TaskBoardDemo({
  chrome = true,
  initialScenario = "ready",
}: {
  chrome?: boolean
  initialScenario?: DemoScenario
}) {
  const [scenario, setScenario] = useState<DemoScenario>(initialScenario)
  const [tasks, setTasks] = useState<TaskRecord[]>(demoTasks)
  const sequence = useRef(0)

  function nextId(prefix: string) {
    sequence.current += 1
    return `${prefix}-${sequence.current}`
  }

  function update(id: string, patch: TaskPatch) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)))
  }

  function move(id: string, toStageId: string) {
    update(id, { stageId: toStageId })
  }

  function addSubtask(id: string, draft: TaskSubtaskDraft) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              subtasks: [
                ...(task.subtasks ?? []),
                {
                  id: nextId("sub"),
                  title: draft.title,
                  description: draft.description,
                  statusId: draft.statusId ?? "pendiente",
                  priority: draft.priority ?? "medium",
                },
              ],
            }
          : task,
      ),
    )
  }

  function setSubtaskStatus(taskId: string, subtaskId: string, statusId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks ?? []).map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, statusId } : subtask,
              ),
            }
          : task,
      ),
    )
  }

  function comment(id: string, input: TaskCommentInput) {
    const createdAt = demoNow
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task
        const attachments = [
          ...(task.attachments ?? []),
          ...(input.files ?? []).map((file) => ({
            id: nextId("file"),
            name: file.name,
            size: file.size,
          })),
        ]
        return {
          ...task,
          attachments,
          comments: [
            ...(task.comments ?? []),
            {
              id: nextId("comment"),
              authorId: "mesa",
              body: input.body,
              createdAt,
              parentId: input.parentId,
            },
          ],
        }
      }),
    )
  }

  function attach(id: string, files: readonly File[]) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              attachments: [
                ...(task.attachments ?? []),
                ...files.map((file) => ({ id: nextId("file"), name: file.name, size: file.size })),
              ],
            }
          : task,
      ),
    )
  }

  function removeAttachment(taskId: string, attachmentId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, attachments: (task.attachments ?? []).filter((file) => file.id !== attachmentId) }
          : task,
      ),
    )
  }

  function create(stageId: string) {
    setTasks((current) => [
      ...current,
      {
        id: nextId("task"),
        title: "Encargo nuevo (demo)",
        description: "",
        stageId,
        priority: "medium",
        categoryId: "taller",
        assigneeIds: ["mesa"],
        dueAt: null,
        subtasks: [],
        comments: [],
      },
    ])
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {chrome ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label="Escenario de demostración">
          {scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={scenario === item.id}
              className="rounded-full border border-border px-3 py-1 text-xs aria-pressed:bg-foreground aria-pressed:text-background"
              onClick={() => setScenario(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <TaskBoard
        className="min-h-0 flex-1"
        tasks={scenario === "empty" ? [] : tasks}
        stages={demoStages}
        categories={demoCategories}
        people={demoPeople}
        subtaskStatuses={demoSubtaskStatuses}
        doneStageIds={demoDoneStages}
        now={demoNow}
        locale="es"
        loading={scenario === "loading"}
        error={scenario === "error" ? "No se pudo cargar el tablero de demostración." : null}
        readOnly={scenario === "readOnly"}
        onRetry={() => setScenario("ready")}
        onMove={move}
        onUpdate={update}
        onAddSubtask={addSubtask}
        onSubtaskStatusChange={setSubtaskStatus}
        onComment={comment}
        onAttach={attach}
        onRemoveAttachment={removeAttachment}
        onCreateRequest={create}
      />
    </div>
  )
}
