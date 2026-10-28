import type { SceneLocale } from "@/app/catalog/scene-types"
import type { Attempt, AttemptStatus, ParallelAttemptsLabels } from "@/registry/ui/parallel-attempts"

export type OrderMeta = { pedido: string }

export type AttemptSeed = {
  id: string
  agent: string
  status: AttemptStatus
  progress: number
  score?: number
  meta?: OrderMeta
  es: { approach: string; note?: string }
  en: { approach: string; note?: string }
}

export type AttemptFixture = {
  task: { es: string; en: string }
  seeds: readonly AttemptSeed[]
  pickedId?: string | null
  loading?: boolean
  banner?: { es: string; en: string }
  pickError?: { es: string; en: string }
}

const task = {
  es: "La nota para Celaya del pedido PED-990. El correo de esa ciudad no salió.",
  en: "The Celaya note for order PED-990. Mail to that city did not go out.",
}

const bruma: AttemptSeed = {
  id: "corta",
  agent: "Bruma",
  status: "done",
  progress: 1,
  score: 86,
  meta: { pedido: "PED-990" },
  es: { approach: "Nota corta para Celaya", note: "Dice el viernes y el anticipo de $18,400.00 MXN." },
  en: { approach: "Short note for Celaya", note: "It names Friday and the $18,400.00 MXN deposit." },
}

const horno: AttemptSeed = {
  id: "foto",
  agent: "Horno",
  status: "running",
  progress: 0.62,
  es: { approach: "Nota con la foto del horno", note: "Todavía está pegando la foto del horno 2." },
  en: { approach: "Note with the kiln photo", note: "The kiln 2 photo is still being attached." },
}

const caja: AttemptSeed = {
  id: "precio",
  agent: "Caja",
  status: "done",
  progress: 1,
  score: 74,
  es: { approach: "Nota con el precio nuevo", note: "Repite el anticipo y no dice la fecha." },
  en: { approach: "Note with the new price", note: "It repeats the deposit and skips the date." },
}

export const filled: AttemptFixture = { task, seeds: [bruma, horno, caja] }

export const empty: AttemptFixture = { task: { es: "", en: "" }, seeds: [] }

export const loading: AttemptFixture = { ...filled, loading: true }

export const error: AttemptFixture = {
  task: { es: "", en: "" },
  seeds: [],
  banner: {
    es: "No pudimos leer los intentos. Intenta de nuevo en un momento.",
    en: "The attempts could not be read. Try again in a moment.",
  },
}

export const picked: AttemptFixture = { ...filled, pickedId: "corta" }

export const tied: AttemptFixture = {
  task,
  seeds: [
    { ...bruma, score: 80, es: { ...bruma.es, note: "Misma claridad que la de Caja." }, en: { ...bruma.en, note: "As clear as Caja's note." } },
    { ...caja, score: 80 },
  ],
}

export const failed: AttemptFixture = {
  task,
  seeds: [
    bruma,
    {
      ...caja,
      status: "failed",
      progress: 0.4,
      score: undefined,
      es: { approach: "Nota con el precio nuevo", note: "El correo de Celaya no abrió." },
      en: { approach: "Note with the new price", note: "The Celaya mail did not open." },
    },
  ],
  pickError: {
    es: "No se guardó la elección. La nota sigue sin dueño.",
    en: "The choice was not saved. The note still has no owner.",
  },
}

export function attemptLabels(locale: SceneLocale): Partial<ParallelAttemptsLabels> {
  if (locale === "en") return {}
  return {
    title: "La misma nota, de varias maneras",
    done: (done, total) => `${done} de ${total} terminados`,
    status: { running: "En curso", done: "Terminado", failed: "Falló" },
    ahead: "Va adelante",
    tied: "Empate",
    chosen: "Quedó",
    score: (score) => `Puntaje ${score}`,
    pick: "Quedarme con este",
    pickNamed: (approach) => `Quedarme con “${approach}”`,
    progress: (approach, percent) => `${approach}, ${percent}%`,
    empty: "Nadie está probando esta nota.",
    loading: "Cargando los intentos",
    picked: (approach) => `Te quedaste con “${approach}”`,
  }
}

export function attemptsFrom(seeds: readonly AttemptSeed[], locale: SceneLocale): Attempt<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    agent: seed.agent,
    approach: seed[locale].approach,
    status: seed.status,
    progress: seed.progress,
    score: seed.score,
    note: seed[locale].note,
    meta: seed.meta,
  }))
}
