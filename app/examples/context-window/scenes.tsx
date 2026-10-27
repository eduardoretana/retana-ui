"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ContextWindow } from "@/registry/ui/context-window"

import { compacted, empty, error as broken, filled, full, loading, partsFrom, tight, windowLabels, type WindowFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function WindowScene({ locale, log, fixture, failRemove = false }: SceneRenderProps & { fixture: WindowFixture; failRemove?: boolean }) {
  const sim = useSceneSim({ removed: {} as Record<string, true>, compact: {} as Record<string, true> }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.removeError ? <SceneStatus tone="error">{fixture.removeError[locale]}</SceneStatus> : null}
      <ContextWindow
        parts={partsFrom(fixture.parts, locale, sim.state.removed, sim.state.compact)}
        limit={fixture.limit}
        note={fixture.note?.[locale]}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={windowLabels(locale)}
        onRemove={(partId, itemId) => {
          attempt.current += 1
          const fail = failRemove && attempt.current === 1
          void sim.call(
            formatSceneCall("onRemove", [partId, itemId]),
            (current) => ({ ...current, removed: { ...current.removed, [itemId]: true } }),
            undefined,
            { fail },
          )
        }}
        onCompact={(partId) => {
          void sim.call(formatSceneCall("onCompact", [partId]), (current) => ({ ...current, compact: { ...current.compact, [partId]: true } }))
        }}
      />
    </div>
  )
}

function scene(fixture: WindowFixture, failRemove = false) {
  return function Render(props: SceneRenderProps) {
    return <WindowScene {...props} fixture={fixture} failRemove={failRemove} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "tight", label: "Justa", labelEn: "Tight", render: scene(tight), frame },
  { id: "full", label: "Llena", labelEn: "Full", render: scene(full), frame },
  { id: "compacted", label: "Compacta", labelEn: "Compact", render: scene(compacted), frame },
]
