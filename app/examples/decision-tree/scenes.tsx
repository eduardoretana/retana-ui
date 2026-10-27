"use client"

import { useRef } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { DecisionTree, type DecisionChoice } from "@/registry/ui/decision-tree"

import { empty, error as broken, filled, forksFrom, loading, taken, treeLabels, written, type TreeFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function TreeScene({ locale, log, fixture, failChoose = false }: SceneRenderProps & { fixture: TreeFixture; failChoose?: boolean }) {
  const sim = useSceneSim({ extra: [] as DecisionChoice[] }, log)
  const attempt = useRef(0)
  const path = [...(fixture.path?.[locale] ?? []), ...sim.state.extra]
  return (
    <DecisionTree
      forks={forksFrom(fixture.seeds, locale)}
      path={path}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={treeLabels(locale)}
      onChoose={(forkId, optionId) => {
        attempt.current += 1
        const fail = failChoose && attempt.current === 1
        void sim.call(
          formatSceneCall("onChoose", [forkId, optionId]),
          (current) => ({ extra: [...current.extra, { forkId, optionId }] }),
          undefined,
          { fail },
        )
      }}
      onCustom={(forkId, text) => {
        void sim.call(formatSceneCall("onCustom", [forkId, text]), (current) => ({ extra: [...current.extra, { forkId, custom: text }] }))
      }}
    />
  )
}

function scene(fixture: TreeFixture, failChoose = false) {
  return function Render(props: SceneRenderProps) {
    return <TreeScene {...props} fixture={fixture} failChoose={failChoose} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "taken", label: "Tomado", labelEn: "Taken", render: scene(taken), frame },
  { id: "written", label: "Escrito", labelEn: "Written", render: scene(written), frame },
]
