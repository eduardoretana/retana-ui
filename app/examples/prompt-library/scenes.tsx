"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { PromptLibrary } from "@/registry/ui/prompt-library"

import { empty, error as broken, filled, libraryLabels, loading, ready, templatesFrom, type LibraryFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function LibraryScene({ locale, log, fixture, failUse = false }: SceneRenderProps & { fixture: LibraryFixture; failUse?: boolean }) {
  const sim = useSceneSim({ selectedId: fixture.selectedId ?? fixture.templates[0]?.id ?? null, extra: {} as Record<string, Record<string, string>> }, log)
  const attempt = useRef(0)
  const selectedId = sim.state.selectedId
  const values = { ...(selectedId ? fixture.values[locale][selectedId] : {}), ...(selectedId ? sim.state.extra[selectedId] : {}) }
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.useError ? <SceneStatus tone="error">{fixture.useError[locale]}</SceneStatus> : null}
      <PromptLibrary
        templates={templatesFrom(fixture.templates, locale)}
        selectedId={selectedId}
        values={values}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={libraryLabels(locale)}
        onSelect={(id) => sim.patch(formatSceneCall("onSelect", [id]), (current) => ({ ...current, selectedId: id }))}
        onValue={(name, value) =>
          sim.patch(formatSceneCall("onValue", [selectedId, name, value]), (current) => ({
            ...current,
            extra: { ...current.extra, [selectedId ?? ""]: { ...current.extra[selectedId ?? ""], [name]: value } },
          }))
        }
        onCopy={(prompt) => log(formatSceneCall("onCopy", [prompt]))}
        onUse={(prompt, id) => {
          attempt.current += 1
          const fail = failUse && attempt.current === 1
          void sim.call(formatSceneCall("onUse", [id, prompt]), (current) => current, undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: LibraryFixture, failUse = false) {
  return function Render(props: SceneRenderProps) {
    return <LibraryScene {...props} fixture={fixture} failUse={failUse} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "ready", label: "Listo", labelEn: "Ready", render: scene(ready), frame },
]
