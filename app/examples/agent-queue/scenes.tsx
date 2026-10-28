"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentQueue, type QueueLane } from "@/registry/ui/agent-queue"

import {
  empty,
  error as broken,
  failed,
  filled,
  jobsFrom,
  loading,
  paused,
  queueLabels,
  type QueueFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

type QueueState = {
  order: string[]
  lane: Record<string, QueueLane>
  paused: boolean
}

function snapshot(fixture: QueueFixture): QueueState {
  return {
    order: fixture.seeds.map((seed) => seed.id),
    lane: Object.fromEntries(fixture.seeds.map((seed) => [seed.id, seed.lane])),
    paused: fixture.paused,
  }
}

function QueueScene({
  locale,
  log,
  fixture,
  failRetry = false,
}: SceneRenderProps & { fixture: QueueFixture; failRetry?: boolean }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const attempt = useRef(0)
  const jobs = jobsFrom(fixture.seeds, locale, sim.state.lane, sim.state.order)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.retryError ? <SceneStatus tone="error">{fixture.retryError[locale]}</SceneStatus> : null}
      <AgentQueue
        jobs={jobs}
        workers={fixture.workers}
        depth={fixture.depth}
        paused={sim.state.paused}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={queueLabels(locale)}
        onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
        onPause={() => {
          void sim.call(formatSceneCall("onPause"), (current) => ({ ...current, paused: true }))
        }}
        onResume={() => {
          void sim.call(formatSceneCall("onResume"), (current) => ({ ...current, paused: false }))
        }}
        onMoveUp={(id) => {
          sim.patch(formatSceneCall("onMoveUp", [id]), (current) => {
            const waiting = current.order.filter((jobId) => current.lane[jobId] === "queued")
            const index = waiting.indexOf(id)
            if (index <= 0) return current
            const previous = waiting[index - 1]!
            const order = [...current.order]
            const from = order.indexOf(id)
            const to = order.indexOf(previous)
            order[from] = previous
            order[to] = id
            return { ...current, order }
          })
        }}
        onRetry={(id) => {
          attempt.current += 1
          const fail = failRetry && attempt.current === 1
          void sim.call(
            formatSceneCall("onRetry", [id]),
            (current) => ({ ...current, lane: { ...current.lane, [id]: "queued" } }),
            undefined,
            { fail },
          )
        }}
      />
    </div>
  )
}

function scene(fixture: QueueFixture, failRetry = false) {
  return function Render(props: SceneRenderProps) {
    return <QueueScene {...props} fixture={fixture} failRetry={failRetry} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "paused", label: "Detenida", labelEn: "Held", render: scene(paused), frame },
  { id: "failed", label: "Falló", labelEn: "Failed", render: scene(failed, true), frame },
]
