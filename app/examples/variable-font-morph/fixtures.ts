import type { SceneLocale } from "@/app/catalog/scene-types"
import type { VariableFontMorphLabels } from "@/registry/ui/variable-font-morph"

export type MorphFixture = {
  text: Record<SceneLocale, string>
  loading?: boolean
  error?: Record<SceneLocale, string>
}

export const filled: MorphFixture = { text: { es: "Del barro al horno", en: "From clay to kiln" } }

export const empty: MorphFixture = { text: { es: "", en: "" } }

export const loading: MorphFixture = { ...filled, loading: true }

export const error: MorphFixture = {
  ...filled,
  error: {
    es: "No se cargó la fuente variable. El texto se muestra con la fuente del sistema.",
    en: "The variable font did not load. The text uses the system font.",
  },
}

export const long: MorphFixture = {
  text: {
    es: "Del barro al horno, pieza por pieza, con esmaltes propios",
    en: "From clay to kiln, piece by piece, with our own glazes",
  },
}

export function morphLabels(locale: SceneLocale): Partial<VariableFontMorphLabels> {
  if (locale === "en") return {}
  return { loading: "Cargando", empty: "No hay texto que mostrar." }
}
