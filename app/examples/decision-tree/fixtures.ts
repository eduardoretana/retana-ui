import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DecisionChoice, DecisionFork, DecisionTreeLabels } from "@/registry/ui/decision-tree"

export type OrderMeta = { pedido: string }

type OptionSeed = {
  id: string
  risk?: "low" | "high"
  preferred?: boolean
  nextId?: string
  es: { title: string; detail?: string }
  en: { title: string; detail?: string }
}

type ForkSeed = {
  id: string
  es: { prompt: string; detail?: string }
  en: { prompt: string; detail?: string }
  options: readonly OptionSeed[]
}

export type TreeFixture = {
  seeds: readonly ForkSeed[]
  path?: { es: readonly DecisionChoice[]; en: readonly DecisionChoice[] }
  loading?: boolean
  banner?: { es: string; en: string }
}

const horno: ForkSeed = {
  id: "horno",
  es: {
    prompt: "El horno 2 no enciende. ¿Qué hacemos con el viernes?",
    detail: "Pedido PED-1048. Mariana Ruiz espera la pieza el viernes 30 de octubre.",
  },
  en: {
    prompt: "Kiln 2 will not light. What do we do about Friday?",
    detail: "Order PED-1048. Mariana Ruiz expects the piece on Friday 30 October.",
  },
  options: [
    {
      id: "posponer",
      risk: "low",
      preferred: true,
      nextId: "aviso",
      es: {
        title: "Mover la entrega al lunes 2 de noviembre",
        detail: "El esmalte cobalto se queda en el horno 2.",
      },
      en: {
        title: "Move the delivery to Monday 2 November",
        detail: "The cobalt glaze stays in kiln 2.",
      },
    },
    {
      id: "horno1",
      risk: "high",
      es: {
        title: "Quemar en el horno 1",
        detail: "El esmalte cobalto sale distinto.",
      },
      en: {
        title: "Fire in kiln 1",
        detail: "The cobalt glaze comes out different.",
      },
    },
  ],
}

const aviso: ForkSeed = {
  id: "aviso",
  es: { prompt: "¿Avisamos hoy a Mariana Ruiz?", detail: "Está en León y espera la pieza del viernes." },
  en: { prompt: "Do we tell Mariana Ruiz today?", detail: "She is in León and expects Friday's piece." },
  options: [
    {
      id: "hoy",
      es: { title: "Avisar a Mariana Ruiz hoy", detail: "León, por la tarde." },
      en: { title: "Tell Mariana Ruiz today", detail: "León, in the afternoon." },
    },
    {
      id: "manana",
      es: { title: "Esperar a mañana", detail: "La nota sale con el correo de la mañana." },
      en: { title: "Wait until tomorrow", detail: "The note goes out with the morning mail." },
    },
  ],
}

export const filled: TreeFixture = { seeds: [horno, aviso] }

export const empty: TreeFixture = { seeds: [] }

export const loading: TreeFixture = { ...filled, loading: true }

export const error: TreeFixture = {
  seeds: [horno, aviso],
  banner: {
    es: "No se guardó el camino. La decisión sigue abierta.",
    en: "The path was not saved. The decision is still open.",
  },
}

const takenPath: readonly DecisionChoice[] = [{ forkId: "horno", optionId: "posponer" }]

export const taken: TreeFixture = {
  seeds: [horno, aviso],
  path: { es: takenPath, en: takenPath },
}

export const written: TreeFixture = {
  seeds: [horno, aviso],
  path: {
    es: [{ forkId: "horno", custom: "Dejar la pieza en el horno 2 y llamar a Mariana el jueves." }],
    en: [{ forkId: "horno", custom: "Leave the piece in kiln 2 and call Mariana on Thursday." }],
  },
}

export function treeLabels(locale: SceneLocale): Partial<DecisionTreeLabels> {
  if (locale === "en") return {}
  return {
    title: "Qué camino",
    waiting: (count) => (count === 1 ? "1 decisión abierta" : `${count} decisiones abiertas`),
    done: "Camino elegido",
    preferred: "El agente elegiría esta",
    risk: { low: "Poco en juego", high: "Difícil de deshacer" },
    path: "Camino hasta ahora",
    choose: (title) => `Elegir “${title}”`,
    custom: "Escribir otro camino",
    customNamed: "Otro camino",
    write: "Usar esta redacción",
    empty: "Nada está esperando una decisión.",
    loading: "Cargando las decisiones",
    chose: (title) => `Elegiste “${title}”`,
    wrote: (text) => `Escribiste “${text}”`,
  }
}

export function forksFrom(seeds: readonly ForkSeed[], locale: SceneLocale): DecisionFork<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    prompt: seed[locale].prompt,
    detail: seed[locale].detail,
    options: seed.options.map((option) => ({
      id: option.id,
      title: option[locale].title,
      detail: option[locale].detail,
      risk: option.risk,
      preferred: option.preferred,
      nextId: option.nextId,
      meta: { pedido: "PED-1048" },
    })),
  }))
}
