"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { MemoryPanel } from "@/registry/ui/memory-panel"

import { empty, error as broken, filled, forgotten, memoriesFrom, memoryLabels, off, paused, undoFrom, loading, type MemoryFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function MemoryScene({ locale, log, fixture, failForget = false }: SceneRenderProps & { fixture: MemoryFixture; failForget?: boolean }) {
  const sim = useSceneSim(
    {
      forgotten: fixture.forgottenId ?? null,
      paused: {} as Record<string, boolean>,
      texts: {} as Record<string, string>,
      enabled: fixture.enabled !== false,
      added: [] as { id: string; text: string; category: string }[],
    },
    log,
  )
  const attempt = useRef(0)
  const memories = [
    ...memoriesFrom(fixture, locale, sim.state),
    ...sim.state.added.map((item) => ({ id: item.id, text: item.text, category: item.category })),
  ]
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.forgetError ? <SceneStatus tone="error">{fixture.forgetError[locale]}</SceneStatus> : null}
      <MemoryPanel
        memories={memories}
        categories={fixture.categories.map((category) => category[locale])}
        enabled={sim.state.enabled}
        undo={undoFrom(fixture, locale, sim.state.forgotten)}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={memoryLabels(locale)}
        onEnabledChange={(enabled) => sim.patch(formatSceneCall("onEnabledChange", [enabled]), (current) => ({ ...current, enabled }))}
        onEdit={(id, text) => sim.patch(formatSceneCall("onEdit", [id, text]), (current) => ({ ...current, texts: { ...current.texts, [id]: text } }))}
        onPause={(id, next) => sim.patch(formatSceneCall("onPause", [id, next]), (current) => ({ ...current, paused: { ...current.paused, [id]: next } }))}
        onForget={(id) => {
          attempt.current += 1
          const fail = failForget && attempt.current === 1
          void sim.call(formatSceneCall("onForget", [id]), (current) => ({ ...current, forgotten: id }), undefined, { fail })
        }}
        onRestore={() => sim.patch(formatSceneCall("onRestore", []), (current) => ({ ...current, forgotten: null }))}
        onAdd={(text, category) =>
          sim.patch(formatSceneCall("onAdd", [text, category]), (current) => ({
            ...current,
            added: [...current.added, { id: `nuevo-${current.added.length + 1}`, text, category }],
          }))
        }
      />
    </div>
  )
}

function scene(fixture: MemoryFixture, failForget = false) {
  return function Render(props: SceneRenderProps) {
    return <MemoryScene {...props} fixture={fixture} failForget={failForget} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "paused", label: "En pausa", labelEn: "Paused", render: scene(paused), frame },
  { id: "off", label: "Apagada", labelEn: "Off", render: scene(off), frame },
  { id: "forgotten", label: "Olvidado", labelEn: "Forgotten", render: scene(forgotten), frame },
]
