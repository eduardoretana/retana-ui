"use client"

import { useRef } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ConflictRadar } from "@/registry/ui/conflict-radar"

import { clashesFrom, empty, error as broken, filled, kiln, loading, radarLabels, settled, type RadarFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function RadarScene({ locale, log, fixture, failKeep = false }: SceneRenderProps & { fixture: RadarFixture; failKeep?: boolean }) {
  const sim = useSceneSim({ kept: {} as Record<string, "left" | "right" | null> }, log)
  const attempt = useRef(0)
  return (
    <ConflictRadar
      agents={fixture.agents}
      clashes={clashesFrom(fixture.seeds, locale, sim.state.kept)}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={radarLabels(locale)}
      onKeep={(id, side) => {
        attempt.current += 1
        const fail = failKeep && attempt.current === 1
        void sim.call(formatSceneCall("onKeep", [id, side]), (current) => ({ kept: { ...current.kept, [id]: side } }), undefined, { fail })
      }}
      onFile={() => log(formatSceneCall("onFile", []))}
    />
  )
}

function scene(fixture: RadarFixture, failKeep = false) {
  return function Render(props: SceneRenderProps) {
    return <RadarScene {...props} fixture={fixture} failKeep={failKeep} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "settled", label: "Resuelto", labelEn: "Settled", render: scene(settled), frame },
  { id: "kiln", label: "Horno", labelEn: "Kiln", render: scene(kiln), frame },
]
