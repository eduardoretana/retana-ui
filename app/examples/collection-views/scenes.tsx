"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { CollectionViews, type CollectionView } from "@/registry/ui/collection-views"

import { crowded, empty, error as broken, filled, groupsFor, itemsFor, list, loading, noMatches, timeline, TODAY, viewLabels, type ViewsFixture } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

type ViewsState = { view: CollectionView; query: string; broken: boolean }

function ViewsScene({ locale, log, fixture }: SceneRenderProps & { fixture: ViewsFixture }) {
  const sim = useSceneSim<ViewsState>({ view: fixture.view, query: fixture.query ?? "", broken: Boolean(fixture.error) }, log)
  const message = fixture.error?.[locale]

  return (
    <div className="flex flex-col gap-3">
      {sim.state.broken && message ? <SceneStatus tone="error">{message}</SceneStatus> : null}
      <CollectionViews
        title={sceneText(locale, "Pedidos del taller", "Studio orders")}
        description={sceneText(locale, "Taller Lumen · octubre 2026", "Taller Lumen · October 2026")}
        items={itemsFor(fixture.items, locale)}
        groups={groupsFor(locale)}
        view={sim.state.view}
        query={sim.state.query}
        today={TODAY}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={viewLabels(locale)}
        loading={fixture.loading}
        error={sim.state.broken ? message : undefined}
        onViewChange={(view) => {
          sim.patch(formatSceneCall("onViewChange", [view]), (current) => ({ ...current, view }))
        }}
        onQueryChange={(query) => {
          sim.patch(formatSceneCall("onQueryChange", [query]), (current) => ({ ...current, query }))
        }}
        onItemOpen={(id) => {
          sim.patch(formatSceneCall("onItemOpen", [id]), (current) => current)
        }}
        onRetry={() => {
          sim.patch(formatSceneCall("onRetry", []), (current) => ({ ...current, broken: false }))
        }}
      />
    </div>
  )
}

function scene(fixture: ViewsFixture) {
  return function Render(props: SceneRenderProps) {
    return <ViewsScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "list", label: "Lista", labelEn: "List", render: scene(list), frame },
  { id: "timeline", label: "Tiempo", labelEn: "Timeline", render: scene(timeline), frame },
  { id: "crowded", label: "Lleno de más", labelEn: "Crowded", render: scene(crowded), frame },
  { id: "no-matches", label: "Sin coincidencias", labelEn: "No matches", render: scene(noMatches), frame },
]
