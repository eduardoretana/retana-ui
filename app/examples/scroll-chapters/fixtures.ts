import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ScrollChaptersLabels } from "@/registry/ui/scroll-chapters"

export type ChapterText = { id: string; title: string; paragraphs: string[] }

export type ChaptersFixture = {
  chapters: Record<SceneLocale, ChapterText[]>
  loading?: boolean
  error?: Record<SceneLocale, string>
}

const body = {
  es: [
    "El barro llega en costales de veinte kilos. Se amasa a mano para sacar el aire y se deja reposar una noche envuelto en plástico.",
    "En el torno, la pieza se centra primero. Si el centro falla, el plato se tuerce en el horno y no hay esmalte que lo arregle.",
    "Después del secado, la primera quema endurece la pieza sin cerrarla. Así el esmalte todavía puede entrar en el poro.",
  ],
  en: [
    "Clay arrives in twenty-kilo sacks. It is wedged by hand to push the air out and rests overnight wrapped in plastic.",
    "On the wheel, the piece is centered first. If the center is off, the plate warps in the kiln and no glaze can fix it.",
    "After drying, the first firing hardens the piece without sealing it, so the glaze can still soak into the pores.",
  ],
}

const chapters: Record<SceneLocale, ChapterText[]> = {
  es: [
    { id: "cap-barro", title: "El barro", paragraphs: body.es },
    { id: "cap-torno", title: "El torno", paragraphs: [...body.es].reverse() },
    { id: "cap-horno", title: "El horno", paragraphs: body.es },
    { id: "cap-esmalte", title: "El esmalte", paragraphs: [...body.es].reverse() },
  ],
  en: [
    { id: "cap-barro", title: "The clay", paragraphs: body.en },
    { id: "cap-torno", title: "The wheel", paragraphs: [...body.en].reverse() },
    { id: "cap-horno", title: "The kiln", paragraphs: body.en },
    { id: "cap-esmalte", title: "The glaze", paragraphs: [...body.en].reverse() },
  ],
}

export const filled: ChaptersFixture = { chapters }

export const empty: ChaptersFixture = { chapters: { es: [], en: [] } }

export const loading: ChaptersFixture = { chapters, loading: true }

export const error: ChaptersFixture = {
  chapters,
  error: {
    es: "No se cargó la guía. Vuelve a intentarlo en unos minutos.",
    en: "The guide did not load. Try again in a few minutes.",
  },
}

export const long: ChaptersFixture = {
  chapters: {
    es: chapters.es.map((chapter) => ({ ...chapter, title: `${chapter.title}: lo que nadie te cuenta antes de la primera quema` })),
    en: chapters.en.map((chapter) => ({ ...chapter, title: `${chapter.title}: what nobody tells you before the first firing` })),
  },
}

export function chaptersLabels(locale: SceneLocale): Partial<ScrollChaptersLabels> {
  if (locale === "en") return {}
  return { nav: "Capítulos", loading: "Cargando la guía", empty: "Todavía no hay capítulos." }
}
