"use client"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { LightboxGallery } from "@/registry/ui/lightbox"

import { copy, lightboxItems } from "./fixtures"

const frame = { size: "md" as const, surface: "card" as const, padding: "md" as const }

function Filled({ locale }: SceneRenderProps) {
  return (
    <LightboxGallery
      items={lightboxItems(locale)}
      closeLabel={copy[locale].close}
      previousLabel={copy[locale].previous}
      nextLabel={copy[locale].next}
      zoomInLabel={copy[locale].zoomIn}
      zoomOutLabel={copy[locale].zoomOut}
    />
  )
}

function Empty({ locale }: SceneRenderProps) {
  return <p>{copy[locale].empty}</p>
}

function Loading({ locale }: SceneRenderProps) {
  return <div role="status">{copy[locale].loading}</div>
}

function Broken({ locale }: SceneRenderProps) {
  return <p role="alert">{copy[locale].error}</p>
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: Filled },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: Empty },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: Loading },
  { id: "error", label: "Error", labelEn: "Error", frame, render: Broken },
]
