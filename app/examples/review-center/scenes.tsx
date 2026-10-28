"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ReviewCenter } from "@/registry/ui/review-center"

import { empty, error as broken, files, filled, itemsFrom, loading, reviewLabels, reviewReasons, skipped, unsure, type ReviewFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function ReviewScene({ locale, log, fixture, failDecide = false }: SceneRenderProps & { fixture: ReviewFixture; failDecide?: boolean }) {
  const sim = useSceneSim(
    {
      gone: {} as Record<string, true>,
      skipped: Object.fromEntries((fixture.skippedIds ?? []).map((id) => [id, true])) as Record<string, true>,
      selectedId: fixture.selectedId ?? null,
      filter: fixture.filter ?? ("all" as const),
      stack: [] as string[],
    },
    log,
  )
  const attempt = useRef(0)
  const source = itemsFrom(fixture, locale, sim.state.skipped)
  const items = source.filter((item) => !sim.state.gone[item.id])
  const last = sim.state.stack[sim.state.stack.length - 1]
  const lastTitle = source.find((item) => item.id === last)?.title
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.decideError ? <SceneStatus tone="error">{fixture.decideError[locale]}</SceneStatus> : null}
      <ReviewCenter
        items={items}
        reviewed={fixture.reviewed}
        total={fixture.total}
        filter={sim.state.filter}
        selectedId={sim.state.selectedId}
        reasons={reviewReasons[locale]}
        undo={lastTitle ? { title: lastTitle } : null}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={reviewLabels(locale)}
        onFilterChange={(filter) => sim.patch(formatSceneCall("onFilterChange", [filter]), (current) => ({ ...current, filter }))}
        onSelect={(id) => sim.patch(formatSceneCall("onSelect", [id]), (current) => ({ ...current, selectedId: id }))}
        onDecide={(id, result) => {
          attempt.current += 1
          const fail = failDecide && attempt.current === 1
          void sim.call(
            formatSceneCall("onDecide", [id, result.decision]),
            (current) => ({ ...current, gone: { ...current.gone, [id]: true }, stack: [...current.stack, id] }),
            undefined,
            { fail },
          )
        }}
        onSkip={(id) =>
          sim.patch(formatSceneCall("onSkip", [id]), (current) => ({
            ...current,
            skipped: { ...current.skipped, [id]: true },
            stack: [...current.stack, id],
          }))
        }
        onUndo={() =>
          sim.patch(formatSceneCall("onUndo", []), (current) => {
            const id = current.stack[current.stack.length - 1]
            if (!id) return current
            const gone = { ...current.gone }
            const skippedIds = { ...current.skipped }
            delete gone[id]
            delete skippedIds[id]
            return { ...current, gone, skipped: skippedIds, stack: current.stack.slice(0, -1) }
          })
        }
      />
    </div>
  )
}

function scene(fixture: ReviewFixture, failDecide = false) {
  return function Render(props: SceneRenderProps) {
    return <ReviewScene {...props} fixture={fixture} failDecide={failDecide} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "files", label: "Archivo", labelEn: "File", render: scene(files), frame },
  { id: "unsure", label: "En duda", labelEn: "Unsure", render: scene(unsure), frame },
  { id: "skipped", label: "Saltado", labelEn: "Skipped", render: scene(skipped), frame },
]
