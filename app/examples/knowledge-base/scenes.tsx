"use client"

import { useState } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import type { KnowledgeSource } from "@/registry/lib/knowledge-base"
import { KnowledgeBase } from "@/registry/ui/knowledge-base"

import { knowledgeLabels, knowledgeLocale, scenesData, types, type KnowledgeScene } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer)
      reject(new DOMException("aborted", "AbortError"))
    })
  })
}

function KnowledgeSceneView({ locale, log, scene }: SceneRenderProps & { scene: KnowledgeScene }) {
  const [sources, setSources] = useState<KnowledgeSource[]>(scene.sources.map((source) => ({ ...source })))
  return (
    <KnowledgeBase
      title={locale === "en" ? "Knowledge base" : "Base de conocimiento"}
      types={types}
      sources={sources}
      status={scene.status}
      error={scene.error?.[locale]}
      labels={knowledgeLabels(locale)}
      locale={knowledgeLocale(locale)}
      onSourcesChange={(next) => {
        log(formatSceneCall("onSourcesChange", [next.length]))
        setSources(next)
      }}
      onConnect={async (id, ctx) => {
        log(formatSceneCall("onConnect", [id]))
        await wait(200, ctx.signal)
      }}
      onSync={async (id, ctx) => {
        log(formatSceneCall("onSync", [id]))
        if (id === "ayuda") throw new Error(locale === "en" ? "Sync stopped halfway." : "La sincronización se cortó a la mitad.")
        for (const progress of [30, 70, 100]) {
          await wait(150, ctx.signal)
          ctx.report({ progress, chunks: progress * 4 })
        }
      }}
      onDisconnect={async (id, ctx) => {
        log(formatSceneCall("onDisconnect", [id]))
        await wait(100, ctx.signal)
      }}
      onReset={async (ctx) => {
        log(formatSceneCall("onReset"))
        await wait(100, ctx.signal)
      }}
    />
  )
}

function view(id: keyof typeof scenesData) {
  const scene = scenesData[id]
  return function Render(props: SceneRenderProps) {
    return <KnowledgeSceneView {...props} scene={scene} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: view("filled"), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: view("empty"), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: view("loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: view("error"), frame },
  { id: "syncing", label: "Sincronizando", labelEn: "Syncing", render: view("syncing"), frame },
]
