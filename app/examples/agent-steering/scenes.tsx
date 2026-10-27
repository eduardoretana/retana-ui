"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentSteering, type SteerRunStatus } from "@/registry/ui/agent-steering"

import {
  done,
  empty,
  error as broken,
  filled,
  loading,
  paused,
  queueFrom,
  steeringLabels,
  stepsFrom,
  type SteerFixture,
  type SteerNoteSeed,
} from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

type SteerState = {
  status: SteerRunStatus
  queue: SteerNoteSeed[]
  notes: Record<string, SteerNoteSeed[]>
  seq: number
}

function snapshot(fixture: SteerFixture): SteerState {
  return {
    status: fixture.status,
    queue: fixture.queue.map((note) => ({ ...note })),
    notes: {},
    seq: fixture.queue.length + 1,
  }
}

function textNote(text: string, seq: number): SteerNoteSeed {
  return { id: `nota-${seq}`, es: text, en: text, text }
}

function SteeringScene({
  locale,
  log,
  fixture,
  failInterrupt = false,
}: SceneRenderProps & { fixture: SteerFixture; failInterrupt?: boolean }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const attempt = useRef(0)
  const activeId = fixture.steps.find((step) => step.status === "active")?.id

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.interruptError ? <SceneStatus tone="error">{fixture.interruptError[locale]}</SceneStatus> : null}
      <AgentSteering
        title={fixture.title[locale]}
        agent={fixture.agent[locale]}
        status={sim.state.status}
        steps={stepsFrom(fixture.steps, locale, sim.state.notes)}
        queue={queueFrom(sim.state.queue, locale)}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={steeringLabels(locale)}
        onPause={() => {
          void sim.call(formatSceneCall("onPause"), (current) => ({ ...current, status: "paused" }))
        }}
        onResume={() => {
          void sim.call(formatSceneCall("onResume"), (current) => ({ ...current, status: "running" }))
        }}
        onQueue={(text) => {
          sim.patch(formatSceneCall("onQueue", [text]), (current) => ({
            ...current,
            seq: current.seq + 1,
            queue: [...current.queue, textNote(text, current.seq)],
          }))
        }}
        onRemove={(id) => {
          sim.patch(formatSceneCall("onRemove", [id]), (current) => ({
            ...current,
            queue: current.queue.filter((item) => item.id !== id),
          }))
        }}
        onInterrupt={(text, queuedId) => {
          attempt.current += 1
          const fail = failInterrupt && attempt.current === 1
          void sim.call(
            formatSceneCall("onInterrupt", queuedId ? [text, queuedId] : [text]),
            (current) => {
              const existing = queuedId ? current.queue.find((item) => item.id === queuedId) : undefined
              const note = existing ?? textNote(text, current.seq)
              const notes = { ...current.notes }
              if (activeId) notes[activeId] = [...(notes[activeId] ?? []), note]
              return {
                ...current,
                seq: existing ? current.seq : current.seq + 1,
                queue: queuedId ? current.queue.filter((item) => item.id !== queuedId) : current.queue,
                notes,
              }
            },
            undefined,
            { fail },
          )
        }}
      />
    </div>
  )
}

function scene(fixture: SteerFixture, failInterrupt = false) {
  return function Render(props: SceneRenderProps) {
    return <SteeringScene {...props} fixture={fixture} failInterrupt={failInterrupt} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "paused", label: "Pausa", labelEn: "Paused", render: scene(paused), frame },
  { id: "done", label: "Cerrado", labelEn: "Done", render: scene(done), frame },
]
