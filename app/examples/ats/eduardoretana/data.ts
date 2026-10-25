/**
 * Preset de demostración con la forma del proceso de eduardoretana.com.
 * Las etiquetas y las clases de insignia se observaron en la app pública.
 * Las personas, teléfonos y evaluaciones son inventados.
 *
 * En su stepper el paso Screening reutiliza la clave `application` y solo
 * cambia la etiqueta. Aquí Screening es una columna propia: «Sin iniciar»
 * queda en Postulación y «En curso» en Screening.
 * La etapa no se guarda. `retanaGetStage` la calcula, como su embudo.
 */

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

export const retanaNow = "2026-10-25T18:00:00.000Z"

export const RETANA_STAGE_IDS = [
  "application",
  "screening",
  "tech_test",
  "calculator",
  "interview",
  "registration",
  "vacancy",
  "psychometric",
  "review",
  "identity",
  "contracts",
  "adjudication",
  "hired",
  "not_apt",
  "rejected",
] as const

export type RetanaStageId = (typeof RETANA_STAGE_IDS)[number]

/** Etapas que en su contratación solo avanza el sistema. */
export const RETANA_SYSTEM_STAGE_IDS = ["psychometric", "identity", "contracts"] as const

export const RETANA_PUBLIC_IDS: readonly RetanaStageId[] = [
  "application",
  "screening",
  "tech_test",
  "calculator",
  "interview",
]

export const RETANA_HIRING_IDS: readonly RetanaStageId[] = [
  "registration",
  "vacancy",
  "psychometric",
  "review",
  "identity",
  "contracts",
  "adjudication",
  "hired",
]

const TEAL = "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
const SLATE = "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30"
const INDIGO = "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
const VIOLET = "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
const AMBER = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
const CYAN = "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
const BLUE = "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
const ORANGE = "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
const GREEN = "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30"
const EXIT = "bg-destructive/15 text-destructive border-destructive/30"

export const retanaStages: AtsStage[] = [
  { id: "application", label: "Postulación", className: TEAL },
  { id: "screening", label: "Screening", className: TEAL },
  { id: "tech_test", label: "Prueba técnica", className: TEAL },
  { id: "calculator", label: "Calculadora", className: TEAL },
  { id: "interview", label: "Entrevista", className: TEAL },
  { id: "registration", label: "Registro", className: SLATE },
  { id: "vacancy", label: "Vacante", className: INDIGO },
  { id: "psychometric", label: "Psicometría", className: VIOLET },
  { id: "review", label: "Revisión RH", className: AMBER },
  { id: "identity", label: "Identidad", className: CYAN },
  { id: "contracts", label: "Contratos", className: BLUE },
  { id: "adjudication", label: "Adjudicación", className: ORANGE },
  { id: "hired", label: "Contratado", className: GREEN },
  { id: "not_apt", label: "No apto", className: EXIT },
  { id: "rejected", label: "Rechazado", className: EXIT },
]

export type ScreeningStatus = "pending" | "in_progress" | "passed" | "failed"
export type AssessmentStatus = "not_started" | "submitted" | "scored"
export type CalculatorStatus = "locked" | "submitted" | "scored"
export type InterviewStatus = "pending" | "passed" | "failed" | "rejected"
export type ModuleStatus = "pending" | "completed" | null

/** Campos con la forma de sus tablas. La etapa no vive aquí. */
export type RetanaMeta = {
  track: "public" | "hiring"
  full_name: string
  email: string
  phone: string
  vacancy: { title: string; area: string }
  screening_status: ScreeningStatus
  screening_step?: number
  assessment_status?: AssessmentStatus
  assessment_score?: number | null
  calculator_status?: CalculatorStatus
  interview_status?: InterviewStatus
  final_verdict?: "hire" | "no_hire" | null
  score_stress_tolerance?: number | null
  score_empathy?: number | null
  score_digital_skills?: number | null
  score_closing_ability?: number | null
  score_organization?: number | null
  score_communication?: number | null
  score_learning_speed?: number | null
  score_volume_capacity?: number | null
  score_ai_proficiency?: number | null
  score_technical_exam?: number | null
  score_practical_exam?: number | null
  status?: "hired" | "rejected" | null
  eligibility_status?: "apt" | "not_apt" | "pending" | null
  psychometric_waived?: boolean
  module_vacancy_status?: ModuleStatus
  module_psychometric_status?: ModuleStatus
  module_contracts_status?: ModuleStatus
  wizard_step?: number
  identity_verified_at?: string | null
  identity_enabled?: boolean
  employment?: boolean
}

export const retanaCriteria: AtsCriterion[] = [
  { key: "criterio", label: "Criterio" },
  { key: "comunicacion", label: "Comunicación" },
  { key: "encaje", label: "Encaje con el equipo" },
  { key: "oficio", label: "Oficio" },
]

export const retanaPeople: AtsPerson[] = [
  { id: "marina", name: "Marina Solís", role: "Revisión RH" },
  { id: "ivan", name: "Iván Duarte", role: "Entrevista" },
  { id: "elena", name: "Elena Duarte", role: "Oficio" },
  { id: "hugo", name: "Hugo Belmar", role: "Encaje" },
  { id: "mesa", name: "Mesa Retana", role: "Quien evalúa" },
]

export const retanaJob: AtsJob = {
  id: "contrataciones",
  title: "Contrataciones",
  department: "Equipo Retana",
  location: "Ciudad de México",
  employment: "Varias vacantes",
  hiringManagerId: "mesa",
  status: "open",
  openedAt: "2026-10-01T15:00:00.000Z",
}

const FULLSTACK = { title: "Fullstack AI Developer", area: "Ingeniería" }
const CREATIVE = { title: "AI Creative Operator", area: "Contenido" }
const TRAFFICKER = { title: "Trafficker Digital Senior", area: "Medios" }

function isStage(id: string): id is RetanaStageId {
  return (RETANA_STAGE_IDS as readonly string[]).includes(id)
}

function doneAssessment(status: AssessmentStatus | undefined) {
  return status === "submitted" || status === "scored"
}

function doneCalculator(status: CalculatorStatus | undefined) {
  return status === "submitted" || status === "scored"
}

/** Embudo público. Un rechazo de screening o de entrevista sale a Rechazado. */
export function publicStage(meta: RetanaMeta): RetanaStageId {
  if (meta.screening_status === "failed") return "rejected"
  if (meta.interview_status === "failed" || meta.interview_status === "rejected") return "rejected"
  if (meta.screening_status === "in_progress") return "screening"
  if (meta.screening_status !== "passed") return "application"
  if (!doneAssessment(meta.assessment_status)) return "tech_test"
  if (!doneCalculator(meta.calculator_status)) return "calculator"
  return "interview"
}

/**
 * Contratación. Misma cadena que su etapa calculada:
 * contratado y rechazado salen primero, luego no apto, y el resto
 * depende de vacante, psicometría, elegibilidad, identidad y contratos.
 */
export function hiringStage(meta: RetanaMeta): RetanaStageId {
  if (meta.status === "hired") return "hired"
  if (meta.status === "rejected") return "rejected"
  if (meta.eligibility_status === "not_apt") return "not_apt"
  const waived = Boolean(meta.psychometric_waived)
  const vacancyDone = meta.module_vacancy_status === "completed"
  const psychoDone = waived || meta.module_psychometric_status === "completed"
  const apt = meta.eligibility_status === "apt"
  const identity = Boolean(meta.identity_verified_at) && meta.identity_enabled !== false
  const contractsDone = meta.module_contracts_status === "completed"
  const early = (meta.wizard_step ?? 1) < 7 && !vacancyDone && meta.module_psychometric_status !== "completed"
  if (early) return "registration"
  if (!vacancyDone) return "vacancy"
  if (!psychoDone) return "psychometric"
  if (!apt) return "review"
  if (!identity) return "identity"
  if (!contractsDone) return "contracts"
  return meta.employment ? "hired" : "adjudication"
}

export function retanaGetStage(candidate: AtsCandidate<RetanaMeta>): RetanaStageId {
  const meta = candidate.meta
  if (!meta) return "application"
  return meta.track === "hiring" ? hiringStage(meta) : publicStage(meta)
}

export function retanaCanMove(from: string, to: string) {
  if (from === to) return false
  if (!isStage(from) || !isStage(to)) return false
  if ((RETANA_SYSTEM_STAGE_IDS as readonly string[]).includes(from)) return false
  if ((RETANA_SYSTEM_STAGE_IDS as readonly string[]).includes(to)) return false
  return true
}

export function retanaTrackStages(stageId: string, stages: readonly AtsStage[]) {
  const ids: readonly string[] = (RETANA_HIRING_IDS as readonly string[]).includes(stageId)
    ? RETANA_HIRING_IDS
    : (RETANA_PUBLIC_IDS as readonly string[]).includes(stageId)
      ? RETANA_PUBLIC_IDS
      : [stageId]
  return stages.filter((stage) => ids.includes(stage.id))
}

const clearedHiring = {
  status: null,
  eligibility_status: null,
  psychometric_waived: false,
  module_vacancy_status: null,
  module_psychometric_status: null,
  module_contracts_status: null,
  wizard_step: 1,
  identity_verified_at: null,
  employment: false,
} satisfies Partial<RetanaMeta>

/** Reescribe las banderas para que `retanaGetStage` devuelva `to`. */
export function applyMove(meta: RetanaMeta, to: string): RetanaMeta {
  if (to === "application") {
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: "pending",
      assessment_status: "not_started",
      calculator_status: "locked",
      interview_status: "pending",
      final_verdict: null,
    }
  }
  if (to === "screening") {
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: "in_progress",
      screening_step: meta.screening_step && meta.screening_step > 0 ? meta.screening_step : 2,
      assessment_status: "not_started",
      calculator_status: "locked",
      interview_status: "pending",
      final_verdict: null,
    }
  }
  if (to === "tech_test") {
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: "passed",
      assessment_status: "not_started",
      calculator_status: "locked",
      interview_status: "pending",
      final_verdict: null,
    }
  }
  if (to === "calculator") {
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: "passed",
      assessment_status: "scored",
      calculator_status: "locked",
      interview_status: "pending",
      final_verdict: null,
    }
  }
  if (to === "interview") {
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: "passed",
      assessment_status: "scored",
      calculator_status: "scored",
      interview_status: "pending",
      final_verdict: null,
    }
  }
  if (to === "rejected") {
    if (meta.track === "hiring") {
      return { ...meta, track: "hiring", status: "rejected", eligibility_status: meta.eligibility_status === "not_apt" ? "pending" : meta.eligibility_status }
    }
    const passed = meta.screening_status === "passed"
    return {
      ...meta,
      ...clearedHiring,
      track: "public",
      screening_status: passed ? "passed" : "failed",
      interview_status: passed ? "failed" : "pending",
      final_verdict: passed ? "no_hire" : null,
    }
  }

  const hiring: RetanaMeta = {
    ...meta,
    ...clearedHiring,
    track: "hiring",
  }
  if (to === "registration") return { ...hiring, wizard_step: 2 }
  if (to === "vacancy") return { ...hiring, wizard_step: 7, module_vacancy_status: "pending", module_psychometric_status: "pending" }
  if (to === "psychometric") return { ...hiring, wizard_step: 7, module_vacancy_status: "completed", module_psychometric_status: "pending" }
  if (to === "review") {
    return { ...hiring, wizard_step: 7, module_vacancy_status: "completed", module_psychometric_status: "completed", eligibility_status: "pending" }
  }
  if (to === "not_apt") {
    return { ...hiring, wizard_step: 7, module_vacancy_status: "completed", module_psychometric_status: "completed", eligibility_status: "not_apt" }
  }
  if (to === "identity") {
    return {
      ...hiring,
      wizard_step: 7,
      module_vacancy_status: "completed",
      module_psychometric_status: "completed",
      eligibility_status: "apt",
      identity_verified_at: null,
    }
  }
  if (to === "contracts") {
    return {
      ...hiring,
      wizard_step: 7,
      module_vacancy_status: "completed",
      module_psychometric_status: "completed",
      eligibility_status: "apt",
      identity_verified_at: "2026-10-20T18:00:00.000Z",
      module_contracts_status: "pending",
    }
  }
  if (to === "adjudication") {
    return {
      ...hiring,
      wizard_step: 7,
      module_vacancy_status: "completed",
      module_psychometric_status: "completed",
      eligibility_status: "apt",
      identity_verified_at: "2026-10-20T18:00:00.000Z",
      module_contracts_status: "completed",
      employment: false,
    }
  }
  if (to === "hired") return { ...hiring, status: "hired" }
  return meta
}

export function retanaProcessLink(id: string) {
  return `https://eduardoretana.com/contrataciones/${id}`
}

export function retanaWhatsAppHref(candidate: AtsCandidate<RetanaMeta>) {
  const digits = (candidate.phone ?? candidate.meta?.phone ?? "").replace(/\D/g, "")
  if (!digits) return null
  const phone = digits.length === 10 ? `52${digits}` : digits
  const first = candidate.name.split(" ")[0] || candidate.name
  const text = `Hola ${first}, este es tu enlace personalizado para continuar tu proceso: ${retanaProcessLink(candidate.id)}`
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

const criterionLabel = Object.fromEntries(retanaCriteria.map((criterion) => [criterion.key, criterion.label])) as Record<string, string>

function line(key: string, rating: number, comment?: string): AtsCriterionRating {
  return { key, label: criterionLabel[key] ?? key, rating, comment }
}

function card(id: string, authorId: string, verdict: AtsVerdict, ratings: AtsCriterionRating[], createdAt: string): AtsScorecard {
  return {
    id,
    authorId,
    createdAt,
    stageId: "review",
    ...buildScorecard(ratings, verdict),
  }
}

const helenaCards: AtsScorecard[] = [
  card(
    "sc-marina",
    "marina",
    "strong_yes",
    [line("criterio", 5), line("comunicacion", 5), line("encaje", 4), line("oficio", 5, "Cierra un caso sin pedir la respuesta.")],
    "2026-10-22T16:00:00.000Z",
  ),
  card(
    "sc-ivan",
    "ivan",
    "yes",
    [line("criterio", 4), line("comunicacion", 4), line("encaje", 4), line("oficio", 5)],
    "2026-10-22T18:00:00.000Z",
  ),
  card(
    "sc-elena",
    "elena",
    "strong_yes",
    [line("criterio", 5), line("comunicacion", 4), line("encaje", 5), line("oficio", 4)],
    "2026-10-23T15:00:00.000Z",
  ),
  card(
    "sc-hugo",
    "hugo",
    "no",
    [line("criterio", 3), line("comunicacion", 3), line("encaje", 2, "Todavía no se ve cómo trabajaría con el equipo."), line("oficio", 3)],
    "2026-10-23T19:00:00.000Z",
  ),
]

function screeningLabel(meta: RetanaMeta) {
  if (meta.screening_status === "passed") return "Aprobado"
  if (meta.screening_status === "failed") return "Rechazado"
  if (meta.screening_status === "in_progress") return `En curso (paso ${meta.screening_step ?? 1}/3)`
  return "Sin iniciar"
}

function person(
  id: string,
  meta: RetanaMeta,
  extra: Partial<AtsCandidate<RetanaMeta>> = {},
): AtsCandidate<RetanaMeta> {
  const scores = [
    meta.assessment_score == null ? "" : `evaluación ${meta.assessment_score}`,
    meta.score_technical_exam == null ? "" : `técnica ${meta.score_technical_exam}`,
    meta.score_practical_exam == null ? "" : `práctica ${meta.score_practical_exam}`,
    meta.score_ai_proficiency == null ? "" : `IA ${meta.score_ai_proficiency}`,
    meta.score_communication == null ? "" : `comunicación ${meta.score_communication}`,
  ].filter(Boolean)
  return {
    id,
    name: meta.full_name,
    headline: meta.vacancy.title,
    email: meta.email,
    phone: meta.phone,
    location: "Ciudad de México",
    appliedAt: "2026-10-08T15:00:00.000Z",
    source: "inbound",
    tags: [
      { id: "area", label: meta.vacancy.area },
      { id: "screening", label: screeningLabel(meta) },
    ],
    applicationNote: scores.length ? `Puntajes automáticos: ${scores.join(", ")}.` : extra.applicationNote,
    ...extra,
    meta,
  }
}

export const retanaDebriefId = "helena"

export const retanaCandidates: AtsCandidate<RetanaMeta>[] = [
  person("ines", {
    track: "public",
    full_name: "Inés Calderón",
    email: "ines.calderon@example.com",
    phone: "55 1000 1001",
    vacancy: TRAFFICKER,
    screening_status: "pending",
    assessment_status: "not_started",
    calculator_status: "locked",
    interview_status: "pending",
  }, {
    appliedAt: "2026-10-24T15:00:00.000Z",
    source: "inbound",
    nextStep: { label: "Revisar postulación" },
  }),
  person("tomas", {
    track: "public",
    full_name: "Tomás Herrera",
    email: "tomas.herrera@example.com",
    phone: "55 1000 1002",
    vacancy: CREATIVE,
    screening_status: "in_progress",
    screening_step: 2,
    assessment_status: "not_started",
    calculator_status: "locked",
    interview_status: "pending",
    score_communication: 3,
  }, {
    appliedAt: "2026-10-18T15:00:00.000Z",
    nextStep: { label: "Screening, paso 2 de 3", at: "2026-10-27T17:00:00.000Z" },
  }),
  person("nadia", {
    track: "public",
    full_name: "Nadia Belmonte",
    email: "nadia.belmonte@example.com",
    phone: "55 1000 1003",
    vacancy: FULLSTACK,
    screening_status: "passed",
    assessment_status: "not_started",
    assessment_score: null,
    calculator_status: "locked",
    interview_status: "pending",
    score_technical_exam: null,
    score_ai_proficiency: 4,
  }, {
    years: 4,
    source: "sourced",
    nextStep: { label: "Prueba técnica", at: "2026-10-28T16:00:00.000Z" },
  }),
  person("omar", {
    track: "public",
    full_name: "Omar Quintero",
    email: "omar.quintero@example.com",
    phone: "55 1000 1004",
    vacancy: CREATIVE,
    screening_status: "passed",
    assessment_status: "scored",
    assessment_score: 4.2,
    calculator_status: "locked",
    interview_status: "pending",
    score_technical_exam: 4,
    score_practical_exam: 3,
    score_ai_proficiency: 5,
    score_digital_skills: 4,
  }, {
    years: 6,
    nextStep: { label: "Calculadora" },
  }),
  person("jimena", {
    track: "public",
    full_name: "Jimena Solís",
    email: "jimena.solis@example.com",
    phone: "55 1000 1005",
    vacancy: FULLSTACK,
    screening_status: "passed",
    assessment_status: "scored",
    assessment_score: 4,
    calculator_status: "scored",
    interview_status: "pending",
    final_verdict: null,
    score_technical_exam: 4,
    score_practical_exam: 4,
    score_learning_speed: 5,
  }, {
    years: 5,
    source: "referral",
    sourceDetail: "Mesa",
    nextStep: { label: "Entrevista", at: "2026-10-29T20:00:00.000Z" },
    interviews: [{ id: "meet-jimena", startsAt: "2026-10-29T20:00:00.000Z", kind: "Entrevista", interviewerIds: ["ivan"] }],
  }),
  person("raul", {
    track: "hiring",
    full_name: "Raúl Ceballos",
    email: "raul.ceballos@example.com",
    phone: "55 1000 1006",
    vacancy: TRAFFICKER,
    screening_status: "passed",
    assessment_status: "scored",
    calculator_status: "scored",
    interview_status: "passed",
    final_verdict: "hire",
    wizard_step: 3,
    module_vacancy_status: null,
    module_psychometric_status: null,
  }, {
    years: 7,
    appliedAt: "2026-09-20T15:00:00.000Z",
    nextStep: { label: "Terminar registro" },
  }),
  person("bruno", {
    track: "hiring",
    full_name: "Bruno Alcántara",
    email: "bruno.alcantara@example.com",
    phone: "55 1000 1007",
    vacancy: FULLSTACK,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "pending",
    module_psychometric_status: "pending",
    score_organization: 4,
  }, {
    years: 8,
    nextStep: { label: "Elegir vacante" },
  }),
  person("paola", {
    track: "hiring",
    full_name: "Paola Neri",
    email: "paola.neri@example.com",
    phone: "55 1000 1008",
    vacancy: CREATIVE,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "pending",
    psychometric_waived: false,
    score_stress_tolerance: null,
    score_empathy: null,
  }, {
    years: 3,
    nextStep: { label: "Psicometría en curso" },
  }),
  person("helena", {
    track: "hiring",
    full_name: "Helena Ibarra",
    email: "helena.ibarra@example.com",
    phone: "55 1000 1009",
    vacancy: FULLSTACK,
    screening_status: "passed",
    assessment_status: "scored",
    assessment_score: 4.1,
    calculator_status: "scored",
    interview_status: "passed",
    final_verdict: "hire",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "pending",
    score_communication: 4,
    score_organization: 5,
    score_empathy: 4,
    score_closing_ability: 4,
    score_volume_capacity: 3,
  }, {
    years: 6,
    ownerId: "marina",
    appliedAt: "2026-09-12T15:00:00.000Z",
    scorecards: helenaCards,
    nextStep: { label: "Debrief de revisión", at: "2026-10-24T18:00:00.000Z" },
    debrief: {
      ask: "¿Cómo decidiría un caso límite si la psicometría ya está cerrada?",
      askAuthorId: "marina",
    },
    notes: [{ id: "n-helena", authorId: "marina", body: "La psicometría ya cerró. Falta el voto de revisión.", createdAt: "2026-10-23T19:30:00.000Z" }],
    files: [{ id: "cv-helena", name: "helena-ibarra-cv.pdf", size: 180_000 }],
  }),
  person("ivette", {
    track: "hiring",
    full_name: "Ivette Kwan",
    email: "ivette.kwan@example.com",
    phone: "55 1000 1010",
    vacancy: TRAFFICKER,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "apt",
    identity_verified_at: null,
    identity_enabled: true,
  }, {
    years: 5,
    nextStep: { label: "Identidad pendiente" },
  }),
  person("sofia", {
    track: "hiring",
    full_name: "Sofía Belmar",
    email: "sofia.belmar@example.com",
    phone: "55 1000 1011",
    vacancy: FULLSTACK,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "apt",
    identity_verified_at: "2026-10-18T18:00:00.000Z",
    module_contracts_status: "pending",
  }, {
    years: 9,
    nextStep: { label: "Contratos en curso" },
  }),
  person("diego", {
    track: "hiring",
    full_name: "Diego Armenta",
    email: "diego.armenta@example.com",
    phone: "55 1000 1012",
    vacancy: CREATIVE,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "apt",
    identity_verified_at: "2026-10-10T18:00:00.000Z",
    module_contracts_status: "completed",
    employment: false,
  }, {
    years: 4,
    nextStep: { label: "Adjudicación" },
  }),
  person("regina", {
    track: "hiring",
    full_name: "Regina Olmos",
    email: "regina.olmos@example.com",
    phone: "55 1000 1013",
    vacancy: FULLSTACK,
    screening_status: "passed",
    status: "hired",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "apt",
    identity_verified_at: "2026-09-28T18:00:00.000Z",
    module_contracts_status: "completed",
    employment: true,
  }, {
    years: 7,
    appliedAt: "2026-08-15T15:00:00.000Z",
    nextStep: { label: "Contratada" },
  }),
  person("lazaro", {
    track: "hiring",
    full_name: "Lázaro Ferrer",
    email: "lazaro.ferrer@example.com",
    phone: "55 1000 1014",
    vacancy: TRAFFICKER,
    screening_status: "passed",
    wizard_step: 7,
    module_vacancy_status: "completed",
    module_psychometric_status: "completed",
    eligibility_status: "not_apt",
  }, {
    years: 2,
    appliedAt: "2026-09-02T15:00:00.000Z",
    nextStep: { label: "No apto" },
  }),
  person("vera", {
    track: "public",
    full_name: "Vera Mondragón",
    email: "vera.mondragon@example.com",
    phone: "55 1000 1015",
    vacancy: CREATIVE,
    screening_status: "failed",
    assessment_status: "not_started",
    calculator_status: "locked",
    interview_status: "pending",
  }, {
    appliedAt: "2026-10-11T15:00:00.000Z",
    nextStep: { label: "Screening rechazado" },
  }),
]
