"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ContextMap, type MapView } from "@/registry/ui/context-map"

import { blocksFrom, earlier, empty, error as broken, filled, loading, mapLabels, open, type MapFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function MapScene({ locale, log, fixture }: SceneRenderProps & { fixture: MapFixture }) {
  const sim = useSceneSim({ view: (fixture.view ?? "after") as MapView, selectedId: fixture.selectedId }, log)
  const seeds = sim.state.view === "before" && fixture.before ? fixture.before : fixture.blocks
  return (
    <ContextMap
      blocks={blocksFrom(seeds, locale)}
      limit={fixture.limit}
      compare={fixture.compare}
      view={fixture.compare ? sim.state.view : undefined}
      note={fixture.note?.[locale]}
      status={fixture.status?.[locale]}
      selectedId={sim.state.selectedId}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={mapLabels(locale)}
      onView={(view) => sim.patch(formatSceneCall("onView", [view]), (current) => ({ ...current, view, selectedId: undefined }))}
      onSelect={(id) => sim.patch(formatSceneCall("onSelect", [id]), (current) => ({ ...current, selectedId: id }))}
    />
  )
}

function scene(fixture: MapFixture) {
  return function Render(props: SceneRenderProps) {
    return <MapScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "before", label: "Antes", labelEn: "Before", render: scene(earlier), frame },
  { id: "open", label: "Abierto", labelEn: "Open", render: scene(open), frame },
]
