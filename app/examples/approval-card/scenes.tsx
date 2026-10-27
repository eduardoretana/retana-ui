"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ApprovalCard, type GateStatus } from "@/registry/ui/approval-card"

import { elapsed, empty, error as broken, filled, gateLabels, held, loading, proposalFrom, type GateFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function GateScene({ locale, log, fixture, failApprove = false }: SceneRenderProps & { fixture: GateFixture; failApprove?: boolean }) {
  const sim = useSceneSim({ status: fixture.seed?.status ?? ("open" as GateStatus) }, log)
  const attempt = useRef(0)
  const proposal = proposalFrom(fixture.seed, locale, fixture.seed ? sim.state.status : undefined)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.approveError ? <SceneStatus tone="error">{fixture.approveError[locale]}</SceneStatus> : null}
      <ApprovalCard
        proposal={proposal}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={gateLabels(locale)}
        onApprove={(id) => {
          attempt.current += 1
          const fail = failApprove && attempt.current === 1
          void sim.call(formatSceneCall("onApprove", [id]), (current) => ({ ...current, status: "approved" }), undefined, { fail })
        }}
        onDecline={(id) => {
          void sim.call(formatSceneCall("onDecline", [id]), (current) => ({ ...current, status: "declined" }))
        }}
        onHold={(id) => {
          void sim.call(formatSceneCall("onHold", [id]), (current) => ({ ...current, status: "held" }))
        }}
        onRelease={(id) => {
          void sim.call(formatSceneCall("onRelease", [id]), (current) => ({ ...current, status: "open" }))
        }}
      />
    </div>
  )
}

function scene(fixture: GateFixture, failApprove = false) {
  return function Render(props: SceneRenderProps) {
    return <GateScene {...props} fixture={fixture} failApprove={failApprove} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "held", label: "En pausa", labelEn: "Paused", render: scene(held), frame },
  { id: "elapsed", label: "Venció", labelEn: "Elapsed", render: scene(elapsed), frame },
]
