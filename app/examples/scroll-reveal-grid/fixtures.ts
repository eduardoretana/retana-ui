import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ScrollRevealGridItem, ScrollRevealGridLabels } from "@/registry/ui/scroll-reveal-grid"

export type RevealFixture = {
  items: Record<SceneLocale, ScrollRevealGridItem[]>
  loading?: boolean
  error?: Record<SceneLocale, string>
}

const steps: Record<SceneLocale, ScrollRevealGridItem[]> = {
  es: [
    { id: "visita", eyebrow: "Paso 1", title: "Visita al taller", description: "Elegimos juntos la arcilla, la forma y el número de piezas." },
    { id: "boceto", eyebrow: "Paso 2", title: "Boceto y muestra", description: "Te enviamos un plato de prueba con el esmalte elegido." },
    { id: "torno", eyebrow: "Paso 3", title: "Torno y secado", description: "Cada pieza se tornea a mano y seca una semana." },
    { id: "horno", eyebrow: "Paso 4", title: "Dos quemas", description: "Primera quema a 950 °C y la del esmalte a 1240 °C." },
    { id: "revision", eyebrow: "Paso 5", title: "Revisión pieza por pieza", description: "Apartamos cualquier pieza con burbujas o grietas." },
    { id: "entrega", eyebrow: "Paso 6", title: "Entrega en el Bajío", description: "Empaque con cartón reciclado y entrega en dos semanas." },
  ],
  en: [
    { id: "visita", eyebrow: "Step 1", title: "Studio visit", description: "We pick the clay, the shape, and the number of pieces together." },
    { id: "boceto", eyebrow: "Step 2", title: "Sketch and sample", description: "You get a test plate in the glaze you chose." },
    { id: "torno", eyebrow: "Step 3", title: "Wheel and drying", description: "Every piece is thrown by hand and dries for a week." },
    { id: "horno", eyebrow: "Step 4", title: "Two firings", description: "A bisque firing at 950 °C and a glaze firing at 1240 °C." },
    { id: "revision", eyebrow: "Step 5", title: "Piece-by-piece check", description: "Any piece with bubbles or cracks is set aside." },
    { id: "entrega", eyebrow: "Step 6", title: "Delivery across the Bajío", description: "Recycled cardboard packing and delivery in two weeks." },
  ],
}

export const filled: RevealFixture = { items: steps }

export const empty: RevealFixture = { items: { es: [], en: [] } }

export const loading: RevealFixture = { items: steps, loading: true }

export const error: RevealFixture = {
  items: steps,
  error: {
    es: "No se cargaron los pasos. El resto de la página sigue disponible.",
    en: "The steps did not load. The rest of the page is still available.",
  },
}

export const long: RevealFixture = {
  items: {
    es: steps.es.map((item) => ({ ...item, title: `${item.title} con revisión de calidad y fotografías de cada etapa`, description: `${item.description} Sin costo extra si la muestra no te convence.` })),
    en: steps.en.map((item) => ({ ...item, title: `${item.title} with a quality check and photos of every stage`, description: `${item.description} No extra cost if the sample does not convince you.` })),
  },
}

export function revealLabels(locale: SceneLocale): Partial<ScrollRevealGridLabels> {
  if (locale === "en") return {}
  return { loading: "Cargando los pasos", empty: "Todavía no hay pasos que mostrar." }
}
