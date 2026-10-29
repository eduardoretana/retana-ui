"use client"

import { type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { Demo as FilledShot } from "./studio"
import { empty, error, filled, loading } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function FilledScene({ locale }: SceneRenderProps) {
  void locale
  void filled
  return <FilledShot />
}
function Quiet({ locale, id }: SceneRenderProps & { id: "empty" | "loading" | "error" }) {
  const copy = id === "empty" ? empty : id === "loading" ? loading : error
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{copy[locale]}</p>
      <FilledShot />
    </div>
  )
}

function EmptyScene(props: SceneRenderProps) {
  return <Quiet {...props} id="empty" />
}
function LoadingScene(props: SceneRenderProps) {
  return <Quiet {...props} id="loading" />
}
function ErrorScene(props: SceneRenderProps) {
  return <Quiet {...props} id="error" />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
]
