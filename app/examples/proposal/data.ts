import type { FieldDef, MultiRecord, ViewConfig } from "@/registry/lib/multi-view"
import type { TimelineEvent } from "@/registry/ui/timeline"
import type { CommandPaletteItem } from "@/registry/ui/command-palette"
import type {
  ClarifyQuestion,
  EstimateLine,
  PreflightItem,
  PriceLine,
  ProposalSection,
  ScopePhase,
} from "@/registry/lib/proposal"

export const NOW = new Date("2026-04-02T18:30:00Z")
export const NOW_MS = NOW.getTime()

export const peaks = Array.from({ length: 42 }, (_, index) => {
  const wave = Math.abs(Math.sin(index / 2.4))
  return Math.round((0.18 + wave * 0.75) * 100) / 100
})

export const clients = [
  { value: "nube", label: "Casa Nube" },
  { value: "ambar", label: "Mercado Ámbar" },
  { value: "rio", label: "Clínica del Río" },
]

export const projectTypes = [
  { value: "web", label: "Sitio de reservas" },
  { value: "brand", label: "Sistema visual" },
  { value: "ops", label: "Herramienta interna" },
]

export const metrics = [
  { id: "pipeline", label: "Embudo", value: 240, suffix: " mil", context: "USD abiertos", change: "+8%" },
  { id: "out", label: "Propuestas fuera", value: 6, context: "Esperan respuesta" },
  { id: "win", label: "Tasa de cierre", value: 42, suffix: "%", context: "Último trimestre", change: "+3%", sparkline: [28, 31, 30, 36, 34, 40, 42], sparklineLabel: "Tasa de cierre" },
  { id: "days", label: "Llamada a propuesta", value: 9, suffix: " días", context: "Mediana", change: "−2", sparkline: [14, 13, 12, 11, 12, 10, 9], sparklineLabel: "Días hasta la propuesta" },
]

export const actions = [
  { id: "risk", title: "Plazo de Casa Nube", description: "Piden seis semanas; lo habitual son nueve.", tone: "risk" as const, toneLabel: "Riesgo", value: "6 sem", actionLabel: "Revisar" },
  { id: "price", title: "Precio de Mercado Ámbar", description: "El borrador quedó bajo el rango.", tone: "price" as const, toneLabel: "Precio", value: "$86 mil", actionLabel: "Ajustar" },
  { id: "confidence", title: "Confianza baja", description: "Falta decidir el idioma del sitio.", tone: "low-confidence" as const, toneLabel: "Poca confianza", value: "54%", actionLabel: "Aclarar" },
  { id: "follow", title: "Seguimiento a Clínica del Río", description: "Sin respuesta desde el martes.", tone: "follow-up" as const, toneLabel: "Seguimiento", value: "3 días", actionLabel: "Escribir" },
]

export const trend = {
  label: "Horas cotizadas y entregadas",
  area: true,
  series: [
    { id: "quoted", label: "Cotizadas", emphasis: "muted" as const, points: [{ x: "Nov", y: 80 }, { x: "Dic", y: 96 }, { x: "Ene", y: 88 }, { x: "Feb", y: 110 }, { x: "Mar", y: 102 }] },
    { id: "delivered", label: "Entregadas", emphasis: "primary" as const, points: [{ x: "Nov", y: 74 }, { x: "Dic", y: 90 }, { x: "Ene", y: 99 }, { x: "Feb", y: 104 }, { x: "Mar", y: 108 }] },
  ],
}

export const activity: TimelineEvent[] = [
  { id: "a1", at: "2026-04-02T16:10:00Z", actor: "Inés Soler", title: "dejó la llamada de Casa Nube en el borrador", tone: "neutral" },
  { id: "a2", at: "2026-04-02T11:05:00Z", actor: "Mateo Ruiz", title: "marcó el plazo como riesgo", tone: "danger" },
  { id: "a3", at: "2026-04-01T19:40:00Z", actor: "Luz Peña", title: "envió la propuesta de Mercado Ámbar", tone: "success" },
  { id: "a4", at: "2026-03-30T15:12:00Z", actor: "Inés Soler", title: "cerró Clínica del Río en la fase de alcance", tone: "neutral" },
]

export const commands: CommandPaletteItem[] = [
  { id: "new", label: "Nueva oportunidad", group: "Trabajo", shortcut: "N" },
  { id: "board", label: "Ir al tablero", group: "Trabajo" },
  { id: "pipeline", label: "Ir al embudo", group: "Trabajo" },
]

export const questions: ClarifyQuestion[] = [
  {
    id: "lang",
    prompt: "¿El sitio se publica en uno o dos idiomas?",
    detail: "En la llamada se mencionaron ambos y no quedó decidido.",
    options: [
      { value: "one", label: "Uno", effects: [] },
      { value: "two", label: "Dos", effects: [{ id: "lang-hours", label: "Segunda lengua en plantillas", hours: 16 }] },
    ],
  },
  {
    id: "pay",
    prompt: "¿El pago en línea entra en esta fase?",
    options: [
      { value: "later", label: "Después", effects: [{ id: "pay-less", label: "Sin pasarela ahora", hours: -12 }] },
      { value: "now", label: "Ahora", effects: [{ id: "pay-more", label: "Pasarela y recibos", hours: 20 }] },
    ],
  },
  {
    id: "photos",
    prompt: "¿Quién produce las fotografías?",
    options: [
      { value: "client", label: "El cliente", effects: [] },
      { value: "studio", label: "El estudio", effects: [{ id: "photo", label: "Jornada de fotos", hours: 8 }] },
    ],
  },
]

export const phases: ScopePhase[] = [
  {
    id: "discover",
    title: "Descubrimiento",
    tasks: [
      { id: "map", title: "Mapa de reservas y excepciones", hours: 8, included: true, origin: "adapted" },
      { id: "voice", title: "Tono de los textos de la casa", hours: 4, included: true },
    ],
  },
  {
    id: "build",
    title: "Construcción",
    tasks: [
      { id: "pages", title: "Páginas de habitación y calendario", hours: 28, included: true, origin: "edited" },
      { id: "lang", title: "Segunda lengua", hours: 16, included: true, origin: "added" },
      { id: "pay", title: "Pago en línea", hours: 20, included: false },
    ],
  },
  {
    id: "launch",
    title: "Salida",
    tasks: [
      { id: "qa", title: "Recorrido con el equipo de la casa", hours: 6, included: true },
      { id: "hand", title: "Entrega del manual corto", hours: 4, included: true, origin: "adapted" },
    ],
  },
]

export const exclusions = [
  { id: "ads", label: "Campañas pagadas" },
  { id: "app", label: "Aplicación nativa" },
  { id: "print", label: "Piezas impresas de la recepción" },
]

export const similarProjects = [
  {
    id: "posada",
    name: "Posada Ladera",
    client: "Posada Ladera",
    revenue: 92000,
    weeks: 8,
    hours: 74,
    match: 0.86,
    phases: [
      { id: "d", label: "Descubrimiento", quoted: 12, actual: 14 },
      { id: "b", label: "Construcción", quoted: 48, actual: 55 },
      { id: "l", label: "Salida", quoted: 10, actual: 9 },
    ],
  },
  {
    id: "bahia",
    name: "Bahía Serena",
    client: "Bahía Serena",
    revenue: 64000,
    weeks: 6,
    hours: 51,
    match: 0.71,
    phases: [
      { id: "d", label: "Descubrimiento", quoted: 8, actual: 8 },
      { id: "b", label: "Construcción", quoted: 36, actual: 33 },
      { id: "l", label: "Salida", quoted: 8, actual: 10 },
    ],
  },
  {
    id: "orto",
    name: "Orto Club",
    client: "Orto Club",
    revenue: 110000,
    weeks: 11,
    hours: 96,
    match: 0.64,
    phases: [
      { id: "d", label: "Descubrimiento", quoted: 16, actual: 18 },
      { id: "b", label: "Construcción", quoted: 60, actual: 70 },
      { id: "l", label: "Salida", quoted: 12, actual: 8 },
    ],
  },
]

export const comparison = [
  { id: "common", title: "En común", items: ["Calendario de disponibilidad", "Ficha por habitación", "Manual de edición"] },
  { id: "extra", title: "De más en este caso", items: ["Segunda lengua", "Lista de espera"] },
  { id: "out", title: "Quedó fuera", items: ["Pago en línea", "Aplicación nativa"] },
]

export const lines: EstimateLine[] = [
  { id: "discover", phase: "Descubrimiento", hours: 12, rate: 1400, historicalHours: 14 },
  { id: "build", phase: "Construcción", hours: 44, rate: 1400, historicalHours: 52 },
  { id: "launch", phase: "Salida", hours: 10, rate: 1400, historicalHours: 9 },
]

export const capacity = ["L", "M", "X", "J", "V", "L", "M", "X", "J", "V"].map((label, index) => ({
  id: `d-${index}`,
  label,
  load: [0.4, 0.7, 0.9, 0.8, 0.5, 0.6, 0.85, 1, 0.7, 0.35][index] ?? 0.5,
}))

export const receipt: PriceLine[] = [
  { id: "base", label: "Alcance base", amount: 82000, kind: "base" },
  { id: "lang", label: "Segunda lengua", amount: 14000, kind: "upsell" },
  { id: "pay", label: "Sin pasarela en esta fase", amount: -9000, kind: "downsell" },
]

export const sections: ProposalSection[] = [
  { id: "open", title: "Apertura", body: "Para {client}, un sitio de reservas que el equipo de la casa pueda editar sin nosotros." },
  { id: "approach", title: "Enfoque", body: "Trabajamos por fases. {studio} entrega un calendario visible y un manual corto." },
  { id: "investment", title: "Inversión", body: "La cifra sugerida es {price}, en un plazo de {weeks}." },
]

export const preflight: PreflightItem[] = [
  { id: "scope", label: "Alcance revisado con el equipo", done: true },
  { id: "price", label: "Precio dentro del rango", done: true },
  { id: "risk", label: "Riesgo de plazo explicado", done: false },
]

export const sowClauses = [
  { id: "work", title: "Trabajo", body: "El estudio diseña y construye el sitio de reservas descrito en el alcance aprobado." },
  { id: "time", title: "Plazo", body: "El calendario histórico para un sitio así es de nueve semanas. Un plazo de seis se anota como riesgo." },
  { id: "pay", title: "Pago", body: "Cuarenta por ciento al aceptar, el resto al publicar." },
]

export const pipelineFields: FieldDef[] = [
  { id: "name", label: "Nombre", type: "text" },
  {
    id: "stage",
    label: "Etapa",
    type: "status",
    options: [
      { value: "call", label: "Llamada", tone: 1 },
      { value: "scope", label: "Alcance", tone: 2 },
      { value: "proposal", label: "Propuesta", tone: 3 },
      { value: "won", label: "Ganada", tone: 4 },
    ],
  },
  { id: "amount", label: "Monto", type: "currency", currency: "MXN" },
]

export const pipelineConfig: ViewConfig = {
  id: "pipeline",
  kind: "kanban",
  label: "Embudo",
  titleField: "name",
  groupField: "stage",
  sumField: "amount",
}

export const pipelineRecords: MultiRecord[] = [
  { id: "nube", name: "Casa Nube", stage: "call", amount: 87000 },
  { id: "ambar", name: "Mercado Ámbar", stage: "proposal", amount: 86000 },
  { id: "rio", name: "Clínica del Río", stage: "scope", amount: 54000 },
  { id: "orto", name: "Orto Club", stage: "won", amount: 110000 },
]

export const tabs = [
  { id: "summary", label: "Resumen" },
  { id: "discovery", label: "Descubrimiento" },
  { id: "scope", label: "Alcance" },
  { id: "similar", label: "Proyectos similares" },
  { id: "estimate", label: "Estimación" },
  { id: "price", label: "Precio" },
  { id: "risks", label: "Riesgos" },
  { id: "proposal", label: "Propuesta" },
  { id: "sow", label: "SOW" },
  { id: "activity", label: "Actividad" },
]

export const discoveryColumns = [
  { id: "goals", title: "Metas", items: [{ id: "g1", text: "Llenar entre semana, no solo el fin", at: 42 }, { id: "g2", text: "Que recepción deje de copiar el calendario a mano", at: 95 }] },
  { id: "pains", title: "Dolores", items: [{ id: "p1", text: "El formulario actual pierde solicitudes", at: 130 }, { id: "p2", text: "Nadie sabe qué habitación sigue libre", at: 160 }] },
  { id: "work", title: "Trabajo pedido", items: [{ id: "w1", text: "Sitio con ficha, fotos y calendario", at: 210 }, { id: "w2", text: "Aviso al correo de la casa", at: 240 }] },
  { id: "limits", title: "Límites", items: [{ id: "c1", text: "Quieren salir antes de la temporada de lluvias", at: 300 }, { id: "c2", text: "El presupuesto se dijo en voz baja", at: 340 }] },
]

export const crumbs = [
  { id: "studio", label: "Estudio Bruma", href: "#board" },
  { id: "deal", label: "Casa Nube" },
]
