"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { AgentFixTimeline, agentFixTimelineLabels, agentFixTimelineLabelsEs, type FixStep } from "@/registry/ui/agent-fix-timeline"

import { empty, error, filled, loading } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function TimelineScene({
  locale,
  steps,
  variant = "rail",
}: SceneRenderProps & { steps: readonly FixStep[]; variant?: "rail" | "compact" }) {
  return <AgentFixTimeline steps={steps} labels={locale === "en" ? agentFixTimelineLabels : agentFixTimelineLabelsEs} variant={variant} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <TimelineScene {...props} steps={filled.steps} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <TimelineScene {...props} steps={empty.steps} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <TimelineScene {...props} steps={loading.steps} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <TimelineScene {...props} steps={error.steps} /> },
  { id: "compact", label: "Compacta", labelEn: "Compact", frame, render: (props) => <TimelineScene {...props} steps={filled.steps} variant="compact" /> },
]
