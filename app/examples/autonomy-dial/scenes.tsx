"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AutonomyDial, type AutonomyLevel } from "@/registry/ui/autonomy-dial"

import { actionsFrom, dialLabels, empty, error as broken, filled, loading, locked, open, type DialFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

type DialState = { level: AutonomyLevel; pinned: string[] }

function DialScene({
  locale,
  log,
  fixture,
  failSave = false,
}: SceneRenderProps & { fixture: DialFixture; failSave?: boolean }) {
  const sim = useSceneSim<DialState>({ level: fixture.level, pinned: [...fixture.pinned] }, log)
  const attempt = useRef(0)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.saveError ? <SceneStatus tone="error">{fixture.saveError[locale]}</SceneStatus> : null}
      <AutonomyDial
        actions={actionsFrom(fixture.actions, locale)}
        level={sim.state.level}
        pinned={sim.state.pinned}
        title={fixture.title[locale]}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={dialLabels(locale)}
        onLevelChange={(level) => {
          attempt.current += 1
          const fail = failSave && attempt.current === 1
          void sim.call(formatSceneCall("onLevelChange", [level]), (current) => ({ ...current, level }), undefined, { fail })
        }}
        onPinnedChange={(pinned) => {
          sim.patch(formatSceneCall("onPinnedChange", [pinned]), (current) => ({ ...current, pinned }))
        }}
      />
    </div>
  )
}

function scene(fixture: DialFixture, failSave = false) {
  return function Render(props: SceneRenderProps) {
    return <DialScene {...props} fixture={fixture} failSave={failSave} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "locked", label: "Candado", labelEn: "Locked", render: scene(locked), frame },
  { id: "open", label: "Abierta", labelEn: "Open", render: scene(open), frame },
]
