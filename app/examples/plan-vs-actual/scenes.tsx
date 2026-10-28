"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { PlanVsActual } from "@/registry/ui/plan-vs-actual"

import { actualLabels, ahead, empty, error as broken, filled, loading, stepsFrom, stuck, type ActualFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function ActualScene({ locale, log, fixture }: SceneRenderProps & { fixture: ActualFixture }) {
  return (
    <PlanVsActual
      steps={stepsFrom(fixture.seeds, locale)}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={actualLabels(locale)}
      onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
    />
  )
}

function scene(fixture: ActualFixture) {
  return function Render(props: SceneRenderProps) {
    return <ActualScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "ahead", label: "Adelantado", labelEn: "Ahead", render: scene(ahead), frame },
  { id: "stuck", label: "Atorado", labelEn: "Stuck", render: scene(stuck), frame },
]
