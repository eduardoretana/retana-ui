/**
 * Fictional sample data for AE (Asesor Experto). No person, client, NSS, or file here is real.
 */
export type AeTrend = { label: string; value: string; change: string; direction: "up" | "down"; series: number[]; hint?: string }

export const aeStats: AeTrend[] = [
  { label: "Clientes activos", value: "1,284", change: "+8.2%", direction: "up", series: [880, 940, 1010, 990, 1120, 1190, 1284], hint: "vs. mes anterior" },
  { label: "Expedientes en trámite", value: "312", change: "+3.1%", direction: "up", series: [260, 275, 270, 290, 300, 296, 312], hint: "vs. mes anterior" },
  { label: "Cotizaciones vencidas", value: "27", change: "−12%", direction: "down", series: [41, 38, 36, 33, 31, 30, 27], hint: "vs. mes anterior" },
]

export const aeMonthly = [
  { label: "Abr", value: 42 },
  { label: "May", value: 51 },
  { label: "Jun", value: 47 },
  { label: "Jul", value: 63 },
  { label: "Ago", value: 58 },
  { label: "Sep", value: 71 },
  { label: "Oct", value: 84 },
]

export const aeStates = [
  { label: "Jalisco", value: 312 },
  { label: "CDMX", value: 284 },
  { label: "Nuevo León", value: 196 },
  { label: "Guanajuato", value: 141 },
  { label: "Puebla", value: 98 },
]

export const aeNotes = [
  { id: "n1", text: "Pedir constancia de semanas a Rosa Linares (ficticia)" },
  { id: "n2", text: "Revisar tope Mod 40 en cotización COT-0148" },
  { id: "n3", text: "Confirmar cita de firma con Hugo Pérez" },
]

export type AeAppointment = { id: string; day: string; time: string; title: string; client: string; people: string[]; place: string }

export const aeDays = [
  { id: "2026-10-19", weekday: "Lun", day: 19 },
  { id: "2026-10-20", weekday: "Mar", day: 20 },
  { id: "2026-10-21", weekday: "Mié", day: 21 },
  { id: "2026-10-22", weekday: "Jue", day: 22 },
  { id: "2026-10-23", weekday: "Vie", day: 23 },
  { id: "2026-10-24", weekday: "Sáb", day: 24 },
  { id: "2026-10-26", weekday: "Lun", day: 26 },
]

export const aeAppointments: AeAppointment[] = [
  { id: "c1", day: "2026-10-22", time: "10:00", title: "Diagnóstico de pensión", client: "Rosa Linares", people: ["Ana Ruiz", "Rosa Linares"], place: "Videollamada" },
  { id: "c2", day: "2026-10-22", time: "12:30", title: "Firma de expediente", client: "Hugo Pérez", people: ["Luis Mora", "Hugo Pérez", "Marta Gil"], place: "Oficina Guadalajara" },
  { id: "c3", day: "2026-10-23", time: "09:00", title: "Revisión de cotización", client: "Elena Soto", people: ["Ana Ruiz", "Elena Soto"], place: "Videollamada" },
  { id: "c4", day: "2026-10-26", time: "16:00", title: "Entrega de resolución", client: "Jorge Villa", people: ["Luis Mora", "Jorge Villa"], place: "Portal Mesa" },
]

export const aeProcesses = [
  { id: "p1", title: "Ley 73: cálculo y estrategia", meta: "12 lecciones · 3 h", progress: 72, people: ["Ana Ruiz", "Luis Mora", "Marta Gil", "Iván Cruz", "Sofía León"] },
  { id: "p2", title: "Modalidad 40 tras el acuerdo 2026", meta: "6 lecciones · 1.5 h", progress: 35, people: ["Luis Mora", "Sofía León", "Iván Cruz"] },
  { id: "p3", title: "Portal Mesa: armar un expediente", meta: "8 lecciones · 2 h", progress: 100, people: ["Marta Gil", "Ana Ruiz"] },
]

export const aeAreaSeries = {
  labels: ["Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"],
  series: [
    { id: "exp", label: "Expedientes abiertos", values: [30, 42, 38, 55, 50, 62, 70] },
    { id: "res", label: "Resoluciones", values: [12, 18, 22, 26, 31, 38, 44] },
    { id: "cot", label: "Cotizaciones", values: [48, 40, 52, 47, 60, 58, 66] },
  ],
}

export const aeTasks = [
  { id: "t1", title: "Subir CURP y NSS al expediente EXP-2291", progress: 80, due: "Hoy" },
  { id: "t2", title: "Validar semanas cotizadas de Elena Soto", progress: 45, due: "Mañana" },
  { id: "t3", title: "Enviar cotización Mod 40 a Jorge Villa", progress: 10, due: "Vie" },
  { id: "t4", title: "Cerrar curso de Portal Mesa", progress: 100, due: "Listo" },
]

export const aeLeaders = [
  { id: "a1", name: "Ana Ruiz", region: "Jalisco", score: 1840, closed: 42 },
  { id: "a2", name: "Luis Mora", region: "CDMX", score: 1710, closed: 39 },
  { id: "a3", name: "Marta Gil", region: "Nuevo León", score: 1525, closed: 33 },
  { id: "a4", name: "Iván Cruz", region: "Puebla", score: 1302, closed: 28 },
  { id: "a5", name: "Sofía León", region: "Guanajuato", score: 1190, closed: 24 },
]
