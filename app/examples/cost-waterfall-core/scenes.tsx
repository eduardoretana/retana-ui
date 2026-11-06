"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"

import { coreSnapshot } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function CoreScene({ locale, id }: SceneRenderProps & { id: string }) {
  if (id === "loading") return <SceneStatus tone="loading">{sceneText(locale, "Calculando el costo de ejemplo", "Pricing the example run")}</SceneStatus>
  if (id === "error") return <SceneStatus tone="error">{sceneText(locale, "Falta la tabla de precios de ejemplo.", "The example price table is missing.")}</SceneStatus>
  const snap = coreSnapshot(id, locale)
  if (snap.run.steps.length === 0) return <p className="text-sm text-muted-foreground">{sceneText(locale, "Sin pasos.", "No steps.")}</p>
  return (
    <dl className="grid gap-2 text-sm">
      <div><dt className="text-muted-foreground">{sceneText(locale, "Costo", "Cost")}</dt><dd className="font-medium tabular-nums">{snap.total}</dd></div>
      <div><dt className="text-muted-foreground">{sceneText(locale, "Ahorro de caché", "Cache savings")}</dt><dd className="tabular-nums">{snap.savings}</dd></div>
      <div><dt className="text-muted-foreground">{sceneText(locale, "Tokens", "Tokens")}</dt><dd className="tabular-nums">{snap.tokens}</dd></div>
      <div><dt className="text-muted-foreground">{sceneText(locale, "Más caro", "Most expensive")}</dt><dd>{snap.winner}</dd></div>
    </dl>
  )
}

function scene(id: string, label: string, labelEn: string): Scene {
  return { id, label, labelEn, frame, render: (props) => <CoreScene {...props} id={id} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled"),
  scene("empty", "Vacío", "Empty"),
  scene("loading", "Cargando", "Loading"),
  scene("error", "Error", "Error"),
  scene("cache", "Caché", "Cache"),
  scene("mxn", "Pesos", "MXN"),
]
