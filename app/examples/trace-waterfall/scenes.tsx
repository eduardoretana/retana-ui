"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { TraceWaterfall } from "@/registry/ui/trace-waterfall"

import { empty, error as broken, failed, filled, folded, loading, spansFrom, traceLabels, type TraceFixture } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

function TraceScene({ locale, log, fixture }: SceneRenderProps & { fixture: TraceFixture }) {
  const sim = useSceneSim({ collapsed: [...fixture.collapsed] }, log)
  return (
    <TraceWaterfall
      spans={spansFrom(fixture.seeds, locale)}
      collapsed={sim.state.collapsed}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={traceLabels(locale)}
      onCollapsedChange={(collapsed) => sim.patch(formatSceneCall("onCollapsedChange", [collapsed]), () => ({ collapsed: [...collapsed] }))}
      onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
    />
  )
}

function scene(fixture: TraceFixture) {
  return function Render(props: SceneRenderProps) {
    return <TraceScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "failed", label: "Falló", labelEn: "Failed", render: scene(failed), frame },
  { id: "folded", label: "Plegado", labelEn: "Folded", render: scene(folded), frame },
]
