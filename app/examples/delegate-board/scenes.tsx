"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { DelegateBoard, type DelegateMode } from "@/registry/ui/delegate-board"

import { auto, boardLabels, crowded, empty, error as broken, filled, loading, tasksFrom, type BoardFixture } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

type BoardState = { agentByTask: Record<string, string | null>; mode: DelegateMode }

function snapshot(fixture: BoardFixture): BoardState {
  return {
    mode: fixture.mode,
    agentByTask: Object.fromEntries(fixture.tasks.map((task) => [task.id, task.agentId ?? null])),
  }
}

function BoardScene({
  locale,
  log,
  fixture,
  failAssign = false,
}: SceneRenderProps & { fixture: BoardFixture; failAssign?: boolean }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const attempt = useRef(0)
  const assignError = fixture.assignError

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && assignError ? <SceneStatus tone="error">{assignError[locale]}</SceneStatus> : null}
      <DelegateBoard
        tasks={tasksFrom(fixture.tasks, locale, sim.state.agentByTask)}
        agents={fixture.agents}
        clockMinutes={fixture.clockMinutes}
        mode={sim.state.mode}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={boardLabels(locale)}
        onModeChange={(mode) => {
          sim.patch(formatSceneCall("onModeChange", [mode]), (current) => ({ ...current, mode }))
        }}
        onAssign={(taskId, agentId) => {
          attempt.current += 1
          const fail = failAssign && attempt.current === 1
          void sim.call(
            formatSceneCall("onAssign", [taskId, agentId]),
            (current) => ({ ...current, agentByTask: { ...current.agentByTask, [taskId]: agentId } }),
            undefined,
            { fail },
          )
        }}
        onUnassign={(taskId) => {
          sim.patch(formatSceneCall("onUnassign", [taskId]), (current) => ({
            ...current,
            agentByTask: { ...current.agentByTask, [taskId]: null },
          }))
        }}
        onPlace={(assignments) => {
          sim.patch(formatSceneCall("onPlace", [assignments.map((item) => [item.taskId, item.agentId])]), (current) => {
            const agentByTask = { ...current.agentByTask }
            for (const item of assignments) agentByTask[item.taskId] = item.agentId
            return { ...current, agentByTask }
          })
        }}
      />
    </div>
  )
}

function scene(fixture: BoardFixture, failAssign = false) {
  return function Render(props: SceneRenderProps) {
    return <BoardScene {...props} fixture={fixture} failAssign={failAssign} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "auto", label: "Automático", labelEn: "Auto", render: scene(auto), frame },
  { id: "crowded", label: "Cargado", labelEn: "Crowded", render: scene(crowded), frame },
]
