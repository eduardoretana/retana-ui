"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { PrCreateCard } from "@/registry/ui/pr-create-card"

import { collapsed, empty, error, filled, loading, type PrFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function CardScene({ locale, fixture, variant = "rail" }: SceneRenderProps & { fixture: PrFixture; variant?: "rail" | "compact" }) {
  const labels = locale === "en" ? fixture.en : fixture.es
  const message = fixture.props.errorMessage
    ? sceneText(locale, fixture.props.errorMessage, "The remote rejected the kiln branch.")
    : undefined
  return <PrCreateCard {...fixture.props} errorMessage={message} labels={labels} variant={variant} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <CardScene {...props} fixture={filled} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <CardScene {...props} fixture={empty} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <CardScene {...props} fixture={loading} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <CardScene {...props} fixture={error} /> },
  { id: "collapsed", label: "Chip", labelEn: "Chip", frame, render: (props) => <CardScene {...props} fixture={collapsed} /> },
  { id: "compact", label: "Compacta", labelEn: "Compact", frame, render: (props) => <CardScene {...props} fixture={filled} variant="compact" /> },
]
