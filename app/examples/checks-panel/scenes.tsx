"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { ChecksPanel, checksPanelLabels, checksPanelLabelsEs } from "@/registry/ui/checks-panel"

import { empty, error, filled, loading, open, type ChecksFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function PanelScene({ locale, fixture, variant = "rail" }: SceneRenderProps & { fixture: ChecksFixture; variant?: "rail" | "compact" }) {
  return <ChecksPanel {...fixture.props} labels={locale === "en" ? checksPanelLabels : checksPanelLabelsEs} variant={variant} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <PanelScene {...props} fixture={filled} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <PanelScene {...props} fixture={empty} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <PanelScene {...props} fixture={loading} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <PanelScene {...props} fixture={error} /> },
  { id: "open", label: "Abierta", labelEn: "Open", frame, render: (props) => <PanelScene {...props} fixture={open} /> },
  { id: "compact", label: "Compacta", labelEn: "Compact", frame, render: (props) => <PanelScene {...props} fixture={open} variant="compact" /> },
]
