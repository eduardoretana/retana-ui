import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DecisionChoice, DecisionInboxLabels, DecisionItem } from "@/registry/ui/decision-inbox"

export type DecisionMeta = { pedido: string }

export type ChoiceSeed = { id: string; es: string; en: string }

export type DecisionSeed = {
  id: string
  agent: string
  es: { title: string; detail: string }
  en: { title: string; detail: string }
  choices: readonly ChoiceSeed[]
  answerId?: string | null
}

export type InboxFixture = {
  items: readonly DecisionSeed[]
  loading?: boolean
  banner?: { es: string; en: string }
  answerError?: { es: string; en: string }
}

const anticipo: DecisionSeed = {
  id: "anticipo",
  agent: "Bruma",
  es: {
    title: "¿Mandamos el anticipo hoy?",
    detail: "Son $18,400.00 MXN a Cerámica del Bajío, pedido PED-1048.",
  },
  en: {
    title: "Do we send the deposit today?",
    detail: "$18,400.00 MXN to Cerámica del Bajío, order PED-1048.",
  },
  choices: [
    { id: "hoy", es: "Hoy, antes de las 18:00", en: "Today, before 6:00 p.m." },
    { id: "viernes", es: "Esperar al viernes", en: "Wait until Friday" },
  ],
}

const muestras: DecisionSeed = {
  id: "muestras",
  agent: "Horno",
  es: {
    title: "¿Quién recibe las muestras?",
    detail: "Salen hoy del taller hacia León.",
  },
  en: {
    title: "Who receives the samples?",
    detail: "They leave the workshop for León today.",
  },
  choices: [
    { id: "mariana", es: "Mariana Ruiz en León", en: "Mariana Ruiz in León" },
    { id: "taller", es: "El taller las guarda", en: "The workshop holds them" },
  ],
}

export const filled: InboxFixture = { items: [anticipo, muestras] }

export const empty: InboxFixture = { items: [] }

export const loading: InboxFixture = { ...filled, loading: true }

export const error: InboxFixture = {
  ...filled,
  banner: {
    es: "La respuesta no se guardó. La decisión sigue abierta.",
    en: "The answer was not saved. The call is still open.",
  },
  answerError: {
    es: "La respuesta no se guardó. La decisión sigue abierta.",
    en: "The answer was not saved. The call is still open.",
  },
}

export const answered: InboxFixture = {
  items: [{ ...anticipo, answerId: "viernes" }, muestras],
}

export const folded: InboxFixture = {
  items: [
    { ...anticipo, answerId: "viernes" },
    { ...muestras, answerId: "mariana" },
  ],
}

export function inboxLabels(locale: SceneLocale): Partial<DecisionInboxLabels> {
  if (locale === "en") return {}
  return {
    title: "Llamadas abiertas",
    open: (count) => (count === 1 ? "1 sigue abierta" : `${count} siguen abiertas`),
    empty: "Nada espera tu respuesta.",
    loading: "Cargando llamadas",
    answered: (choice) => `Respuesta: ${choice}`,
    dismiss: "Cerrar",
    dismissNamed: (title) => `Cerrar “${title}”`,
    choose: (title, choice) => `${choice} para “${title}”`,
    from: (agent) => `De ${agent}`,
  }
}

export function itemsFrom(
  seeds: readonly DecisionSeed[],
  locale: SceneLocale,
  answers: Record<string, string | null> = {},
  hidden: readonly string[] = [],
): DecisionItem<DecisionMeta>[] {
  return seeds
    .filter((seed) => !hidden.includes(seed.id))
    .map((seed) => ({
      id: seed.id,
      title: seed[locale].title,
      detail: seed[locale].detail,
      agent: seed.agent,
      answerId: answers[seed.id] ?? seed.answerId ?? null,
      meta: { pedido: "PED-1048" },
      choices: seed.choices.map((choice): DecisionChoice => ({ id: choice.id, label: choice[locale] })),
    }))
}
