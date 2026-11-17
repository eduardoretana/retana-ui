import type { SceneLocale } from "@/app/catalog/scene-types"

export const filled = { label: "Desliza para enviar" }

export const empty = { label: "Nada que confirmar" }

export const loading = { label: "Preparando el envío" }

export const error = { label: "No se pudo preparar la confirmación." }

export function copy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      label: "Slide to send",
      empty: "Nothing to confirm",
      loading: "Preparing the send",
      error: "The confirmation could not be prepared.",
      dragging: "The handle is the finger.",
      dismissed: "Past the threshold, the action runs.",
      keyboard: "Arrow keys move the handle. End confirms.",
      extreme: "NorthPacificClayBodySpecificationWithoutSpacesOrBreaksForStressLayout",
    }
  }
  return {
    label: "Desliza para enviar",
    empty: "Nada que confirmar",
    loading: "Preparando el envío",
    error: "No se pudo preparar la confirmación.",
    dragging: "El asa es el dedo.",
    dismissed: "Pasado el umbral, corre la acción.",
    keyboard: "Las flechas mueven el asa. Fin confirma.",
    extreme: "NorthPacificClayBodySpecificationWithoutSpacesOrBreaksForStressLayout",
  }
}
