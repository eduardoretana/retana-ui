"use client"

import { useState } from "react"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { MergeButton, mergeButtonLabels, mergeButtonLabelsEs, type MergePhase } from "@/registry/ui/merge-button"

import { empty, error, filled, loading, merged } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "card", padding: "md" }

function MergeScene({
  locale,
  phase,
  reason,
  variant = "rail",
}: SceneRenderProps & { phase: MergePhase; reason?: string; variant?: "rail" | "compact" }) {
  const [done, setDone] = useState(phase === "merged")
  const labels = locale === "en" ? mergeButtonLabels : mergeButtonLabelsEs
  const shown = reason ? sceneText(locale, reason, "Reviews are required on main.") : undefined
  return (
    <div className="flex flex-col gap-3">
      {done && phase === "ready" ? <p className="text-sm text-foreground">{labels.merged}</p> : null}
      <MergeButton
        phase={done && phase === "ready" ? "merged" : phase}
        reason={shown}
        labels={labels}
        variant={variant}
        onMerge={() => setDone(true)}
      />
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <MergeScene {...props} phase={filled.phase} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <MergeScene {...props} phase={empty.phase} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <MergeScene {...props} phase={loading.phase} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <MergeScene {...props} phase={error.phase} reason={error.reason} /> },
  { id: "merged", label: "Fusionado", labelEn: "Merged", frame, render: (props) => <MergeScene {...props} phase={merged.phase} /> },
  { id: "compact", label: "Compacta", labelEn: "Compact", frame, render: (props) => <MergeScene {...props} phase={filled.phase} variant="compact" /> },
]
