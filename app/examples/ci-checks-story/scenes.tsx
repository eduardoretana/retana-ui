"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { CiChecksStory, ciChecksStoryLabels, ciChecksStoryLabelsEs, type StoryPhase } from "@/registry/blocks/ci-checks-story"

import { empty, error, filled, flow, loading, merged } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }

function StoryScene({
  locale,
  phase,
  showTransport = false,
  variant = "rail",
}: SceneRenderProps & { phase: StoryPhase; showTransport?: boolean; variant?: "rail" | "compact" }) {
  return (
    <CiChecksStory
      phase={showTransport ? undefined : phase}
      defaultPhase={phase}
      showTransport={showTransport}
      variant={variant}
      labels={locale === "en" ? ciChecksStoryLabels : ciChecksStoryLabelsEs}
    />
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <StoryScene {...props} phase={filled.phase} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <StoryScene {...props} phase={empty.phase} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <StoryScene {...props} phase={loading.phase} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <StoryScene {...props} phase={error.phase} /> },
  { id: "merged", label: "Fusionado", labelEn: "Merged", frame, render: (props) => <StoryScene {...props} phase={merged.phase} /> },
  { id: "flow", label: "Escenario", labelEn: "Flow", frame, render: (props) => <StoryScene {...props} phase={flow.phase} showTransport={flow.showTransport} /> },
  { id: "compact", label: "Compacta", labelEn: "Compact", frame, render: (props) => <StoryScene {...props} phase="failing" variant="compact" /> },
]
