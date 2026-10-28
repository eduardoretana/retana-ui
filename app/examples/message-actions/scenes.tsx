"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { MessageActions, type MessageVote } from "@/registry/ui/message-actions"

import { down, empty, error as broken, filled, loading, messageLabels, messageReasons, quiet, speaking, type MessageFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function MessageScene({ locale, log, fixture, failRetry = false }: SceneRenderProps & { fixture: MessageFixture; failRetry?: boolean }) {
  const sim = useSceneSim(
    {
      version: fixture.version ?? 0,
      retries: 0,
      feedback: null as MessageVote,
      feedbackTouched: false,
      speaking: false,
      speakTouched: false,
    },
    log,
  )
  const attempt = useRef(0)
  const versions = [...fixture.versions.map((version) => version[locale]), ...Array.from({ length: sim.state.retries }, () => fixture.retry[locale])]
  const version = Math.min(sim.state.version, Math.max(0, versions.length - 1))
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.retryError ? <SceneStatus tone="error">{fixture.retryError[locale]}</SceneStatus> : null}
      <MessageActions
        text={versions[version] ?? ""}
        versions={versions}
        version={version}
        feedback={sim.state.feedbackTouched ? sim.state.feedback : (fixture.feedback ?? null)}
        speaking={sim.state.speakTouched ? sim.state.speaking : (fixture.speaking ?? false)}
        quiet={fixture.quiet}
        reasons={messageReasons[locale]}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={messageLabels(locale)}
        onVersionChange={(index) => sim.patch(formatSceneCall("onVersionChange", [index]), (current) => ({ ...current, version: index }))}
        onCopy={(text) => log(formatSceneCall("onCopy", [text]))}
        onRegenerate={() => {
          attempt.current += 1
          const fail = failRetry && attempt.current === 1
          void sim.call(
            formatSceneCall("onRegenerate", []),
            (current) => ({ ...current, retries: current.retries + 1, version: fixture.versions.length + current.retries }),
            undefined,
            { fail },
          )
        }}
        onFeedback={(kind, reason) =>
          sim.patch(formatSceneCall("onFeedback", [kind, reason]), (current) => ({ ...current, feedback: kind, feedbackTouched: true }))
        }
        onSpeak={(playing) => sim.patch(formatSceneCall("onSpeak", [playing]), (current) => ({ ...current, speaking: playing, speakTouched: true }))}
      />
    </div>
  )
}

function scene(fixture: MessageFixture, failRetry = false) {
  return function Render(props: SceneRenderProps) {
    return <MessageScene {...props} fixture={fixture} failRetry={failRetry} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "down", label: "En contra", labelEn: "Down", render: scene(down), frame },
  { id: "speaking", label: "Leyendo", labelEn: "Speaking", render: scene(speaking), frame },
  { id: "quiet", label: "Quieta", labelEn: "Quiet", render: scene(quiet), frame },
]
