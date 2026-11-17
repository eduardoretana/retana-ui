import decisionInbox from "../../../fixtures/decision-inbox.json"
import lightbox from "../../../fixtures/lightbox.json"
import timeOffStats from "../../../fixtures/time-off-stats.json"

export type SceneLocale = "es" | "en"

type TimeScene = {
  available: number | null
  pending: number
  years: { year: number; granted: number; used: number }[]
  loading?: boolean
  error?: { es: string; en: string }
}

type LabelPack = Record<string, string>

function amount(template: string) {
  return (value: number) => template.replaceAll("{value}", String(value))
}

export function timeOffProps(scene: string, locale: SceneLocale) {
  const spec = (timeOffStats.scenes as Record<string, TimeScene>)[scene]
  if (!spec) throw new Error(`escena desconocida: ${scene}`)
  const pack = (timeOffStats.labels as Record<SceneLocale, LabelPack>)[locale]
  const labels: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(pack)) {
    labels[key] = key === "amount" ? amount(value) : value
  }
  return {
    available: spec.available,
    pending: spec.pending,
    years: spec.years,
    loading: Boolean(spec.loading),
    error: spec.error ? spec.error[locale] : undefined,
    labels,
  }
}

type InboxSeed = (typeof decisionInbox.items)[number]
type InboxRef = { id: string; answerId?: string }

function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""))
}

export function inboxModel(scene: string, locale: SceneLocale) {
  const spec = decisionInbox.scenes[scene as keyof typeof decisionInbox.scenes] as {
    items: InboxRef[]
    loading?: boolean
    error?: boolean
  }
  const pack = decisionInbox.labels[locale]
  const items = spec.items.map((ref) => {
    const seed = decisionInbox.items.find((item) => item.id === ref.id) as InboxSeed
    return {
      id: seed.id,
      title: seed[locale].title,
      detail: seed[locale].detail,
      agent: seed.agent,
      answerId: ref.answerId ?? null,
      choices: seed.choices.map((choice) => ({ id: choice.id, label: choice[locale] })),
    }
  })
  return {
    items,
    loading: Boolean(spec.loading),
    error: spec.error ? decisionInbox.banner[locale] : undefined,
    labels: {
      title: pack.title,
      empty: pack.empty,
      loading: pack.loading,
      dismiss: pack.dismiss,
      open: (count: number) => (count === 1 ? pack.openOne : fill(pack.openOther, { count })),
      answered: (choice: string) => fill(pack.answered, { choice }),
      dismissNamed: (title: string) => fill(pack.dismissNamed, { title }),
      choose: (title: string, choice: string) => fill(pack.choose, { title, choice }),
      from: (agent: string) => fill(pack.from, { agent }),
    },
  }
}

export function lightboxModel(scene: string, locale: SceneLocale) {
  const spec = lightbox.scenes[scene as keyof typeof lightbox.scenes]
  const pack = lightbox.labels[locale]
  const items = spec.items.map((id) => {
    const item = lightbox.items.find((entry) => entry.id === id)
    if (!item) throw new Error(id)
    return { src: item.src, alt: item[locale].alt, caption: item[locale].caption }
  })
  return {
    items,
    loading: Boolean("loading" in spec && spec.loading),
    error: "error" in spec && spec.error ? pack.error : undefined,
    emptyLabel: pack.empty,
    loadingLabel: pack.loading,
    closeLabel: pack.close,
    previousLabel: pack.previous,
    nextLabel: pack.next,
    zoomInLabel: pack.zoomIn,
    zoomOutLabel: pack.zoomOut,
  }
}
