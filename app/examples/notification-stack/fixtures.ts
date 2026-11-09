import type { SceneLocale } from "@/app/catalog/scene-types"
import { unbreakable } from "@/app/examples/arc/demo-data"
import type { NotificationStackItem } from "@/registry/ui/notification-stack"

import { sampleNotices } from "./sample"

export const filled = sampleNotices

export const empty: NotificationStackItem[] = []

export const loading = { label: "Cargando avisos" }

export const error = { label: "No se pudieron cargar los avisos." }

export const dismissed = sampleNotices.slice(1)

export function extreme(): NotificationStackItem[] {
  return [
    {
      id: "long",
      title: unbreakable,
      body: `${unbreakable} ${unbreakable}`,
      time: "03:00",
      dateTime: "2026-10-04T03:00:00",
      tone: "chart-5",
    },
  ]
}

export function copy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      label: "Studio notices",
      empty: "Nothing waiting",
      loading: "Loading notices",
      error: "The notices could not be loaded.",
      dismissed: "The front notice left on the same axis it uses to enter.",
      dragging: "The card is under the finger.",
      keyboard: "Delete, Backspace, or Escape dismisses the focused card.",
    }
  }
  return {
    label: "Avisos del taller",
    empty: "No queda nada pendiente",
    loading: "Cargando avisos",
    error: "No se pudieron cargar los avisos.",
    dismissed: "El aviso de enfrente se fue por el mismo eje por el que entra.",
    dragging: "La tarjeta está bajo el dedo.",
    keyboard: "Supr, Retroceso o Escape descartan la tarjeta enfocada.",
  }
}
