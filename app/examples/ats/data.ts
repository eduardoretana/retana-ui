"use client"

import {
  buildScorecard,
  type AtsCandidate,
  type AtsCriterion,
  type AtsCriterionRating,
  type AtsJob,
  type AtsPerson,
  type AtsScorecard,
  type AtsStage,
  type AtsVerdict,
} from "@/registry/lib/ats"

export const demoNow = "2026-10-25T18:00:00.000Z"

export type NubeStatus = "postulacion" | "filtro" | "entrevista" | "onsite" | "oferta"

export type NubeMeta = { status: NubeStatus }

export const demoStages: AtsStage[] = [
  { id: "postulacion", label: "Periodo de postulación", tone: "neutral" },
  { id: "filtro", label: "Filtro", tone: "info" },
  { id: "entrevista", label: "Entrevista", tone: "warning", className: "bg-accent text-accent-foreground" },
  { id: "onsite", label: "Onsite", tone: "accent" },
  { id: "oferta", label: "Oferta", tone: "positive" },
]

export const demoCriteria: AtsCriterion[] = [
  { key: "educacion", label: "Educación relevante" },
  { key: "experiencia", label: "Experiencia" },
  { key: "oficio", label: "Oficio" },
  { key: "comunicacion", label: "Comunicación" },
  { key: "sistemas", label: "Pensamiento de sistemas" },
]

export const demoPeople: AtsPerson[] = [
  { id: "nuria", name: "Nuria Soler", role: "Gerente de contratación" },
  { id: "mateo", name: "Mateo Ibarra", role: "Diseño de producto" },
  { id: "dalia", name: "Dalia Cruz", role: "Sistemas" },
  { id: "felix", name: "Félix Romo", role: "Ejercicio de producto" },
  { id: "mesa", name: "Mesa Nube", role: "Quien evalúa" },
]

export const demoJob: AtsJob = {
  id: "nube-diseno",
  title: "Diseñador de producto senior",
  department: "Diseño",
  location: "Remoto, México",
  employment: "Tiempo completo",
  hiringManagerId: "nuria",
  status: "open",
  openedAt: "2026-10-13T15:00:00.000Z",
  goalAt: "2026-11-30T18:00:00.000Z",
  hired: 1,
  headcount: 2,
}

export function demoGetStage(candidate: AtsCandidate<NubeMeta>) {
  return candidate.meta?.status ?? "postulacion"
}

export function demoCanMove(from: string, to: string) {
  const order = demoStages.map((stage) => stage.id)
  const start = order.indexOf(from)
  const end = order.indexOf(to)
  if (start < 0 || end < 0) return false
  return Math.abs(start - end) === 1
}

const labels = Object.fromEntries(demoCriteria.map((criterion) => [criterion.key, criterion.label])) as Record<string, string>

function line(key: string, rating: number, comment?: string): AtsCriterionRating {
  return { key, label: labels[key] ?? key, rating, comment }
}

function card(
  id: string,
  authorId: string,
  verdict: AtsVerdict,
  ratings: AtsCriterionRating[],
  createdAt = "2026-10-22T16:00:00.000Z",
): AtsScorecard {
  return {
    id,
    authorId,
    createdAt,
    stageId: "entrevista",
    ...buildScorecard(ratings, verdict),
  }
}

const camilaCards: AtsScorecard[] = [
  card("sc-mateo", "mateo", "strong_yes", [
    line("educacion", 5),
    line("experiencia", 5),
    line("oficio", 5),
    line("comunicacion", 5),
    line("sistemas", 4, "Sabe explicar un flujo, no todavía un sistema."),
  ]),
  card("sc-nuria", "nuria", "yes", [
    line("educacion", 5),
    line("experiencia", 5),
    line("oficio", 4),
    line("comunicacion", 5),
    line("sistemas", 4),
  ], "2026-10-22T18:00:00.000Z"),
  card("sc-dalia", "dalia", "yes", [
    line("educacion", 5),
    line("experiencia", 4),
    line("oficio", 4),
    line("comunicacion", 5),
    line("sistemas", 4),
  ], "2026-10-23T15:00:00.000Z"),
  card("sc-felix", "felix", "no", [
    line("educacion", 4),
    line("experiencia", 3),
    line("oficio", 4),
    line("comunicacion", 4),
    line("sistemas", 2, "El ejercicio se quedó en una sola superficie."),
  ], "2026-10-23T19:00:00.000Z"),
]

function quick(id: string, authorId: string, rating: number, verdict: AtsVerdict = "yes"): AtsScorecard {
  return card(id, authorId, verdict, [line("oficio", rating)])
}

function person(
  id: string,
  name: string,
  status: NubeStatus,
  extra: Partial<AtsCandidate<NubeMeta>> = {},
): AtsCandidate<NubeMeta> {
  return {
    id,
    name,
    appliedAt: "2026-10-08T15:00:00.000Z",
    source: "inbound",
    ...extra,
    meta: { status, ...(extra.meta ?? {}) },
  }
}

export const demoCandidates: AtsCandidate<NubeMeta>[] = [
  person("camila", "Camila Ríos", "entrevista", {
    headline: "Diseñadora de producto",
    location: "Guadalajara",
    years: 6,
    email: "camila.rios@example.com",
    phone: "+52 33 0000 0000",
    source: "referral",
    sourceDetail: "Nuria",
    ownerId: "nuria",
    notice: "Un mes",
    tags: [
      { id: "ref", label: "Referido · Nuria" },
      { id: "port", label: "Portafolio" },
    ],
    appliedAt: "2026-10-02T15:00:00.000Z",
    nextStep: { label: "Debrief listo", at: "2026-10-24T18:00:00.000Z" },
    scorecards: camilaCards,
    education: [{ id: "udg", school: "Universidad de Guadalajara", degree: "Diseño industrial", years: "2014–2018" }],
    notes: [{ id: "n1", authorId: "dalia", body: "Pide un caso con más de un producto.", createdAt: "2026-10-23T19:30:00.000Z" }],
    files: [{ id: "cv", name: "camila-rios-cv.pdf", size: 240_000 }],
    activity: [{ id: "a1", authorId: "nuria", body: "Pasó el filtro de portafolio.", createdAt: "2026-10-06T16:00:00.000Z" }],
    applicationNote: "Quiero armar el sistema de diseño del taller, no solo las pantallas de un lanzamiento.",
    debrief: {
      ask: "¿Cómo crecería el sistema si el producto deja de ser uno solo?",
      askAuthorId: "dalia",
    },
  }),
  person("hugo", "Hugo Beltrán", "oferta", {
    location: "Monterrey",
    years: 8,
    source: "referral",
    sourceDetail: "Mateo",
    ownerId: "mateo",
    tags: [{ id: "ref", label: "Referido" }],
    nextStep: { label: "Oferta enviada", at: "2026-10-20T15:00:00.000Z" },
    scorecards: [quick("sc-hugo", "nuria", 5, "strong_yes")],
    appliedAt: "2026-09-28T15:00:00.000Z",
  }),
  person("amina", "Amina Okonkwo", "entrevista", {
    location: "Ciudad de México",
    years: 5,
    source: "sourced",
    ownerId: "mateo",
    nextStep: { label: "Panel", at: "2026-10-29T20:00:00.000Z" },
    scorecards: [quick("sc-amina", "mateo", 4)],
  }),
  person("ivan", "Iván Paredes", "entrevista", {
    location: "Puebla",
    years: 9,
    source: "inbound",
    ownerId: "nuria",
    nextStep: { label: "Revisión de portafolio", at: "2026-10-30T16:30:00.000Z" },
    scorecards: [quick("sc-ivan", "dalia", 4)],
  }),
  person("noor", "Noor El-Sayed", "filtro", {
    location: "Mérida",
    years: 4,
    source: "inbound",
    ownerId: "nuria",
    nextStep: { label: "Llamada de filtro", at: "2026-10-27T22:00:00.000Z" },
    scorecards: [quick("sc-noor", "nuria", 4)],
  }),
  person("renata", "Renata Kovács", "filtro", {
    location: "Querétaro",
    years: 6,
    source: "agency",
    ownerId: "nuria",
    nextStep: { label: "Esperando respuesta", at: "2026-10-23T18:00:00.000Z" },
    scorecards: [quick("sc-renata", "felix", 4)],
  }),
  person("saul", "Saúl Mendes", "filtro", {
    location: "Oaxaca",
    years: 3,
    source: "inbound",
    ownerId: "mateo",
    nextStep: { label: "Llamada de filtro", at: "2026-10-30T21:00:00.000Z" },
    scorecards: [quick("sc-saul", "mateo", 3)],
  }),
  person("paz", "Paz Romero", "onsite", {
    location: "Ciudad de México",
    years: 7,
    source: "sourced",
    ownerId: "dalia",
    nextStep: { label: "Visita al taller", at: "2026-10-28T17:00:00.000Z" },
    scorecards: [quick("sc-paz", "nuria", 4, "yes")],
  }),
  person("yara", "Yara Benali", "postulacion", {
    location: "Toluca",
    years: 5,
    source: "inbound",
    ownerId: "nuria",
    nextStep: { label: "Revisar CV" },
    appliedAt: "2026-10-24T15:00:00.000Z",
  }),
  person("oscar", "Óscar Palma", "postulacion", {
    location: "Guadalajara",
    years: 8,
    source: "referral",
    ownerId: "felix",
    tags: [{ id: "ref", label: "Referido" }],
    nextStep: { label: "Revisar CV" },
    appliedAt: "2026-10-21T15:00:00.000Z",
  }),
  person("luz", "Luz Ferrer", "entrevista", {
    location: "León",
    years: 4,
    source: "agency",
    ownerId: "nuria",
    nextStep: { label: "Esperando feedback" },
  }),
  person("teo", "Teo Lang", "filtro", {
    location: "Cancún",
    years: 2,
    source: "inbound",
    ownerId: "mateo",
    nextStep: { label: "Revisar CV" },
  }),
]

export function manyCandidates(count = 200): AtsCandidate<NubeMeta>[] {
  return Array.from({ length: count }, (_, index) => {
    const stage = demoStages[index % demoStages.length]!.id as NubeStatus
    const scored = index % 4 !== 0
    return person(`lote-${index + 1}`, `Candidato ${index + 1}`, stage, {
      location: "Ciudad de México",
      years: (index % 12) + 1,
      source: index % 2 === 0 ? "inbound" : "sourced",
      scorecards: scored ? [quick(`lote-sc-${index}`, "nuria", (index % 5) + 1)] : [],
    })
  })
}
