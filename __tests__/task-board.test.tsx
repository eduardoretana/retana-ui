import { useState, type ComponentProps } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TaskBoard } from "@/registry/blocks/task-board"
import { TaskCard } from "@/registry/ui/task-card"
import { TaskDetail } from "@/registry/ui/task-detail"
import {
  adjacentTaskId,
  countTasksByPriority,
  formatTaskPosition,
  isTaskOverdue,
  taskMatchesQuery,
  threadComments,
  type TaskRecord,
} from "@/registry/lib/task-board"

const now = "2026-10-24T15:00:00.000Z"
const stages = [
  { id: "todo", label: "Por hacer" },
  { id: "doing", label: "En curso" },
  { id: "done", label: "Hecho" },
]
const people = [
  { id: "ana", name: "Ana Rueda" },
  { id: "leo", name: "Leo Marín" },
]
const categories = [{ id: "taller", label: "Taller" }]

const tasks: TaskRecord[] = [
  {
    id: "kiln",
    title: "Preparar el horno",
    description: "Revisar las placas antes de encender.",
    stageId: "todo",
    priority: "high",
    categoryId: "taller",
    assigneeIds: ["ana", "leo"],
    dueAt: "2026-10-20T15:00:00.000Z",
    subtasks: [{ id: "s1", title: "Medir temperatura", statusId: "pending", priority: "low" }],
    comments: [
      { id: "c1", authorId: "ana", body: "El horno queda libre.", createdAt: "2026-10-22T16:00:00.000Z" },
      {
        id: "c2",
        authorId: "leo",
        body: "Reservo la carga.",
        createdAt: "2026-10-22T17:00:00.000Z",
        parentId: "c1",
      },
    ],
  },
  {
    id: "visit",
    title: "Visita a la cantera",
    stageId: "doing",
    priority: "low",
    assigneeIds: ["leo"],
    dueAt: "2026-11-02T15:00:00.000Z",
    subtasks: [],
    comments: [],
  },
  {
    id: "archive",
    title: "Cerrar inventario",
    stageId: "done",
    priority: "medium",
    assigneeIds: [],
    dueAt: "2026-10-01T15:00:00.000Z",
    subtasks: [],
    comments: [],
  },
]

function Board(props: Partial<ComponentProps<typeof TaskBoard>> = {}) {
  return (
    <TaskBoard
      tasks={tasks}
      stages={stages}
      people={people}
      categories={categories}
      now={now}
      doneStageIds={["done"]}
      {...props}
    />
  )
}

describe("task board model", () => {
  it("pads the position and ignores a finished stage", () => {
    expect(formatTaskPosition(1, 100, "de")).toBe("01 de 100")
    expect(formatTaskPosition(8, 1000, "de")).toBe("08 de 1000")
    expect(formatTaskPosition(100, 100, "de")).toBe("100 de 100")
    expect(isTaskOverdue(tasks[0]!, now, ["done"])).toBe(true)
    expect(isTaskOverdue(tasks[2]!, now, ["done"])).toBe(false)
    expect(countTasksByPriority(tasks)).toMatchObject({ low: 1, medium: 1, high: 1, critical: 0 })
    expect(taskMatchesQuery(tasks[1]!, "cantera", { people })).toBe(true)
    expect(taskMatchesQuery(tasks[0]!, "cantera", { people })).toBe(false)
    expect(threadComments(tasks[0]!.comments)).toEqual([
      { comment: tasks[0]!.comments![0], replies: [tasks[0]!.comments![1]] },
    ])
    expect(adjacentTaskId(["a", "b", "c"], "b", 1)).toBe("c")
    expect(adjacentTaskId(["a"], "a", 1)).toBeNull()
  })
})

describe("task board", () => {
  it("filters by search and priority and switches to the list", async () => {
    const user = userEvent.setup()
    render(<Board />)
    expect(screen.getByRole("region", { name: "Por hacer" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Abrir Preparar el horno" })).toBeInTheDocument()
    expect(screen.getByText("Vencido")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Abrir Cerrar inventario" }).closest("[data-overdue]")).toHaveAttribute(
      "data-overdue",
      "false",
    )

    await user.type(screen.getByRole("searchbox", { name: "Buscar" }), "cantera")
    expect(screen.queryByRole("button", { name: "Abrir Preparar el horno" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Abrir Visita a la cantera" })).toBeInTheDocument()

    await user.clear(screen.getByRole("searchbox", { name: "Buscar" }))
    await user.click(screen.getByRole("button", { name: /Filtrar prioridad Alta/ }))
    expect(screen.getByRole("button", { name: "Abrir Preparar el horno" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Abrir Visita a la cantera" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Lista" }))
    expect(screen.getByRole("region", { name: "Tablero de encargos" })).toHaveAttribute("data-view", "list")
  })

  it("moves with the arrow keys and the menu, and announces it", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    render(<Board onMove={onMove} />)
    screen.getByRole("button", { name: "Abrir Preparar el horno" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).toHaveBeenCalledWith("kiln", "doing", "todo")
    expect(document.querySelector("[data-slot=task-board-announcement]")).toHaveTextContent(
      "Preparar el horno se movió a En curso.",
    )

    await user.click(screen.getByRole("button", { name: "Acciones de Visita a la cantera" }))
    await user.click(screen.getByRole("menuitem", { name: "Hecho" }))
    expect(onMove).toHaveBeenCalledWith("visit", "done", "doing")
  })

  it("edits the open task, adds a subtask, and sends a reply", async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onAddSubtask = vi.fn()
    const onComment = vi.fn()
    const onSubtaskStatusChange = vi.fn()
    render(
      <Board
        onUpdate={onUpdate}
        onAddSubtask={onAddSubtask}
        onComment={onComment}
        onSubtaskStatusChange={onSubtaskStatusChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Abrir Preparar el horno" }))
    const dialog = await screen.findByRole("dialog", { name: "Detalle del encargo" })
    expect(within(dialog).getByText("01 de 3")).toBeInTheDocument()
    expect(within(dialog).getByText("Reservo la carga.")).toBeInTheDocument()
    expect(within(dialog).getByText("Medir temperatura").closest("li")).toHaveTextContent("Baja")

    await user.selectOptions(within(dialog).getByRole("combobox", { name: "Prioridad" }), "critical")
    expect(onUpdate).toHaveBeenCalledWith("kiln", { priority: "critical" })

    await user.click(within(dialog).getByRole("button", { name: "Siguiente" }))
    expect(within(dialog).getByRole("heading", { name: "Visita a la cantera" })).toBeInTheDocument()
    expect(within(dialog).getByText("02 de 3")).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Anterior" }))
    await user.type(within(dialog).getByRole("textbox", { name: "Nueva subtarea" }), "Apartar placas")
    await user.click(within(dialog).getByRole("button", { name: "Agregar subtarea" }))
    expect(onAddSubtask).toHaveBeenCalledWith("kiln", {
      title: "Apartar placas",
      statusId: "pending",
      priority: "medium",
    })

    await user.selectOptions(within(dialog).getByRole("combobox", { name: "Estado de Medir temperatura" }), "doing")
    expect(onSubtaskStatusChange).toHaveBeenCalledWith("kiln", "s1", "doing")

    await user.click(within(dialog).getByRole("button", { name: "Responder" }))
    expect(within(dialog).getByText("Respuesta a Ana Rueda")).toBeInTheDocument()
    await user.type(within(dialog).getByRole("textbox", { name: "Escribe un comentario" }), "De acuerdo")
    await user.click(within(dialog).getByRole("button", { name: "Enviar" }))
    expect(onComment).toHaveBeenCalledWith("kiln", {
      body: "De acuerdo",
      parentId: "c1",
      files: [],
    })
  })

  it("shows empty, loading, error, and read only", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onMove = vi.fn()
    const { rerender } = render(<Board tasks={[]} />)
    expect(screen.getByText("No hay encargos")).toBeInTheDocument()

    rerender(<Board loading />)
    expect(screen.getByRole("status", { name: "Cargando encargos" })).toBeInTheDocument()

    rerender(<Board error="Sin red" onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Sin red")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<Board readOnly onMove={onMove} />)
    expect(screen.getByText("Solo lectura")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Arrastrar Preparar el horno" })).toBeDisabled()
    screen.getByRole("button", { name: "Abrir Preparar el horno" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMove).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Abrir Preparar el horno" }))
    const dialog = await screen.findByRole("dialog", { name: "Detalle del encargo" })
    expect(within(dialog).queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Agregar subtarea" })).not.toBeInTheDocument()
  })

  it("walks the detail with the arrow keys", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [id, setId] = useState(tasks[0]!.id)
      const task = tasks.find((item) => item.id === id) ?? tasks[0]!
      const index = tasks.findIndex((item) => item.id === task.id)
      return (
        <TaskDetail
          task={task}
          people={people}
          stages={stages}
          position={index + 1}
          total={tasks.length}
          onPrevious={index > 0 ? () => setId(tasks[index - 1]!.id) : undefined}
          onNext={index < tasks.length - 1 ? () => setId(tasks[index + 1]!.id) : undefined}
        />
      )
    }
    render(<Harness />)
    screen.getByRole("button", { name: "Siguiente" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("heading", { name: "Visita a la cantera" })).toBeInTheDocument()
  })

  it("renders a card overflow count", () => {
    const crowd = [
      { id: "ana", name: "Ana Rueda" },
      { id: "leo", name: "Leo Marín" },
      { id: "noa", name: "Noa Vidal" },
      { id: "iris", name: "Iris Sol" },
      { id: "mesa", name: "Mesa Demo" },
    ]
    render(
      <TaskCard
        task={{ ...tasks[0]!, assigneeIds: crowd.map((person) => person.id) }}
        people={crowd}
        stages={stages}
        overdue
      />,
    )
    expect(screen.getByText("+2")).toBeInTheDocument()
    expect(screen.getByText("Vencido")).toBeInTheDocument()
  })
})
