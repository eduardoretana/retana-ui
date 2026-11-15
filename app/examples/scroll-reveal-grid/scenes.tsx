"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { useWebSceneMotion, WebScrollStage } from "@/app/examples/web-scroll-stage"
import { ScrollRevealGrid } from "@/registry/ui/scroll-reveal-grid"

import { empty, error as broken, filled, loading, long, revealLabels, type RevealFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function RevealScene({ locale, fixture, still = false }: SceneRenderProps & { fixture: RevealFixture; still?: boolean }) {
  const motion = useWebSceneMotion()
  return (
    <WebScrollStage locale={locale}>
      <ScrollRevealGrid
        items={fixture.items[locale]}
        loading={fixture.loading}
        error={fixture.error?.[locale]}
        labels={revealLabels(locale)}
        columns={2}
        motion={still ? "off" : motion}
      />
    </WebScrollStage>
  )
}

function scene(fixture: RevealFixture, still = false) {
  return function Render(props: SceneRenderProps) {
    return <RevealScene {...props} fixture={fixture} still={still} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "long", label: "Texto largo", labelEn: "Long text", render: scene(long), frame },
  { id: "static", label: "Sin soporte", labelEn: "No support", render: scene(filled, true), frame },
]
