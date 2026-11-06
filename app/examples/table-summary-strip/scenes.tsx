"use client"

import { useRef } from "react"

import { type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { TableComposition } from "@/app/examples/table-summary-strip/composition"

import { adaptive, chrome, empty, error, expandable, filled, loading, narrow, work, zeros } from "./fixtures"

const wide: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }
const phone: SceneFrame = { size: "md", surface: "canvas", padding: "none" }

function FilledScene({ locale, log }: SceneRenderProps) {
  const copy = chrome(locale)
  const sim = useSceneSim({ notice: "" }, log)
  return (
    <TableComposition
      locale={locale}
      kind={filled.kind}
      mode={filled.mode}
      pendingKey={sim.pending || undefined}
      actionError={sim.failed ? { lotId: "serie-a", message: copy.tableError } : undefined}
      onAction={(lotId, actionId) => {
        const key = `${lotId}:${actionId}`
        if (actionId === "retry") {
          void sim.call(key, (current) => current, undefined, { fail: true })
          return
        }
        void sim.call(key, (current) => current)
      }}
    />
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={empty.kind} mode={empty.mode} />
}

function LoadingScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={loading.kind} mode={loading.mode} />
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  const mode = sim.state.phase === "ready" ? "filled" : sim.state.phase === "loading" ? "loading" : "error"
  return (
    <TableComposition
      locale={locale}
      kind={error.kind}
      mode={mode}
      onRetry={() => {
        attempt.current += 1
        const fail = attempt.current === 1
        void sim.call("onRetry", (current) => ({ ...current, phase: "loading" }), () => ({ phase: "ready" }), { fail })
      }}
    />
  )
}

function ZerosScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={zeros.kind} mode={zeros.mode} />
}

function NarrowScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={narrow.kind} mode={narrow.mode} narrow />
}

function ExpandableScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={expandable.kind} mode={expandable.mode} />
}

function WorkScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={work.kind} mode={work.mode} />
}

function AdaptiveScene({ locale }: SceneRenderProps) {
  return <TableComposition locale={locale} kind={adaptive.kind} mode={adaptive.mode} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame: wide },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame: wide },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame: wide },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame: wide },
  { id: "zeros", label: "Ceros", labelEn: "Zeros", render: ZerosScene, frame: wide },
  { id: "narrow", label: "390 px", labelEn: "390 px", render: NarrowScene, frame: phone },
  { id: "expandable", label: "Expansible", labelEn: "Expandable", render: ExpandableScene, frame: wide },
  { id: "work", label: "Trabajo", labelEn: "Work", render: WorkScene, frame: wide },
  { id: "adaptive", label: "Adaptativa", labelEn: "Adaptive", render: AdaptiveScene, frame: wide },
]
