"use client"

import { useEffect, useMemo, useRef } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { MapBrowser } from "@/registry/blocks/map-browser"
import { FilterToolbar, type FilterChip } from "@/registry/ui/filter-toolbar"

import {
  categoriesFor,
  cluster,
  empty,
  error as broken,
  filled,
  hover,
  labelsFor,
  loading,
  mapError,
  nomatch,
  provider as localProvider,
  selected,
  type CategoryId,
  type MapFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "app", padding: "none" }

type SimState = { filters: CategoryId[]; selectedId: string | null }

function MapScene({ locale, log, fixture }: SceneRenderProps & { fixture: MapFixture }) {
  const sim = useSceneSim<SimState>({ filters: fixture.filters ?? [], selectedId: fixture.selectedId ?? null }, log)
  const categories = useMemo(() => categoriesFor(locale), [locale])
  const all = useMemo(() => fixture.places(locale), [fixture, locale])
  const places = useMemo(
    () => (sim.state.filters.length ? all.filter((place) => sim.state.filters.includes(place.category as CategoryId)) : all),
    [all, sim.state.filters],
  )
  const total = fixture.total ? fixture.total(locale) : all.length
  const chips: FilterChip[] = sim.state.filters.map((id) => ({
    id,
    label: locale === "en" ? "Type" : "Tipo",
    value: categories.find((c) => c.id === id)?.label,
  }))
  const rootRef = useRef<HTMLDivElement>(null)

  // The hover scene lights one card the way a pointer would.
  useEffect(() => {
    if (!fixture.hoverId) return
    const timer = window.setTimeout(() => {
      const card = rootRef.current?.querySelector(`[data-slot='map-browser-card'][data-place-id='${fixture.hoverId}']`)
      card?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }))
    }, 50)
    return () => window.clearTimeout(timer)
  }, [fixture.hoverId])

  return (
    <div ref={rootRef} className="h-[40rem] w-full p-3 md:p-4">
      <MapBrowser
        places={places}
        total={total}
        status={fixture.status}
        provider={fixture.provider ?? localProvider}
        categories={categories}
        cluster={fixture.cluster}
        labels={labelsFor(locale)}
        selectedId={sim.state.selectedId}
        onSelectedChange={(id) =>
          sim.patch(formatSceneCall("onSelectedChange", [id]), (current) => ({ ...current, selectedId: id }))
        }
        onRetry={() => log(formatSceneCall("onRetry", []))}
        onClearFilters={() => sim.patch(formatSceneCall("onClearFilters", []), (current) => ({ ...current, filters: [] }))}
        toolbar={
          <FilterToolbar
            variant="pill"
            label={locale === "en" ? "Active filters" : "Filtros activos"}
            emptyLabel={locale === "en" ? "All types" : "Todos los tipos"}
            filters={chips}
            onRemove={(id) =>
              sim.patch(formatSceneCall("onRemove", [id]), (current) => ({
                ...current,
                filters: current.filters.filter((f) => f !== id),
              }))
            }
            addFilter={{
              label: locale === "en" ? "Filter by type" : "Filtrar por tipo",
              fields: [
                {
                  id: "type",
                  label: locale === "en" ? "Type" : "Tipo",
                  options: categories.map((c) => ({ value: c.id, label: c.label })),
                },
              ],
              onAdd: (chip) =>
                sim.patch(formatSceneCall("onAdd", [chip.value]), (current) => ({
                  ...current,
                  filters: [...new Set([...current.filters, chip.value as CategoryId])],
                })),
            }}
          />
        }
      />
    </div>
  )
}

function scene(fixture: MapFixture) {
  return function Render(props: SceneRenderProps) {
    return <MapScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "nomatch", label: "Sin coincidencias", labelEn: "No match", render: scene(nomatch), frame },
  { id: "map-error", label: "Mapa caído", labelEn: "Map down", render: scene(mapError), frame },
  { id: "cluster", label: "Clústeres", labelEn: "Clusters", render: scene(cluster), frame },
  { id: "selected", label: "Seleccionado", labelEn: "Selected", render: scene(selected), frame },
  { id: "hover", label: "Hover", labelEn: "Hover", render: scene(hover), frame },
]
