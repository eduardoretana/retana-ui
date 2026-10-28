"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { TimeOffRequest } from "@/registry/ui/time-off-request"

import { empty, error, errorCopy, filled, half, holiday, holidays, loading, requestLabels, zero } from "./fixtures"

const frame = { size: "md" as const, surface: "card" as const, padding: "md" as const }

type Spec = {
  available: number | null
  pending: number
  start: string
  end: string
  kindId: string
  loading?: boolean
  fail?: boolean
}

function View({ locale, log, spec }: SceneRenderProps & { spec: Spec }) {
  const sim = useSceneSim({ sent: false }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed ? <SceneStatus tone="error">{errorCopy[locale]}</SceneStatus> : null}
      <TimeOffRequest
        available={spec.available}
        pending={spec.pending}
        holidays={holidays}
        defaultKindId={spec.kindId}
        defaultStart={spec.start}
        defaultEnd={spec.end}
        loading={spec.loading}
        labels={requestLabels(locale)}
        onSubmit={(draft) => {
          attempt.current += 1
          void sim.call(formatSceneCall("onSubmit", [draft.kindId, draft.requested]), (current) => ({ ...current, sent: true }), undefined, {
            fail: Boolean(spec.fail) && attempt.current === 1,
          })
        }}
      />
    </div>
  )
}

function scene(id: string, label: string, labelEn: string, spec: Spec): Scene {
  return { id, label, labelEn, frame, render: (props) => <View {...props} spec={spec} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled", filled),
  scene("empty", "Vacío", "Empty", empty),
  scene("loading", "Cargando", "Loading", loading),
  scene("error", "Error", "Error", error),
  scene("zero", "Saldo en cero", "Zero balance", zero),
  scene("holiday", "Festivo", "Holiday", holiday),
  scene("half", "Medio día", "Half day", half),
]
