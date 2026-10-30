import type { SceneLocale } from "@/app/catalog/scene-types"

/** `es`, `es-MX` → es. `en`, `en-US` → en. Anything else is ignored. */
export function sceneLocaleFromQuery(value: string | null): SceneLocale | null {
  if (!value) return null
  const tag = value.trim().toLowerCase()
  if (tag === "en" || tag.startsWith("en-")) return "en"
  if (tag === "es" || tag.startsWith("es-")) return "es"
  return null
}

/** `1`, `true`, or `reduce` turn motion off. `0` and `false` leave it on. */
export function reducedFromQuery(value: string | null): boolean | null {
  if (value == null || value === "") return null
  const tag = value.trim().toLowerCase()
  if (tag === "1" || tag === "true" || tag === "reduce") return true
  if (tag === "0" || tag === "false") return false
  return null
}

export function themeFromQuery(value: string | null): "light" | "dark" | null {
  if (value === "light" || value === "dark") return value
  return null
}
