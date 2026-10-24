/** Fictional Spanish rows for the work-table demos. Not copied from a reference. */

export const DEMO_NOW = new Date("2026-10-15T15:00:00.000Z")

export type DemoWork = {
  id: string
  title: string
  code: string
  kind: string
  assigneeId: string | null
  priority: "p0" | "p1" | "p2" | "p3"
  due: string
  statusId: string
  slaDue: string
  effort: number
  parentId: string | null
  rank: number
  cycle: string
  views: number
  share: number
  minutes: number
}

export const demoPeople = [
  { id: "ana", name: "Ana Ruiz", initials: "AR" },
  { id: "leo", name: "Leo Martín", initials: "LM" },
  { id: "noa", name: "Noa Vidal", initials: "NV" },
  { id: "teo", name: "Teo Salas", initials: "TS" },
]

export const demoStatuses = [
  { id: "todo", label: "Por hacer", tone: "neutral" as const },
  { id: "doing", label: "En curso", tone: "info" as const },
  { id: "review", label: "Revisión", tone: "warning" as const },
  { id: "done", label: "Hecho", tone: "positive" as const },
]

export const demoCycles = [
  { id: "c24", label: "Ciclo 24" },
  { id: "c25", label: "Ciclo 25" },
]

const hour = 3_600_000

function at(offsetMs: number) {
  return new Date(DEMO_NOW.getTime() + offsetMs).toISOString()
}

function row(partial: DemoWork): DemoWork {
  return partial
}

export const demoBoard: DemoWork[] = [
  row({ id: "b1", title: "Revisar contrato marco", code: "AC-104", kind: "Acuerdo", assigneeId: "ana", priority: "p0", due: at(-86_400_000), statusId: "doing", slaDue: at(4 * hour), effort: 5, parentId: null, rank: 1, cycle: "c24", views: 6300, share: 62, minutes: 45 }),
  row({ id: "b2", title: "Cerrar propuesta norte", code: "AC-118", kind: "Tarea", assigneeId: "leo", priority: "p1", due: at(0), statusId: "doing", slaDue: at(2 * hour), effort: 3, parentId: null, rank: 2, cycle: "c24", views: 820, share: 40, minutes: 20 }),
  row({ id: "b3", title: "Pedir anexos al cliente", code: "AC-121", kind: "Tarea", assigneeId: "noa", priority: "p2", due: at(86_400_000), statusId: "todo", slaDue: at(20 * hour), effort: 2, parentId: null, rank: 3, cycle: "c25", views: 120, share: 12, minutes: 15 }),
  row({ id: "b4", title: "Armar agenda de taller", code: "AC-090", kind: "Tarea", assigneeId: "teo", priority: "p3", due: at(2 * 86_400_000), statusId: "todo", slaDue: at(30 * hour), effort: 1, parentId: null, rank: 4, cycle: "c25", views: 40, share: 4, minutes: 10 }),
  row({ id: "b5", title: "Validar cifras de octubre", code: "AC-133", kind: "Acuerdo", assigneeId: "ana", priority: "p1", due: at(3 * 86_400_000), statusId: "review", slaDue: at(-hour), effort: 8, parentId: null, rank: 5, cycle: "c24", views: 2100, share: 71, minutes: 90 }),
  row({ id: "b6", title: "Publicar nota de alcance", code: "AC-140", kind: "Tarea", assigneeId: "leo", priority: "p2", due: at(-2 * 86_400_000), statusId: "review", slaDue: at(6 * hour), effort: 4, parentId: null, rank: 6, cycle: "c24", views: 540, share: 22, minutes: 30 }),
  row({ id: "b7", title: "Confirmar sala", code: "AC-141", kind: "Tarea", assigneeId: null, priority: "p3", due: at(86_400_000), statusId: "todo", slaDue: at(12 * hour), effort: 1, parentId: null, rank: 7, cycle: "c25", views: 15, share: 2, minutes: 5 }),
  row({ id: "b8", title: "Enviar minuta", code: "AC-088", kind: "Tarea", assigneeId: "noa", priority: "p2", due: at(-86_400_000), statusId: "done", slaDue: at(-2 * hour), effort: 2, parentId: null, rank: 8, cycle: "c24", views: 300, share: 18, minutes: 25 }),
  row({ id: "b9", title: "Actualizar responsables", code: "AC-150", kind: "Tarea", assigneeId: "teo", priority: "p0", due: at(0), statusId: "todo", slaDue: at(3 * hour), effort: 3, parentId: null, rank: 9, cycle: "c25", views: 980, share: 33, minutes: 40 }),
  row({ id: "b10", title: "Cruzar comentarios legales", code: "AC-151", kind: "Acuerdo", assigneeId: "ana", priority: "p1", due: at(4 * 86_400_000), statusId: "todo", slaDue: at(48 * hour), effort: 5, parentId: null, rank: 10, cycle: "c24", views: 1500, share: 55, minutes: 60 }),
  row({ id: "b11", title: "Preparar tablero de seguimiento", code: "AC-160", kind: "Tarea", assigneeId: "leo", priority: "p2", due: at(86_400_000), statusId: "doing", slaDue: at(8 * hour), effort: 6, parentId: null, rank: 11, cycle: "c25", views: 4300, share: 48, minutes: 50 }),
  row({ id: "b12", title: "Archivar versión firmada", code: "AC-077", kind: "Acuerdo", assigneeId: "noa", priority: "p3", due: at(-3 * 86_400_000), statusId: "done", slaDue: at(hour), effort: 1, parentId: null, rank: 12, cycle: "c24", views: 70, share: 9, minutes: 8 }),
]

export const demoTree: DemoWork[] = [
  row({ id: "s1", title: "Sección de alcance", code: "DOC-1", kind: "Sección", assigneeId: "ana", priority: "p1", due: at(86_400_000), statusId: "doing", slaDue: at(10 * hour), effort: 3, parentId: null, rank: 1, cycle: "c24", views: 200, share: 10, minutes: 30 }),
  row({ id: "a1", title: "Objetivo del encargo", code: "DOC-1.1", kind: "Artículo", assigneeId: "leo", priority: "p2", due: at(0), statusId: "doing", slaDue: at(5 * hour), effort: 2, parentId: "s1", rank: 2, cycle: "c24", views: 80, share: 6, minutes: 15 }),
  row({ id: "a2", title: "Fuera de alcance", code: "DOC-1.2", kind: "Artículo", assigneeId: "noa", priority: "p3", due: at(2 * 86_400_000), statusId: "todo", slaDue: at(24 * hour), effort: 1, parentId: "s1", rank: 3, cycle: "c24", views: 40, share: 3, minutes: 10 }),
  row({ id: "a3", title: "Notas del párrafo", code: "DOC-1.2.1", kind: "Nota", assigneeId: "noa", priority: "p3", due: at(2 * 86_400_000), statusId: "todo", slaDue: at(24 * hour), effort: 1, parentId: "a2", rank: 4, cycle: "c24", views: 12, share: 1, minutes: 5 }),
  row({ id: "s2", title: "Sección de entrega", code: "DOC-2", kind: "Sección", assigneeId: "teo", priority: "p0", due: at(-86_400_000), statusId: "review", slaDue: at(-hour), effort: 5, parentId: null, rank: 5, cycle: "c25", views: 640, share: 28, minutes: 40 }),
  row({ id: "a4", title: "Calendario", code: "DOC-2.1", kind: "Artículo", assigneeId: "ana", priority: "p1", due: at(86_400_000), statusId: "review", slaDue: at(6 * hour), effort: 4, parentId: "s2", rank: 6, cycle: "c25", views: 220, share: 14, minutes: 25 }),
  row({ id: "a5", title: "Criterios de aceptación", code: "DOC-2.2", kind: "Artículo", assigneeId: "leo", priority: "p1", due: at(3 * 86_400_000), statusId: "todo", slaDue: at(16 * hour), effort: 3, parentId: "s2", rank: 7, cycle: "c25", views: 180, share: 11, minutes: 35 }),
]

export const demoQueue: DemoWork[] = demoBoard.map((item, index) => ({
  ...item,
  statusId: "todo",
  parentId: null,
  rank: index + 1,
}))

export const demoSupport: DemoWork[] = [
  row({ id: "t1", title: "No llega el acuse", code: "SUP-310", kind: "Ticket", assigneeId: "ana", priority: "p0", due: at(-86_400_000), statusId: "doing", slaDue: at(-30 * 60_000), effort: 2, parentId: null, rank: 1, cycle: "c24", views: 20, share: 0, minutes: 18 }),
  row({ id: "t2", title: "Error al adjuntar", code: "SUP-311", kind: "Ticket", assigneeId: "leo", priority: "p1", due: at(0), statusId: "todo", slaDue: at(2 * hour), effort: 3, parentId: null, rank: 2, cycle: "c24", views: 14, share: 0, minutes: 25 }),
  row({ id: "t3", title: "Acceso de invitado", code: "SUP-318", kind: "Ticket", assigneeId: "noa", priority: "p2", due: at(86_400_000), statusId: "todo", slaDue: at(5 * hour), effort: 1, parentId: null, rank: 3, cycle: "c25", views: 9, share: 0, minutes: 12 }),
  row({ id: "t4", title: "Doble cobro en ciclo", code: "SUP-320", kind: "Ticket", assigneeId: "teo", priority: "p0", due: at(0), statusId: "review", slaDue: at(45 * 60_000), effort: 5, parentId: null, rank: 4, cycle: "c24", views: 33, share: 0, minutes: 40 }),
  row({ id: "t5", title: "Campo de fecha vacío", code: "SUP-322", kind: "Ticket", assigneeId: null, priority: "p3", due: at(2 * 86_400_000), statusId: "todo", slaDue: at(26 * hour), effort: 1, parentId: null, rank: 5, cycle: "c25", views: 4, share: 0, minutes: 8 }),
  row({ id: "t6", title: "Aviso que no se cierra", code: "SUP-330", kind: "Ticket", assigneeId: "ana", priority: "p1", due: at(-2 * 86_400_000), statusId: "doing", slaDue: at(3 * hour), effort: 4, parentId: null, rank: 6, cycle: "c24", views: 27, share: 0, minutes: 22 }),
  row({ id: "t7", title: "Lista sin orden", code: "SUP-331", kind: "Ticket", assigneeId: "leo", priority: "p2", due: at(86_400_000), statusId: "todo", slaDue: at(9 * hour), effort: 2, parentId: null, rank: 7, cycle: "c25", views: 11, share: 0, minutes: 16 }),
  row({ id: "t8", title: "Cierre de sesión", code: "SUP-340", kind: "Ticket", assigneeId: "noa", priority: "p2", due: at(0), statusId: "done", slaDue: at(hour), effort: 1, parentId: null, rank: 8, cycle: "c24", views: 6, share: 0, minutes: 7 }),
]
