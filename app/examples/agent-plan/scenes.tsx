"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentPlan, type PlanStepStatus } from "@/registry/ui/agent-plan"

import { empty, error as broken, failed, filled, loading, planLabels, stepsFrom, trimmed, type PlanFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

type PlanState = {
  order: string[]
  status: Record<string, PlanStepStatus>
  titles: Record<string, string>
  extras: string[]
}

function snapshot(fixture: PlanFixture): PlanState {
  return {
    order: fixture.seeds.map((seed) => seed.id),
    status: Object.fromEntries(fixture.seeds.map((seed) => [seed.id, seed.status])),
    titles: {},
    extras: [],
  }
}

function PlanScene({ locale, log, fixture, failRetry = false }: SceneRenderProps & { fixture: PlanFixture; failRetry?: boolean }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const attempt = useRef(0)
  const extraSeeds = sim.state.extras.map((id) => ({
    id,
    status: "pending" as const,
    estimateMin: 10,
    es: { title: sim.state.titles[id] ?? id },
    en: { title: sim.state.titles[id] ?? id },
  }))
  const steps = stepsFrom([...fixture.seeds, ...extraSeeds], locale, sim.state.status, sim.state.titles, sim.state.order)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.retryError ? <SceneStatus tone="error">{fixture.retryError[locale]}</SceneStatus> : null}
      <AgentPlan
        goal={fixture.goal[locale] || undefined}
        steps={steps}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={planLabels(locale)}
        onRename={(id, title) => sim.patch(formatSceneCall("onRename", [id, title]), (current) => ({ ...current, titles: { ...current.titles, [id]: title } }))}
        onMove={(id, direction) => {
          sim.patch(formatSceneCall("onMove", [id, direction]), (current) => {
            const active = current.order.filter((stepId) => current.status[stepId] !== "dropped")
            const index = active.indexOf(id)
            const swap = active[index + direction]
            if (index < 0 || !swap) return current
            const order = [...current.order]
            const from = order.indexOf(id)
            const to = order.indexOf(swap)
            order[from] = swap
            order[to] = id
            return { ...current, order }
          })
        }}
        onRemove={(id) => sim.patch(formatSceneCall("onRemove", [id]), (current) => ({ ...current, status: { ...current.status, [id]: "dropped" } }))}
        onAdd={(title) => {
          const id = `extra-${sim.state.extras.length + 1}`
          sim.patch(formatSceneCall("onAdd", [title]), (current) => ({
            ...current,
            extras: [...current.extras, id],
            order: [...current.order, id],
            titles: { ...current.titles, [id]: title },
            status: { ...current.status, [id]: "pending" },
          }))
        }}
        onRetry={(id) => {
          attempt.current += 1
          const fail = failRetry && attempt.current === 1
          void sim.call(formatSceneCall("onRetry", [id]), (current) => ({ ...current, status: { ...current.status, [id]: "running" } }), undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: PlanFixture, failRetry = false) {
  return function Render(props: SceneRenderProps) {
    return <PlanScene {...props} fixture={fixture} failRetry={failRetry} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "failed", label: "Falló", labelEn: "Failed", render: scene(failed, true), frame },
  { id: "trimmed", label: "Recortado", labelEn: "Trimmed", render: scene(trimmed), frame },
]
