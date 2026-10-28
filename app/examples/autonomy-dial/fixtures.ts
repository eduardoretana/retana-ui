import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ActionRisk, AutonomyAction, AutonomyDialLabels, AutonomyLevel } from "@/registry/ui/autonomy-dial"

export type ActionMeta = { pedido: string }

export type ActionSeed = {
  id: string
  risk: ActionRisk
  es: { label: string; detail: string }
  en: { label: string; detail: string }
}

export type DialFixture = {
  actions: readonly ActionSeed[]
  level: AutonomyLevel
  pinned: readonly string[]
  loading?: boolean
  banner?: { es: string; en: string }
  saveError?: { es: string; en: string }
  title: { es: string; en: string }
}

const actions: ActionSeed[] = [
  {
    id: "borrador",
    risk: "safe",
    es: { label: "Guardar la cotización como borrador", detail: "Solo el expediente del pedido PED-1048" },
    en: { label: "Save the quote as a draft", detail: "Only the file for order PED-1048" },
  },
  {
    id: "historial",
    risk: "safe",
    es: { label: "Leer el historial de Cerámica del Bajío", detail: "Pedidos y facturas de los últimos 90 días" },
    en: { label: "Read the Cerámica del Bajío history", detail: "Orders and invoices from the last 90 days" },
  },
  {
    id: "correo",
    risk: "guarded",
    es: { label: "Escribir a Mariana Ruiz", detail: "Un correo sobre las muestras de León" },
    en: { label: "Write to Mariana Ruiz", detail: "A note about the León samples" },
  },
  {
    id: "anticipo",
    risk: "destructive",
    es: { label: "Mandar el anticipo", detail: "$18,400.00 MXN desde la cuenta del taller" },
    en: { label: "Send the deposit", detail: "$18,400.00 MXN from the workshop account" },
  },
]

const title = { es: "Bruma en el taller", en: "Bruma in the workshop" }

export const filled: DialFixture = { actions, level: 1, pinned: [], title }

export const empty: DialFixture = { actions: [], level: 1, pinned: [], title: { es: "Agente sin acciones", en: "Agent with no actions" } }

export const loading: DialFixture = { ...filled, loading: true }

export const error: DialFixture = {
  ...filled,
  banner: {
    es: "No se guardó el nivel. Bruma sigue preguntando salvo en lo seguro.",
    en: "The level was not saved. Bruma still asks except for safe work.",
  },
  saveError: {
    es: "No se guardó el nivel. Bruma sigue preguntando salvo en lo seguro.",
    en: "The level was not saved. Bruma still asks except for safe work.",
  },
}

export const locked: DialFixture = { ...filled, level: 2, pinned: ["anticipo"] }

export const open: DialFixture = { ...filled, level: 2, pinned: [] }

export function dialLabels(locale: SceneLocale): Partial<AutonomyDialLabels> {
  if (locale === "en") return {}
  return {
    title: "Qué puede hacer sola",
    subtitle: "Lo seguro puede salir. Un candado siempre pregunta.",
    group: "Autonomía",
    level: (level) => ["Pregunta siempre", "Pregunta si no es seguro", "Actúa, salvo candados"][level] ?? "Pregunta siempre",
    levelDetail: (level) =>
      [
        "Cada acción espera a una persona.",
        "Lo seguro sigue. Lo delicado y lo destructivo preguntan.",
        "Las acciones siguen solas, salvo las que dejas con candado.",
      ][level] ?? "Cada acción espera a una persona.",
    runs: "Lo hace sola",
    asks: "Se detiene a preguntar",
    lock: (label) => `Preguntar siempre antes de ${label}`,
    unlock: (label) => `Dejar que ${label} siga el dial`,
    risk: (risk) => ({ safe: "Seguro", guarded: "Delicado", destructive: "Destructivo" })[risk],
    summary: (runs, asks) => `${runs} solas, ${asks} preguntan`,
    none: "Nada en este grupo",
    empty: "Este agente no tiene acciones que gobernar.",
    loading: "Cargando permisos",
    changed: (level, runs, asks) =>
      `${["Pregunta siempre", "Pregunta si no es seguro", "Actúa, salvo candados"][level]}. ${runs} solas, ${asks} preguntan.`,
  }
}

export function actionsFrom(seeds: readonly ActionSeed[], locale: SceneLocale): AutonomyAction<ActionMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    label: seed[locale].label,
    detail: seed[locale].detail,
    risk: seed.risk,
    meta: { pedido: "PED-1048" },
  }))
}
