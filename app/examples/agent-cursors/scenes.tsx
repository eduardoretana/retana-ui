"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentCursors } from "@/registry/ui/agent-cursors"

import { accepted, away, cursorLabels, cursorsFrom, empty, error as broken, filled, loading, suggestionsFrom, type CursorFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function CursorScene({ locale, log, fixture }: SceneRenderProps & { fixture: CursorFixture }) {
  const sim = useSceneSim({ accepted: {} as Record<string, boolean> }, log)
  return (
    <AgentCursors
      paragraphs={fixture.paragraphs}
      cursors={cursorsFrom(fixture, locale)}
      suggestions={suggestionsFrom(fixture, locale, sim.state.accepted)}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={cursorLabels(locale)}
      onFocus={(id) => log(formatSceneCall("onFocus", [id]))}
      onAccept={(id) => {
        void sim.call(formatSceneCall("onAccept", [id]), (current) => ({ accepted: { ...current.accepted, [id]: true } }))
      }}
    />
  )
}

function scene(fixture: CursorFixture) {
  return function Render(props: SceneRenderProps) {
    return <CursorScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "accepted", label: "Aceptada", labelEn: "Accepted", render: scene(accepted), frame },
  { id: "away", label: "Ausentes", labelEn: "Away", render: scene(away), frame },
]
