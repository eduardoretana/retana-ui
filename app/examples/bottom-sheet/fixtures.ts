import type { SceneLocale } from "@/app/catalog/scene-types"
import { unbreakable } from "@/app/examples/arc/demo-data"

export const filled = { title: "Carga del horno", body: "Seis piezas en el estante de arriba." }

export const empty = { title: "Vacío", body: "Nada en la hoja." }

export const loading = { title: "Cargando", body: "Leyendo la carga." }

export const error = { title: "Error", body: "No se pudo abrir la hoja." }

export function copy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      title: "Kiln load",
      body: "Six pieces on the top shelf.",
      emptyTitle: "Empty",
      emptyBody: "Nothing in the sheet.",
      loading: "Reading the load.",
      error: "The sheet could not be opened.",
      dragging: "The sheet follows the finger.",
      dismissed: "A button close has no bounce.",
      keyboard: "Arrows change the detent. Escape closes.",
      extreme: unbreakable,
    }
  }
  return {
    title: "Carga del horno",
    body: "Seis piezas en el estante de arriba.",
    emptyTitle: "Vacío",
    emptyBody: "Nada en la hoja.",
    loading: "Leyendo la carga.",
    error: "No se pudo abrir la hoja.",
    dragging: "La hoja sigue el dedo.",
    dismissed: "Cerrar con el botón no rebota.",
    keyboard: "Las flechas cambian el detent. Escape cierra.",
    extreme: unbreakable,
  }
}
