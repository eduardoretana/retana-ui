import type { SceneLocale } from "@/app/catalog/scene-types"
import { unbreakable } from "@/app/examples/arc/demo-data"

export const filled = { label: "Mantener para retirar" }

export const empty = { label: "Nada que confirmar" }

export const loading = { label: "Preparando" }

export const error = { label: "No se pudo preparar la confirmación." }

export function copy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      label: "Hold to retire",
      confirmed: "Retired",
      empty: "Nothing to confirm",
      loading: "Preparing",
      error: "The confirmation could not be prepared.",
      dragging: "The fill shows the time that is left.",
      dismissed: "Released early, it returns quickly.",
      keyboard: "Hold Space or Enter.",
      extreme: unbreakable,
    }
  }
  return {
    label: "Mantener para retirar",
    confirmed: "Retirado",
    empty: "Nada que confirmar",
    loading: "Preparando",
    error: "No se pudo preparar la confirmación.",
    dragging: "El relleno muestra el tiempo que falta.",
    dismissed: "Si se suelta antes, vuelve rápido.",
    keyboard: "Mantén Espacio o Enter.",
    extreme: unbreakable,
  }
}
