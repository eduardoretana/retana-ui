"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { applyGanttTaskPatch, timelineGanttLabelsEn, type GanttItem } from "@/registry/lib/timeline-gantt"
import { TimelineGantt } from "@/registry/ui/timeline-gantt"

import { demoNow } from "../portfolio-desk/data"
import {
  complete,
  editor,
  empty,
  error as broken,
  extremes,
  filled,
  fixtureError,
  loading,
  long,
  many,
  oneday,
  plain,
  progress,
  type GanttFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "app", padding: "sm" }

type GanttState = { items: GanttItem[]; editingId: string | null }

function GanttScene({
  locale,
  log,
  fixture,
  note,
}: SceneRenderProps & { fixture: GanttFixture; note?: { es: string; en: string } }) {
  const sim = useSceneSim<GanttState>({ items: [...fixture.items], editingId: fixture.editingId ?? null }, log)
  const message = fixtureError(fixture, locale)

  return (
    <div className="flex h-[32rem] min-h-0 flex-col gap-3">
      {note ? <SceneStatus tone="loading">{sceneText(locale, note.es, note.en)}</SceneStatus> : null}
      <TimelineGantt
        className="min-h-0 flex-1"
        items={sim.state.items}
        workstreams={fixture.workstreams}
        now={demoNow}
        scale={fixture.scale ?? "week"}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? timelineGanttLabelsEn : undefined}
        loading={Boolean(fixture.loading)}
        error={message}
        editingId={sim.state.editingId}
        onEditingIdChange={(id) => {
          sim.patch(formatSceneCall("onEditingIdChange", [id]), (current) => ({ ...current, editingId: id }))
        }}
        onSelect={(item) => {
          sim.patch(formatSceneCall("onSelect", [item.id]), (current) => ({ ...current, editingId: item.id }))
        }}
        onTaskChangeRequest={(id, patch) => {
          sim.patch(formatSceneCall("onTaskChangeRequest", [id, patch]), (current) => ({
            ...current,
            items: applyGanttTaskPatch(current.items, id, patch),
            editingId: null,
          }))
        }}
        {...(message ? { onRetry: () => log(formatSceneCall("onRetry")) } : {})}
      />
    </div>
  )
}

function scene(fixture: GanttFixture, note?: { es: string; en: string }) {
  return function Render(props: SceneRenderProps) {
    return <GanttScene {...props} fixture={fixture} note={note} />
  }
}

const plainNote = {
  es: "Estas tareas no traen avance. La barra queda como el estado, sin relleno.",
  en: "These tasks have no progress. The bar stays the status color, with no fill.",
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "progress", label: "Con avance", labelEn: "With progress", render: scene(progress), frame },
  { id: "complete", label: "Grupo al 100%", labelEn: "Group at 100%", render: scene(complete), frame },
  { id: "plain", label: "Sin avance", labelEn: "No progress", render: scene(plain, plainNote), frame },
  { id: "extremes", label: "Valores extremos", labelEn: "Extreme values", render: scene(extremes), frame },
  { id: "long", label: "Nombres largos", labelEn: "Long names", render: scene(long), frame },
  { id: "oneday", label: "Un día", labelEn: "One day", render: scene(oneday), frame },
  { id: "many", label: "Muchas tareas", labelEn: "Many tasks", render: scene(many), frame },
  { id: "editor", label: "Edición", labelEn: "Editing", render: scene(editor), frame },
]
