"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentLanes, type LaneTone } from "@/registry/ui/agent-lanes"

import { ask, blocksFrom, empty, error as broken, filled, idle, laneLabels, LANE_WINDOW, loading, type LanesFixture } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

function LanesScene({ locale, log, fixture, failApprove = false }: SceneRenderProps & { fixture: LanesFixture; failApprove?: boolean }) {
  const sim = useSceneSim({ tone: {} as Record<string, LaneTone> }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.approveError ? <SceneStatus tone="error">{fixture.approveError[locale]}</SceneStatus> : null}
      <AgentLanes
        agents={fixture.agents}
        blocks={blocksFrom(fixture.seeds, locale, sim.state.tone)}
        window={LANE_WINDOW}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={laneLabels(locale)}
        onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
        onApprove={(id) => {
          attempt.current += 1
          const fail = failApprove && attempt.current === 1
          void sim.call(formatSceneCall("onApprove", [id]), (current) => ({ tone: { ...current.tone, [id]: "work" } }), undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: LanesFixture, failApprove = false) {
  return function Render(props: SceneRenderProps) {
    return <LanesScene {...props} fixture={fixture} failApprove={failApprove} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "ask", label: "Visto", labelEn: "Ask", render: scene(ask), frame },
  { id: "idle", label: "Libre", labelEn: "Idle", render: scene(idle), frame },
]
