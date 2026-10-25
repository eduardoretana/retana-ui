"use client"

import { useState } from "react"

import { TaskDetail } from "@/registry/ui/task-detail"
import type { TaskCommentInput, TaskPatch, TaskSubtaskDraft } from "@/registry/lib/task-board"

import {
  demoCategories,
  demoPeople,
  demoStages,
  demoSubtaskStatuses,
  demoTasks,
} from "../task-board/data"

export function TaskDetailDemo({ taskId = "horno" }: { taskId?: string }) {
  const [tasks, setTasks] = useState(demoTasks)
  const [index, setIndex] = useState(Math.max(0, demoTasks.findIndex((task) => task.id === taskId)))
  const task = tasks[index] ?? tasks[0]!

  function update(id: string, patch: TaskPatch) {
    setTasks((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addSubtask(id: string, draft: TaskSubtaskDraft) {
    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              subtasks: [
                ...(item.subtasks ?? []),
                {
                  id: `sub-${item.subtasks?.length ?? 0}-${draft.title.length}`,
                  title: draft.title,
                  statusId: draft.statusId ?? "pendiente",
                  priority: draft.priority,
                },
              ],
            }
          : item,
      ),
    )
  }

  function comment(id: string, input: TaskCommentInput) {
    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              comments: [
                ...(item.comments ?? []),
                {
                  id: `c-${item.comments?.length ?? 0}`,
                  authorId: "mesa",
                  body: input.body,
                  createdAt: "2026-10-24T15:00:00.000Z",
                  parentId: input.parentId,
                },
              ],
            }
          : item,
      ),
    )
  }

  return (
    <div className="h-[760px] overflow-hidden rounded-xl border border-border">
      <TaskDetail
        task={task}
        people={demoPeople}
        stages={demoStages}
        categories={demoCategories}
        subtaskStatuses={demoSubtaskStatuses}
        position={index + 1}
        total={tasks.length}
        onPrevious={index > 0 ? () => setIndex(index - 1) : undefined}
        onNext={index < tasks.length - 1 ? () => setIndex(index + 1) : undefined}
        onUpdate={update}
        onStageChange={(stageId) => update(task.id, { stageId })}
        onAddSubtask={addSubtask}
        onSubtaskStatusChange={(taskId, subtaskId, statusId) =>
          setTasks((current) =>
            current.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    subtasks: (item.subtasks ?? []).map((subtask) =>
                      subtask.id === subtaskId ? { ...subtask, statusId } : subtask,
                    ),
                  }
                : item,
            ),
          )
        }
        onComment={comment}
        onRemoveAttachment={(taskId, attachmentId) =>
          setTasks((current) =>
            current.map((item) =>
              item.id === taskId
                ? { ...item, attachments: (item.attachments ?? []).filter((file) => file.id !== attachmentId) }
                : item,
            ),
          )
        }
      />
    </div>
  )
}
