"use client"

import { type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { FileDiff } from "@/registry/ui/file-diff"
import { Demo as FilledShot } from "./studio"
import { empty, error, filled, loading } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "canvas", padding: "sm" }

function FilledScene({ locale }: SceneRenderProps) {
  void locale
  void filled
  return <FilledShot />
}


function PhaseScene({ locale, phase }: SceneRenderProps & { phase: "empty" | "loading" | "error" }) {
  const copy = phase === "empty" ? empty : phase === "loading" ? loading : error
  const label = copy[locale]
  return (
    <FileDiff phase={phase} phaseLabel={label} />
  )
}
function EmptyScene(props: SceneRenderProps) {
  return <PhaseScene {...props} phase="empty" />
}
function LoadingScene(props: SceneRenderProps) {
  return <PhaseScene {...props} phase="loading" />
}
function ErrorScene(props: SceneRenderProps) {
  return <PhaseScene {...props} phase="error" />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
]
