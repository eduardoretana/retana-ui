import type { SceneLocale } from "@/app/catalog/scene-types"
import type { AgentGraphLabels, GraphKind, GraphLink, GraphNode, GraphPulse, GraphTone } from "@/registry/ui/agent-graph"

export type OrderMeta = { pedido: string }

export type GraphNodeSeed = {
  id: string
  kind: GraphKind
  pulse: GraphPulse
  column: number
  row: number
  meta?: OrderMeta
  es: { name: string; detail?: string }
  en: { name: string; detail?: string }
}

export type GraphLinkSeed = {
  id: string
  from: string
  to: string
  calls: number
  tone: GraphTone
}

export type GraphFixture = {
  nodes: readonly GraphNodeSeed[]
  links: readonly GraphLinkSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
}

const mariana: GraphNodeSeed = {
  id: "mariana",
  kind: "person",
  pulse: "quiet",
  column: 0,
  row: 1,
  meta: { pedido: "PED-1048" },
  es: { name: "Mariana Ruiz", detail: "Pidió el viernes 30 de octubre" },
  en: { name: "Mariana Ruiz", detail: "Asked for Friday 30 October" },
}

const bruma: GraphNodeSeed = {
  id: "bruma",
  kind: "agent",
  pulse: "working",
  column: 1,
  row: 0,
  es: { name: "Bruma" },
  en: { name: "Bruma" },
}

const horno: GraphNodeSeed = {
  id: "horno",
  kind: "agent",
  pulse: "working",
  column: 1,
  row: 1,
  es: { name: "Horno" },
  en: { name: "Horno" },
}

const caja: GraphNodeSeed = {
  id: "caja",
  kind: "agent",
  pulse: "waiting",
  column: 1,
  row: 2,
  es: { name: "Caja" },
  en: { name: "Caja" },
}

const expediente: GraphNodeSeed = {
  id: "expediente",
  kind: "tool",
  pulse: "quiet",
  column: 2,
  row: 0,
  es: { name: "Expediente" },
  en: { name: "Order file" },
}

const correo: GraphNodeSeed = {
  id: "correo",
  kind: "tool",
  pulse: "failed",
  column: 2,
  row: 2,
  es: { name: "Correo" },
  en: { name: "Mail" },
}

const links: GraphLinkSeed[] = [
  { id: "pide", from: "mariana", to: "bruma", calls: 1, tone: "call" },
  { id: "foto", from: "bruma", to: "horno", calls: 4, tone: "call" },
  { id: "anticipo", from: "bruma", to: "caja", calls: 2, tone: "answer" },
  { id: "archivo", from: "horno", to: "expediente", calls: 3, tone: "call" },
  { id: "celaya", from: "caja", to: "correo", calls: 2, tone: "blocked" },
]

export const filled: GraphFixture = {
  nodes: [mariana, bruma, horno, caja, expediente, correo],
  links,
}

export const empty: GraphFixture = { nodes: [], links: [] }

export const loading: GraphFixture = { ...filled, loading: true }

export const error: GraphFixture = {
  nodes: [],
  links: [],
  banner: {
    es: "No pudimos leer la red del taller. Intenta de nuevo en un momento.",
    en: "The workshop map could not be read. Try again in a moment.",
  },
}

export const waiting: GraphFixture = {
  nodes: [mariana, { ...bruma, pulse: "quiet" }, { ...caja, pulse: "waiting" }],
  links: [{ id: "anticipo", from: "bruma", to: "caja", calls: 1, tone: "answer" }],
}

export const blocked: GraphFixture = {
  nodes: [caja, { ...correo, pulse: "failed" }],
  links: [{ id: "celaya", from: "caja", to: "correo", calls: 3, tone: "blocked" }],
}

export function graphLabels(locale: SceneLocale): Partial<AgentGraphLabels> {
  if (locale === "en") return {}
  return {
    title: "Red del taller",
    agents: (count) => (count === 1 ? "1 agente" : `${count} agentes`),
    tools: (count) => (count === 1 ? "1 herramienta" : `${count} herramientas`),
    calls: (count) => (count === 1 ? "1 llamada" : `${count} llamadas`),
    kind: { person: "Persona", agent: "Agente", tool: "Herramienta" },
    pulse: { quiet: "En calma", working: "Trabajando", waiting: "Te espera", failed: "Falló" },
    tone: { call: "Llamada", answer: "Respuesta", blocked: "Bloqueada" },
    open: (name) => `Abrir ${name}`,
    link: (from, to, calls, tone) => `${from} hacia ${to}, ${calls} ${calls === 1 ? "llamada" : "llamadas"}, ${tone}`,
    busiest: (from, to, calls) => `El enlace más cargado: ${from} hacia ${to}, ${calls} llamadas`,
    empty: "Nadie está en la red.",
    loading: "Cargando la red",
  }
}

export function nodesFrom(seeds: readonly GraphNodeSeed[], locale: SceneLocale): GraphNode<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    name: seed[locale].name,
    kind: seed.kind,
    detail: seed[locale].detail,
    pulse: seed.pulse,
    column: seed.column,
    row: seed.row,
    meta: seed.meta,
  }))
}

export function linksFrom(seeds: readonly GraphLinkSeed[]): GraphLink[] {
  return seeds.map((seed) => ({ ...seed }))
}
