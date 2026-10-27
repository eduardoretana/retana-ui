"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { CitedAnswer } from "@/registry/ui/cited-answer"

import { answerLabels, empty, error as broken, filled, loading, open, segmentsFrom, skipped, sourcesFrom, type AnswerFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function AnswerScene({ locale, log, fixture }: SceneRenderProps & { fixture: AnswerFixture }) {
  const sim = useSceneSim({ openId: fixture.openId ?? null }, log)
  return (
    <CitedAnswer
      segments={segmentsFrom(fixture.segments, locale)}
      sources={sourcesFrom(fixture.sources, locale)}
      pagesRead={fixture.pagesRead}
      openId={sim.state.openId}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={answerLabels(locale)}
      onOpen={(id) => sim.patch(formatSceneCall("onOpen", [id]), () => ({ openId: id }))}
      onOpenSource={(id) => log(formatSceneCall("onOpenSource", [id]))}
    />
  )
}

function scene(fixture: AnswerFixture) {
  return function Render(props: SceneRenderProps) {
    return <AnswerScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "open", label: "Abierta", labelEn: "Open", render: scene(open), frame },
  { id: "skipped", label: "Sin fuente", labelEn: "Skipped", render: scene(skipped), frame },
]
