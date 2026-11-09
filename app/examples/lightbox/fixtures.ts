import type { SceneLocale } from "@/app/catalog/scene-types"
import type { LightboxItem } from "@/registry/ui/lightbox"

import data from "../../../fixtures/lightbox.json"

export function lightboxItems(locale: SceneLocale): LightboxItem[] {
  const scene = data.scenes.filled
  return scene.items.map((id) => {
    const item = data.items.find((entry) => entry.id === id)
    if (!item) throw new Error(id)
    return { src: item.src, alt: item[locale].alt, caption: item[locale].caption }
  })
}

export const filled = { items: ["estudio", "patio"] }
export const empty = data.scenes.empty
export const loading = data.scenes.loading
export const error = data.scenes.error
export const copy = data.labels
