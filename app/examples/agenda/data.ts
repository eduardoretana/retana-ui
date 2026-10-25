import type { AgendaCategory, AgendaEvent } from "@/registry/lib/agenda"

/** Fixed clock for the demo: Wednesday 8 April 2026, 10:28 in Mexico City. */
export const demoNow = "2026-04-08T16:28:00.000Z"

export const demoAnchor = "2026-04-08"

export const demoTimeZone = "America/Mexico_City"

export const demoCategories: AgendaCategory[] = [
  { id: "equipo", label: "Equipo", icon: "users", tone: "accent" },
  { id: "taller", label: "Taller", icon: "wrench", tone: "neutral" },
  { id: "diseno", label: "Diseño", icon: "pen", tone: "info" },
  { id: "visitas", label: "Visitas", icon: "map", tone: "warning" },
  { id: "contenido", label: "Contenido", icon: "clapperboard", tone: "positive" },
  { id: "direccion", label: "Dirección", icon: "briefcase", tone: "critical" },
]

function at(day: number, hour: number, minute = 0) {
  const utcHour = hour + 6
  const extra = utcHour >= 24 ? 1 : 0
  const hourPart = utcHour % 24
  return new Date(Date.UTC(2026, 3, day + extra, hourPart, minute)).toISOString()
}

export const demoEvents: AgendaEvent<{ origen: string }>[] = [
  {
    id: "sincronia",
    title: "Sincronía del equipo",
    description: "Repartir las mesas de la semana. Nadie trae encargos de fuera.",
    startsAt: at(6, 9),
    endsAt: at(6, 9, 30),
    categoryId: "equipo",
    location: "Mesa larga",
    participants: [
      { id: "nuria", name: "Nuria Sol", status: "confirmed" },
      { id: "teo", name: "Teo Bruma", status: "confirmed" },
    ],
    meta: { origen: "demo" },
  },
  {
    id: "lote",
    title: "Planeación del lote",
    description: "Elegir el papel del siguiente lote. El encargo vive en el tablero.",
    startsAt: at(6, 10, 45),
    endsAt: at(6, 12),
    categoryId: "taller",
    taskId: "horno",
    meta: { origen: "demo" },
  },
  {
    id: "direccion",
    title: "Revisión con dirección",
    description: "Decisiones del trimestre. El registro de la cuenta es del CRM.",
    startsAt: at(6, 12),
    endsAt: at(6, 14),
    categoryId: "direccion",
    recordId: "cuenta-calamo",
    location: "Sala Norte",
    participants: [{ id: "paz", name: "Paz Lemus", status: "confirmed" }],
    meta: { origen: "demo" },
  },
  {
    id: "preparar",
    title: "Preparar la prueba",
    startsAt: at(7, 8, 30),
    endsAt: at(7, 9),
    categoryId: "taller",
    meta: { origen: "demo" },
  },
  {
    id: "visitantes",
    title: "Prueba con visitantes",
    description: "Tres personas del barrio miran el prototipo. Datos inventados.",
    startsAt: at(7, 10),
    endsAt: at(7, 11, 30),
    categoryId: "visitas",
    attention: true,
    location: "Sala Norte",
    participants: [
      { id: "nuria", name: "Nuria Sol", status: "confirmed" },
      { id: "ivo", name: "Ivo Calderón", status: "pending" },
    ],
    meta: { origen: "demo" },
  },
  {
    id: "comida",
    title: "Comida del equipo",
    startsAt: at(7, 12),
    endsAt: at(7, 13, 30),
    categoryId: "equipo",
    meta: { origen: "demo" },
  },
  {
    id: "horneada",
    title: "Horneada de la noche",
    description: "Cruza la medianoche. El tramo de la madrugada queda en el día siguiente.",
    startsAt: at(7, 22),
    endsAt: at(8, 2),
    categoryId: "taller",
    meta: { origen: "demo" },
  },
  {
    id: "mantenimiento",
    title: "Mantenimiento del taller",
    startsAt: at(8, 8),
    endsAt: at(8, 9, 30),
    categoryId: "taller",
    meta: { origen: "demo" },
  },
  {
    id: "pieza",
    title: "Prueba de la pieza",
    description: "Revisar el ajuste del bastidor antes de la crítica. El estudio es inventado.",
    startsAt: at(8, 10),
    endsAt: at(8, 12, 30),
    categoryId: "diseno",
    location: "Sala Norte",
    taskId: "horno",
    participants: [
      { id: "nuria", name: "Nuria Sol", status: "confirmed" },
      { id: "ivo", name: "Ivo Calderón", status: "pending" },
      { id: "paz", name: "Paz Lemus", status: "confirmed" },
    ],
    meta: { origen: "demo" },
  },
  {
    id: "corte",
    title: "Corte de papel",
    startsAt: at(8, 10, 30),
    endsAt: at(8, 11, 30),
    categoryId: "taller",
    meta: { origen: "demo" },
  },
  {
    id: "editorial",
    title: "Pieza editorial",
    startsAt: at(8, 15),
    endsAt: at(8, 15, 30),
    categoryId: "contenido",
    meta: { origen: "demo" },
  },
  {
    id: "pauta",
    title: "Revisión de pauta",
    startsAt: at(9, 9),
    endsAt: at(9, 9, 30),
    categoryId: "contenido",
    meta: { origen: "demo" },
  },
  {
    id: "critica",
    title: "Crítica de diseño",
    startsAt: at(9, 9, 30),
    endsAt: at(9, 10, 30),
    categoryId: "diseno",
    participants: [{ id: "teo", name: "Teo Bruma", status: "declined" }],
    meta: { origen: "demo" },
  },
  {
    id: "redes",
    title: "Revisión de redes",
    description: "Mirar qué piezas se publican. No hay cuentas reales conectadas.",
    startsAt: at(9, 11),
    endsAt: at(9, 13),
    categoryId: "contenido",
    meta: { origen: "demo" },
  },
  {
    id: "cierre",
    title: "Cierre editorial",
    startsAt: at(9, 13, 30),
    endsAt: at(9, 14),
    categoryId: "contenido",
    meta: { origen: "demo" },
  },
  {
    id: "feria",
    title: "Feria del barrio",
    description: "Día completo. El puesto es de mentira, como el resto del ejemplo.",
    startsAt: at(10, 0),
    endsAt: at(11, 0),
    allDay: true,
    categoryId: "visitas",
    attention: true,
    recordId: "cuenta-calamo",
    meta: { origen: "demo" },
  },
]

export function manyAgendaEvents(count: number): AgendaEvent[] {
  return Array.from({ length: count }, (_, index) => {
    const day = 6 + (index % 5)
    const hour = 8 + (index % 7)
    const start = Date.parse(at(day, hour, (index % 4) * 15))
    return {
      id: `extra-${index}`,
      title: index % 11 === 0 ? "X".repeat(60) : `Bloque ${index + 1}`,
      description: "Evento generado para el marco de estrés.",
      startsAt: new Date(start).toISOString(),
      endsAt: new Date(start + 45 * 60_000).toISOString(),
      categoryId: demoCategories[index % demoCategories.length]!.id,
      meta: { origen: "demo" },
    }
  })
}
