import type { SceneLocale } from "@/app/catalog/scene-types"
import type { HeroViewTimelineLabels } from "@/registry/ui/hero-view-timeline"

export type HeroCopy = { eyebrow: string; title: string; lead: string; primary: string; secondary: string }

export type HeroFixture = {
  copy: Record<SceneLocale, HeroCopy>
  loading?: boolean
  error?: Record<SceneLocale, string>
}

const copy: Record<SceneLocale, HeroCopy> = {
  es: {
    eyebrow: "Taller cerámico · León",
    title: "Vajillas por encargo hechas a mano",
    lead: "Diseñamos contigo la forma y el esmalte. Entregamos en dos semanas en todo el Bajío.",
    primary: "Agenda una visita",
    secondary: "Ver piezas",
  },
  en: {
    eyebrow: "Ceramic studio · León",
    title: "Made-to-order tableware thrown by hand",
    lead: "We design the shape and the glaze with you. Delivery in two weeks across the Bajío.",
    primary: "Book a visit",
    secondary: "See pieces",
  },
}

export const filled: HeroFixture = { copy }

export const empty: HeroFixture = { copy: { es: { ...copy.es, title: "" }, en: { ...copy.en, title: "" } } }

export const loading: HeroFixture = { copy, loading: true }

export const error: HeroFixture = {
  copy,
  error: {
    es: "No se cargó la agenda de visitas. Escríbenos y te respondemos hoy.",
    en: "The visit calendar did not load. Write to us and we will reply today.",
  },
}

export const long: HeroFixture = {
  copy: {
    es: { ...copy.es, title: "Vajillas por encargo hechas a mano con esmaltes propios y entrega garantizada en dos semanas" },
    en: { ...copy.en, title: "Made-to-order tableware thrown by hand with our own glazes and guaranteed two-week delivery" },
  },
}

export function heroLabels(locale: SceneLocale): Partial<HeroViewTimelineLabels> {
  if (locale === "en") return {}
  return { loading: "Cargando", empty: "Agrega un titular." }
}
