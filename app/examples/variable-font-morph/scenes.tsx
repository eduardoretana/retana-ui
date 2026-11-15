"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { useWebSceneMotion, WebScrollStage } from "@/app/examples/web-scroll-stage"
import { VariableFontMorph } from "@/registry/ui/variable-font-morph"

import { empty, error as broken, filled, loading, long, morphLabels, type MorphFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function MorphScene({ locale, fixture, still = false }: SceneRenderProps & { fixture: MorphFixture; still?: boolean }) {
  const motion = useWebSceneMotion()
  return (
    <WebScrollStage locale={locale}>
      <VariableFontMorph
        as="h2"
        text={fixture.text[locale]}
        from={100}
        to={900}
        loading={fixture.loading}
        error={fixture.error?.[locale]}
        labels={morphLabels(locale)}
        motion={still ? "off" : motion}
      />
    </WebScrollStage>
  )
}

function scene(fixture: MorphFixture, still = false) {
  return function Render(props: SceneRenderProps) {
    return <MorphScene {...props} fixture={fixture} still={still} />
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
