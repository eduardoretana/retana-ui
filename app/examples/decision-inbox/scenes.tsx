"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { DecisionInbox } from "@/registry/ui/decision-inbox"

import { answered, empty, error as broken, filled, folded, inboxLabels, itemsFrom, loading, type InboxFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

type InboxState = { answers: Record<string, string | null>; hidden: string[] }

function InboxScene({
  locale,
  log,
  fixture,
  failAnswer = false,
}: SceneRenderProps & { fixture: InboxFixture; failAnswer?: boolean }) {
  const sim = useSceneSim<InboxState>({ answers: {}, hidden: [] }, log)
  const attempt = useRef(0)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.answerError ? <SceneStatus tone="error">{fixture.answerError[locale]}</SceneStatus> : null}
      <DecisionInbox
        items={itemsFrom(fixture.items, locale, sim.state.answers, sim.state.hidden)}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={inboxLabels(locale)}
        onAnswer={(id, choiceId) => {
          attempt.current += 1
          const fail = failAnswer && attempt.current === 1
          void sim.call(
            formatSceneCall("onAnswer", [id, choiceId]),
            (current) => ({ ...current, answers: { ...current.answers, [id]: choiceId } }),
            undefined,
            { fail },
          )
        }}
        onDismiss={(id) => {
          sim.patch(formatSceneCall("onDismiss", [id]), (current) => ({
            ...current,
            hidden: [...current.hidden, id],
          }))
        }}
      />
    </div>
  )
}

function scene(fixture: InboxFixture, failAnswer = false) {
  return function Render(props: SceneRenderProps) {
    return <InboxScene {...props} fixture={fixture} failAnswer={failAnswer} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "answered", label: "Respondida", labelEn: "Answered", render: scene(answered), frame },
  { id: "folded", label: "Cerradas", labelEn: "Folded", render: scene(folded), frame },
]
