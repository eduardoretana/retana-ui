import type { SceneLocale } from "@/app/catalog/scene-types"
import {
  applyContextEvent,
  emptyContextModel,
  type ContextEvent,
  type ContextSource,
  type ContextStatus,
  type ContextWindowModel,
  type PricingLike,
} from "@/registry/lib/context-window"
import type { ContextActivity } from "@/registry/ui/context-window"

export const MODEL_LIMIT = 80_000

export const workshopPricing: PricingLike = {
  inputPerMillion: 3,
  outputPerMillion: 15,
  cacheReadPerMillion: 0.3,
  cacheWritePerMillion: 3.75,
}

export const warnAt = { unit: "percent" as const, value: 75 }
export const compactAt = { unit: "percent" as const, value: 90 }

export type SourceSeed = {
  id: string
  kind: string
  tokens: number
  status?: ContextStatus
  cached?: boolean
  cacheTokens?: number
  pinned?: boolean
  summaryOf?: string
  es: string
  en: string
}

export type WindowFixture = {
  seeds: readonly SourceSeed[]
  loading?: boolean
  error?: { es: string; en: string }
  activity?: ContextActivity
  caption?: { es: string; en: string }
  tooltip?: { es: string; en: string }
}

function seed(id: string, kind: string, tokens: number, es: string, en: string, extra: Omit<SourceSeed, "id" | "kind" | "tokens" | "es" | "en"> = {}): SourceSeed {
  return { id, kind, tokens, es, en, ...extra }
}

const workshop: SourceSeed[] = [
  seed("sistema", "system", 2400, "Instrucciones del taller", "Workshop instructions", { pinned: true }),
  seed("herramientas", "tools", 3100, "Herramientas del horno", "Kiln tools", { pinned: true }),
  seed("turno", "memory-short", 1800, "Turno de hoy", "Today's shift"),
  seed("pedidos", "memory-mid", 4200, "Pedidos de la semana", "This week's orders"),
  seed("recetas", "memory-long", 6400, "Recetas de esmalte", "Glaze recipes", { cached: true, cacheTokens: 6400 }),
  seed("ficha", "rag", 8600, "Ficha del horno 2", "Kiln 2 sheet", { cached: true, cacheTokens: 4000 }),
  seed("foto", "file", 2200, "Foto del horno 2", "Photo of kiln 2"),
  seed("charla", "chat", 12800, "Charla del pedido", "Order chat"),
]

function withChat(tokens: number, extra: Omit<SourceSeed, "id" | "kind" | "tokens" | "es" | "en"> = {}): SourceSeed[] {
  return workshop.map((item) => (item.id === "charla" ? { ...item, tokens, ...extra } : item))
}

const task = { es: "Tarea: ver por qué el horno 2 no enciende.", en: "Task: find out why kiln 2 will not light." }
const readingTip = { es: "Leyendo la ficha", en: "Reading the sheet" }

export const filled: WindowFixture = {
  seeds: workshop,
  caption: task,
  tooltip: readingTip,
}

export const empty: WindowFixture = { seeds: [], caption: task, tooltip: readingTip }

export const loading: WindowFixture = { ...filled, loading: true }

export const error: WindowFixture = {
  ...filled,
  error: {
    es: "No se quitó la fuente. Sigue en la ventana.",
    en: "The source was not removed. It is still in the window.",
  },
}

export const nearLimit: WindowFixture = {
  seeds: withChat(45_000),
  caption: task,
  tooltip: readingTip,
}

export const compacting: WindowFixture = {
  seeds: withChat(45_000),
  activity: "compacting",
  caption: {
    es: "Resumiendo la charla para dejar sitio.",
    en: "Summarizing the chat to make room.",
  },
  tooltip: { es: "Compactando", en: "Compacting" },
}

export const overLimit: WindowFixture = {
  seeds: withChat(70_000),
  caption: task,
  tooltip: readingTip,
}

export const pinned: WindowFixture = {
  seeds: workshop.map((item) => (item.id === "ficha" || item.id === "charla" ? { ...item, pinned: true } : item)),
  caption: task,
  tooltip: readingTip,
}

export const cacheHeavy: WindowFixture = {
  seeds: workshop.map((item) => {
    if (item.id === "ficha") return { ...item, cached: true, cacheTokens: 8600 }
    if (item.id === "charla") return { ...item, tokens: 36_000, cached: true, cacheTokens: 30_000 }
    return item
  }),
  caption: task,
  tooltip: readingTip,
}

/** Phone width. The scene id is `390` because that token is not a JS binding. */
export const viewport390: WindowFixture = { ...filled }

const freed = {
  es: "Quedaron las decisiones del esmalte. Se liberaron 39,800 tokens.",
  en: "The glaze decisions stayed. 39,800 tokens were freed.",
}

export function compactEvent(locale: SceneLocale): ContextEvent {
  return {
    type: "compact",
    from: "charla",
    to: {
      id: "resumen",
      kind: "chat",
      tokens: 5200,
      status: "compacted",
      cached: false,
      cacheTokens: 0,
      pinned: false,
      label: locale === "en" ? "Order summary" : "Resumen del pedido",
      summaryOf: "charla",
    },
    tokensBefore: 45_000,
    tokensAfter: 5200,
    note: freed[locale],
  }
}

export function compactedModel(locale: SceneLocale): ContextWindowModel {
  return applyContextEvent({ sources: sourcesFrom(nearLimit.seeds, locale), lastCompact: null }, compactEvent(locale))
}

export const compacted: WindowFixture = {
  seeds: [],
  activity: "reading",
  caption: freed,
  tooltip: { es: "Halló la causa", en: "Found the cause" },
}

export function sourcesFrom(seeds: readonly SourceSeed[], locale: SceneLocale): ContextSource[] {
  return seeds.map((item) => {
    const source: ContextSource = {
      id: item.id,
      kind: item.kind,
      tokens: item.tokens,
      status: item.status ?? "loaded",
      cached: item.cached === true,
      cacheTokens: item.cacheTokens ?? 0,
      pinned: item.pinned === true,
      label: item[locale],
    }
    if (item.summaryOf) source.summaryOf = item.summaryOf
    return source
  })
}

export type PlaybackFrame = {
  at: number
  event?: ContextEvent
  activity: ContextActivity
  caption: string
  tooltip: string
}

function load(locale: SceneLocale, item: SourceSeed, status: ContextStatus = "loaded"): ContextEvent {
  return { type: "load", source: sourcesFrom([{ ...item, status }], locale)[0]! }
}

export function playbackPlan(locale: SceneLocale): PlaybackFrame[] {
  const text = (copy: { es: string; en: string }) => copy[locale]
  const chat = workshop.find((item) => item.id === "charla")!
  const quiet = workshop.filter((item) => item.id !== "charla")
  const frames: PlaybackFrame[] = quiet.map((item, index) => ({
    at: index * 280,
    event: load(locale, item),
    activity: "reading",
    caption: text(task),
    tooltip: text(readingTip),
  }))
  const chatAt = quiet.length * 280
  frames.push({
    at: chatAt,
    event: load(locale, { ...chat, tokens: 0 }, "loading"),
    activity: "reading",
    caption: text(task),
    tooltip: text(readingTip),
  })
  frames.push({
    at: chatAt + 420,
    event: { type: "update", id: "charla", tokens: 45_000, status: "loaded" },
    activity: "reading",
    caption: text(task),
    tooltip: text(readingTip),
  })
  frames.push({
    at: chatAt + 900,
    activity: "compacting",
    caption: text(compacting.caption!),
    tooltip: text(compacting.tooltip!),
  })
  frames.push({
    at: chatAt + 1500,
    event: compactEvent(locale),
    activity: "compacting",
    caption: text(compacting.caption!),
    tooltip: text(compacting.tooltip!),
  })
  frames.push({
    at: chatAt + 2100,
    activity: "reading",
    caption: text(freed),
    tooltip: text({ es: "Halló la causa", en: "Found the cause" }),
  })
  return frames
}

export function playbackModel(locale: SceneLocale): ContextWindowModel {
  return playbackPlan(locale).reduce((model, frame) => (frame.event ? applyContextEvent(model, frame.event) : model), emptyContextModel())
}
