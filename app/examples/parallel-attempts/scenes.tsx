"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ParallelAttempts } from "@/registry/ui/parallel-attempts"

import {
  attemptLabels,
  attemptsFrom,
  empty,
  error as broken,
  failed,
  filled,
  loading,
  picked,
  tied,
  type AttemptFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function AttemptScene({ locale, log, fixture, failPick = false }: SceneRenderProps & { fixture: AttemptFixture; failPick?: boolean }) {
  const sim = useSceneSim({ pickedId: fixture.pickedId ?? null }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.pickError ? <SceneStatus tone="error">{fixture.pickError[locale]}</SceneStatus> : null}
      <ParallelAttempts
        task={fixture.task[locale] || undefined}
        attempts={attemptsFrom(fixture.seeds, locale)}
        pickedId={sim.state.pickedId}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={attemptLabels(locale)}
        onPick={(id) => {
          attempt.current += 1
          const fail = failPick && attempt.current === 1
          void sim.call(formatSceneCall("onPick", [id]), () => ({ pickedId: id }), undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: AttemptFixture, failPick = false) {
  return function Render(props: SceneRenderProps) {
    return <AttemptScene {...props} fixture={fixture} failPick={failPick} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "picked", label: "Elegido", labelEn: "Kept", render: scene(picked), frame },
  { id: "tied", label: "Empate", labelEn: "Tied", render: scene(tied), frame },
  { id: "failed", label: "Falló", labelEn: "Failed", render: scene(failed, true), frame },
]
