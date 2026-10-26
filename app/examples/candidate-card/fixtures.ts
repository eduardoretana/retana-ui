import { buildScorecard, type AtsCandidate, type AtsScorecard, type AtsStage } from "@/registry/lib/ats"

/**
 * Host payload. The card never reads `meta`; the scene passes `stageId`.
 */
export type TallerMeta = {
  status: "postulacion" | "filtro" | "entrevista" | "oferta"
  taller: string
}

export const stages: AtsStage[] = [
  { id: "postulacion", label: "Postulación" },
  { id: "filtro", label: "Filtro" },
  { id: "entrevista", label: "Entrevista" },
  { id: "oferta", label: "Oferta" },
]

export const stagesEn: AtsStage[] = [
  { id: "postulacion", label: "Applied" },
  { id: "filtro", label: "Screen" },
  { id: "entrevista", label: "Interview" },
  { id: "oferta", label: "Offer" },
]

const taller = "Taller Ladrillo"

function card(id: string, ratings: { key: string; label: string; rating: number; comment?: string }[], verdict: "yes" | "strong_yes"): AtsScorecard {
  return {
    id,
    authorId: "nuria",
    createdAt: "2026-10-24T18:00:00.000Z",
    stageId: "entrevista",
    ...buildScorecard(ratings, verdict),
  }
}

const marianaScore = card("sc-mariana", [
  { key: "oficio", label: "Oficio", rating: 5, comment: "El portafolio del taller se entiende en un minuto." },
  { key: "sistemas", label: "Sistemas", rating: 4 },
], "yes")

/** Follow-up evaluation the host adds from the card. */
export const followUpScorecard: AtsScorecard = card(
  "sc-seguimiento",
  [{ key: "oficio", label: "Oficio", rating: 5, comment: "La visita del sábado confirmó el criterio." }],
  "strong_yes",
)

/** Mariana, referred three days ago, sitting in Entrevista with a 4.5. */
export const filled: AtsCandidate<TallerMeta> = {
  id: "mariana",
  name: "Mariana Cuevas",
  headline: "Diseñadora de producto",
  location: "Guadalajara",
  years: 6,
  email: "mariana.cuevas@example.com",
  phone: "+52 33 1840 2201",
  appliedAt: "2026-10-23T18:00:00.000Z",
  source: "referral",
  sourceDetail: "Nuria Soler",
  ownerId: "nuria",
  tags: [
    { id: "ref", label: "Referida · Nuria" },
    { id: "port", label: "Portafolio" },
  ],
  scorecards: [marianaScore],
  meta: { status: "entrevista", taller },
}

/** Diego applied today. No score, no tags, first stage. */
export const empty: AtsCandidate<TallerMeta> = {
  id: "diego",
  name: "Diego Salas",
  headline: "Postulación nueva",
  location: "León",
  appliedAt: "2026-10-26T18:00:00.000Z",
  source: "inbound",
  meta: { status: "postulacion", taller },
}

/** The record that appears once the board finishes loading. */
export const loading: AtsCandidate<TallerMeta> = filled

/** Same card as filled. The first move fails and rolls back. */
export const error: AtsCandidate<TallerMeta> = filled

/** Renata is already at offer, with a strong yes on file. */
export const offer: AtsCandidate<TallerMeta> = {
  id: "renata",
  name: "Renata Vidal",
  headline: "Directora de diseño",
  location: "Ciudad de México",
  years: 11,
  appliedAt: "2026-10-09T18:00:00.000Z",
  source: "sourced",
  tags: [{ id: "carta", label: "Carta lista · $72,000 MXN" }],
  scorecards: [
    card("sc-renata", [
      { key: "oficio", label: "Oficio", rating: 5 },
      { key: "sistemas", label: "Sistemas", rating: 5, comment: "Armó el sistema de dos líneas de producto." },
    ], "strong_yes"),
  ],
  meta: { status: "oferta", taller },
}

export function canMove(from: string, to: string) {
  const order = stages.map((stage) => stage.id)
  const start = order.indexOf(from)
  const end = order.indexOf(to)
  if (start < 0 || end < 0) return false
  return Math.abs(start - end) === 1
}
