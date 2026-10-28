"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentInbox, type InboxFilter, type InboxStatus } from "@/registry/ui/agent-inbox"

import { empty, error as broken, failed, filled, inboxLabels, INBOX_NOW, loading, quiet, tasksFrom, type InboxFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

type InboxState = {
  status: Record<string, InboxStatus>
  openIds: string[]
  filter: InboxFilter
}

function snapshot(fixture: InboxFixture): InboxState {
  return {
    status: Object.fromEntries(fixture.seeds.map((seed) => [seed.id, seed.status])),
    openIds: [...fixture.openIds],
    filter: "all",
  }
}

function InboxScene({ locale, log, fixture, failRetry = false }: SceneRenderProps & { fixture: InboxFixture; failRetry?: boolean }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const attempt = useRef(0)
  const tasks = tasksFrom(fixture.seeds, locale, sim.state.status)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.retryError ? <SceneStatus tone="error">{fixture.retryError[locale]}</SceneStatus> : null}
      <AgentInbox
        tasks={tasks}
        now={INBOX_NOW}
        filter={sim.state.filter}
        openIds={sim.state.openIds}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={inboxLabels(locale)}
        onFilterChange={(filter) => sim.patch(formatSceneCall("onFilterChange", [filter]), (current) => ({ ...current, filter }))}
        onOpenChange={(openIds) => sim.patch(formatSceneCall("onOpenChange", [openIds]), (current) => ({ ...current, openIds: [...openIds] }))}
        onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
        onApprove={(id) => {
          void sim.call(formatSceneCall("onApprove", [id]), (current) => ({ ...current, status: { ...current.status, [id]: "done" } }))
        }}
        onSendBack={(id) => {
          void sim.call(formatSceneCall("onSendBack", [id]), (current) => ({ ...current, status: { ...current.status, [id]: "done" } }))
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

function scene(fixture: InboxFixture, failRetry = false) {
  return function Render(props: SceneRenderProps) {
    return <InboxScene {...props} fixture={fixture} failRetry={failRetry} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "failed", label: "Falló", labelEn: "Failed", render: scene(failed, true), frame },
  { id: "quiet", label: "En calma", labelEn: "Quiet", render: scene(quiet), frame },
]
