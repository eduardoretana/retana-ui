"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { AgentGraph } from "@/registry/ui/agent-graph"

import { blocked, empty, error as broken, filled, graphLabels, linksFrom, loading, nodesFrom, waiting, type GraphFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function GraphScene({ locale, log, fixture }: SceneRenderProps & { fixture: GraphFixture }) {
  return (
    <AgentGraph
      nodes={nodesFrom(fixture.nodes, locale)}
      links={linksFrom(fixture.links)}
      loading={fixture.loading}
      error={fixture.banner?.[locale]}
      labels={graphLabels(locale)}
      onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
    />
  )
}

function scene(fixture: GraphFixture) {
  return function Render(props: SceneRenderProps) {
    return <GraphScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "waiting", label: "En espera", labelEn: "Waiting", render: scene(waiting), frame },
  { id: "blocked", label: "Bloqueada", labelEn: "Blocked", render: scene(blocked), frame },
]
