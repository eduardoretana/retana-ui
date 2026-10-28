"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { diffWords, InlineDiff, type DiffDecision, type DiffSegment } from "@/registry/ui/inline-diff"

import { diffLabels, empty, error as broken, filled, loading, settled, type DiffFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function decisionsFor(segments: readonly DiffSegment[], settle: DiffDecision | undefined, hidden: Readonly<Record<string, boolean>>, overlay: Readonly<Record<string, DiffDecision>>) {
  const decisions: Record<string, DiffDecision> = {}
  if (settle) {
    for (const segment of segments) {
      if (segment.type === "change") decisions[segment.id] = settle
    }
  }
  for (const [id, decision] of Object.entries(overlay)) decisions[id] = decision
  for (const [id, hide] of Object.entries(hidden)) {
    if (hide) delete decisions[id]
  }
  return decisions
}

function DiffScene({ locale, log, fixture, failAccept = false }: SceneRenderProps & { fixture: DiffFixture; failAccept?: boolean }) {
  const sim = useSceneSim({ overlay: {} as Record<string, DiffDecision>, hidden: {} as Record<string, boolean>, stack: [] as string[] }, log)
  const attempt = useRef(0)
  const pair = fixture[locale]
  const segments = diffWords(pair.original, pair.suggested)
  const decisions = decisionsFor(segments, fixture.settle, sim.state.hidden, sim.state.overlay)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.acceptError ? <SceneStatus tone="error">{fixture.acceptError[locale]}</SceneStatus> : null}
      <InlineDiff
        changes={segments}
        decisions={decisions}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={diffLabels(locale)}
        onDecide={(id, decision) => {
          if (decision === "undo") return
          attempt.current += 1
          const fail = failAccept && attempt.current === 1 && decision === "accept"
          void sim.call(
            formatSceneCall("onDecide", [id, decision]),
            (current) => ({
              ...current,
              overlay: { ...current.overlay, [id]: decision },
              hidden: { ...current.hidden, [id]: false },
              stack: [...current.stack, id],
            }),
            undefined,
            { fail },
          )
        }}
        onDecideAll={(decision) =>
          sim.patch(formatSceneCall("onDecideAll", [decision]), (current) => {
            const overlay = { ...current.overlay }
            const hidden = { ...current.hidden }
            const stack = [...current.stack]
            for (const segment of segments) {
              if (segment.type === "change" && !decisions[segment.id]) {
                overlay[segment.id] = decision
                hidden[segment.id] = false
                stack.push(segment.id)
              }
            }
            return { ...current, overlay, hidden, stack }
          })
        }
        onUndo={() =>
          sim.patch(formatSceneCall("onUndo", []), (current) => {
            const id = current.stack[current.stack.length - 1]
            if (!id) {
              const last = Object.keys(decisions).at(-1)
              if (!last) return current
              return { ...current, hidden: { ...current.hidden, [last]: true } }
            }
            const overlay = { ...current.overlay }
            delete overlay[id]
            return { ...current, overlay, hidden: { ...current.hidden, [id]: true }, stack: current.stack.slice(0, -1) }
          })
        }
      />
    </div>
  )
}

function scene(fixture: DiffFixture, failAccept = false) {
  return function Render(props: SceneRenderProps) {
    return <DiffScene {...props} fixture={fixture} failAccept={failAccept} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "settled", label: "Revisado", labelEn: "Settled", render: scene(settled), frame },
]
