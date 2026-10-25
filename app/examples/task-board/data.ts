import type { TaskOption, TaskPerson, TaskRecord } from "@/registry/lib/task-board"

/** Fictional workshop. People, dates, and files are invented for the catalog. */
export const demoNow = "2026-10-24T15:00:00.000Z"

export const demoPeople: TaskPerson[] = [
  { id: "ana", name: "Ana Rueda" },
  { id: "leo", name: "Leo Marín" },
  { id: "noa", name: "Noa Vidal" },
  { id: "iris", name: "Iris Sol" },
  { id: "mesa", name: "Mesa (demo)" },
]

export const demoStages: TaskOption[] = [
  { id: "por-hacer", label: "Por hacer", tone: "neutral" },
  { id: "en-curso", label: "En curso", tone: "accent" },
  { id: "revision", label: "En revisión", tone: "warning" },
  { id: "hecho", label: "Hecho", tone: "positive" },
]

export const demoCategories: TaskOption[] = [
  { id: "taller", label: "Taller" },
  { id: "visitas", label: "Visitas" },
  { id: "archivo", label: "Archivo" },
]

export const demoSubtaskStatuses: TaskOption[] = [
  { id: "pendiente", label: "Pendiente" },
  { id: "haciendo", label: "Haciendo" },
  { id: "lista", label: "Lista" },
]

export const demoDoneStages = ["hecho"]

const longDescription = [
  "El presupuesto del horno nuevo cubre la cámara, el termopar y una semana de pruebas con esmaltes claros.",
  "Hay que comparar el consumo con el horno actual y anotar qué piezas no entran en la primera hornada.",
  "Texto de demostración: la cooperativa y las cifras son inventadas.",
].join(" ")

export const demoTasks: TaskRecord[] = [
  {
    id: "horno",
    title: "Preparar el horno del sábado",
    description: "Dejar la cámara libre después del mediodía y apartar las placas grandes.",
    stageId: "en-curso",
    priority: "high",
    categoryId: "taller",
    assigneeIds: ["ana", "leo"],
    dueAt: "2026-10-20T15:00:00.000Z",
    reminderAt: "2026-10-25T13:00:00.000Z",
    subtasks: [
      {
        id: "horno-temp",
        title: "Medir la temperatura de prueba",
        description: "Anotar tres lecturas.",
        statusId: "haciendo",
        priority: "high",
      },
      {
        id: "horno-placas",
        title: "Apartar las placas",
        statusId: "pendiente",
        priority: "low",
      },
    ],
    comments: [
      {
        id: "horno-c1",
        authorId: "ana",
        body: "El horno grande queda libre después de las doce.",
        createdAt: "2026-10-22T16:10:00.000Z",
      },
      {
        id: "horno-c2",
        authorId: "leo",
        body: "Reservo la carga de esmaltes para esa hora.",
        createdAt: "2026-10-22T16:40:00.000Z",
        parentId: "horno-c1",
      },
    ],
    attachments: [{ id: "horno-nota", name: "notas-horno.txt", size: 2400 }],
  },
  {
    id: "materiales",
    title: "Lista de materiales del taller abierto",
    description: "Arcilla, esmalte claro y esponjas.",
    stageId: "por-hacer",
    priority: "medium",
    categoryId: "taller",
    assigneeIds: ["noa"],
    dueAt: "2026-11-02T15:00:00.000Z",
    subtasks: [{ id: "mat-1", title: "Contar esponjas", statusId: "pendiente", priority: "medium" }],
    comments: [],
  },
  {
    id: "cantera",
    title: "Confirmar la visita a la cantera",
    description: "El grupo sale temprano. Falta el permiso de acceso.",
    stageId: "por-hacer",
    priority: "low",
    categoryId: "visitas",
    assigneeIds: ["iris"],
    dueAt: "2026-10-18T15:00:00.000Z",
    subtasks: [],
    comments: [],
  },
  {
    id: "fichas",
    title: "Archivar las fichas de esmalte",
    description: "Reunir las fichas sueltas del estante norte.",
    stageId: "revision",
    priority: "medium",
    categoryId: "archivo",
    assigneeIds: ["ana", "leo", "noa", "iris"],
    dueAt: "2026-10-30T15:00:00.000Z",
    subtasks: [],
    comments: [
      {
        id: "fichas-c1",
        authorId: "noa",
        body: "Faltan las fichas del esmalte mate.",
        createdAt: "2026-10-21T11:00:00.000Z",
      },
    ],
  },
  {
    id: "presupuesto",
    title: "Revisar el presupuesto del horno nuevo",
    description: longDescription,
    stageId: "en-curso",
    priority: "critical",
    categoryId: "taller",
    assigneeIds: ["leo"],
    dueAt: "2026-11-12T15:00:00.000Z",
    reminderAt: "2026-10-28T09:00:00.000Z",
    subtasks: [],
    comments: [],
    attachments: [{ id: "presupuesto-pdf", name: "presupuesto-horno.pdf", size: 240_000 }],
  },
  {
    id: "inventario",
    title: "Cerrar el inventario de marzo",
    description: "Ya está firmado. La fecha pasó y la etapa está cerrada.",
    stageId: "hecho",
    priority: "low",
    categoryId: "archivo",
    assigneeIds: ["noa"],
    dueAt: "2026-10-01T15:00:00.000Z",
    subtasks: [{ id: "inv-1", title: "Firmar el conteo", statusId: "lista", priority: "low" }],
    comments: [],
  },
]

export function manyDemoTasks(count: number): TaskRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const stage = demoStages[index % demoStages.length]!
    const person = demoPeople[index % 4]!
    return {
      id: `lote-${index + 1}`,
      title: `Encargo de lote ${index + 1}`,
      description: index % 5 === 0 ? "🙂" : "Pieza de demostración.",
      stageId: stage.id,
      priority: (["low", "medium", "high", "critical"] as const)[index % 4]!,
      categoryId: demoCategories[index % demoCategories.length]!.id,
      assigneeIds: [person.id],
      dueAt: index % 3 === 0 ? "2026-10-01T15:00:00.000Z" : "2026-12-01T15:00:00.000Z",
      subtasks: [],
      comments: [],
    }
  })
}
