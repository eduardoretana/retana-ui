import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DecisionChoice, DecisionInboxLabels, DecisionItem } from "@/registry/ui/decision-inbox"

import data from "../../../fixtures/decision-inbox.json"

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

const seeds = data.items as DecisionSeed[]

function scene(id: keyof typeof data.scenes): InboxFixture {
  const spec = data.scenes[id]
  return {
    items: spec.items.map((ref) => {
      const seed = seeds.find((item) => item.id === ref.id)
      if (!seed) throw new Error(ref.id)
      return { ...seed, answerId: "answerId" in ref ? ref.answerId : seed.answerId }
    }),
    loading: "loading" in spec ? spec.loading : undefined,
    banner: "error" in spec && spec.error ? data.banner : undefined,
    answerError: "error" in spec && spec.error ? data.banner : undefined,
  }
}

export const filled = scene("filled")
export const empty = scene("empty")
export const loading = scene("loading")
export const error = scene("error")
export const answered = scene("answered")
export const folded = scene("folded")

function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""))
}

export function inboxLabels(locale: SceneLocale): Partial<DecisionInboxLabels> {
  const pack = data.labels[locale]
  if (locale === "en") return {}
  return {
    title: pack.title,
    open: (count) => (count === 1 ? pack.openOne : fill(pack.openOther, { count })),
    empty: pack.empty,
    loading: pack.loading,
    answered: (choice) => fill(pack.answered, { choice }),
    dismiss: pack.dismiss,
    dismissNamed: (title) => fill(pack.dismissNamed, { title }),
    choose: (title, choice) => fill(pack.choose, { choice, title }),
    from: (agent) => fill(pack.from, { agent }),
  }
}

export function itemsFrom(
  source: readonly DecisionSeed[],
  locale: SceneLocale,
  answers: Record<string, string | null> = {},
  hidden: readonly string[] = [],
): DecisionItem<DecisionMeta>[] {
  return source
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
