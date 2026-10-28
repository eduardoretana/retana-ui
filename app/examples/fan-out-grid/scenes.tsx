"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { FanOutGrid, type FanStatus } from "@/registry/ui/fan-out-grid"

import { cellsFrom, clear, empty, error as broken, fanLabels, filled, loading, retrying, type FanFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function FanScene({ locale, log, fixture, failRetry = false }: SceneRenderProps & { fixture: FanFixture; failRetry?: boolean }) {
  const sim = useSceneSim({ status: {} as Record<string, FanStatus> }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.retryError ? <SceneStatus tone="error">{fixture.retryError[locale]}</SceneStatus> : null}
      <FanOutGrid
        job={fixture.job[locale] || undefined}
        cells={cellsFrom(fixture.seeds, locale, sim.state.status)}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={fanLabels(locale)}
        onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
        onRetry={(id) => {
          attempt.current += 1
          const fail = failRetry && attempt.current === 1
          void sim.call(formatSceneCall("onRetry", [id]), (current) => ({ status: { ...current.status, [id]: "retrying" } }), undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: FanFixture, failRetry = false) {
  return function Render(props: SceneRenderProps) {
    return <FanScene {...props} fixture={fixture} failRetry={failRetry} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "retrying", label: "Reintento", labelEn: "Retry", render: scene(retrying, true), frame },
  { id: "clear", label: "Listo", labelEn: "Clear", render: scene(clear), frame },
]
