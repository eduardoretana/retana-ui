"use client"

import * as React from "react"

import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { applyRunEvent, type Run } from "@/registry/lib/cost-waterfall"
import { CostWaterfall } from "@/registry/ui/cost-waterfall"

import { banner } from "./example-data"
import { exampleMxn, examplePricing, labelsFor, liveTail, sceneRun } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "canvas", padding: "md" }

function WaterfallScene({ locale, log, id }: SceneRenderProps & { id: string }) {
  const sim = useSceneSim({ mode: id === "tokens" ? "tokens" : "cost" }, log)
  const [cursor, setCursor] = React.useState(0)
  const [live, setLive] = React.useState<Run | null>(null)
  const money = id === "mxn" ? exampleMxn : { locale: locale === "en" ? "en-US" : "es-MX", currency: "USD" as const }
  const collapsed = id === "step-error" ? ["root"] : id === "deep-tree" ? ["nivel-0"] : []
  const run = id === "live-streaming" && live ? live : sceneRun(id, locale)

  React.useEffect(() => {
    setLive(null)
    setCursor(0)
  }, [locale])

  function advance() {
    const event = liveTail[cursor]
    if (!event) return
    setLive(applyRunEvent(run, event))
    setCursor((value) => value + 1)
    log(formatSceneCall("applyRunEvent", [event.type]))
  }

  return (
    <div className="grid gap-3">
      {id === "live-streaming" ? (
        <button type="button" className="min-h-11 justify-self-start rounded-md border border-border px-3 text-sm" onClick={advance} disabled={cursor >= liveTail.length}>
          {sceneText(locale, "Avanzar el paso", "Advance the step")}
        </button>
      ) : null}
      <CostWaterfall
        run={run}
        pricing={examplePricing}
        money={money}
        mode={sim.state.mode === "tokens" ? "tokens" : "cost"}
        defaultCollapsed={collapsed}
        loading={id === "loading"}
        error={id === "error" ? banner[locale] : undefined}
        labels={labelsFor(locale)}
        onModeChange={(mode) => sim.patch(formatSceneCall("onModeChange", [mode]), (state) => ({ ...state, mode }))}
        onCollapsedChange={(ids) => log(formatSceneCall("onCollapsedChange", [ids]))}
        onOpenChange={(openId) => log(formatSceneCall("onOpenChange", [openId]))}
        onRetry={id === "error" ? () => log(formatSceneCall("onRetry")) : undefined}
      />
    </div>
  )
}

function scene(id: string, label: string, labelEn: string): Scene {
  return { id, label, labelEn, frame, render: (props) => <WaterfallScene {...props} id={id} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled"),
  scene("empty", "Vacío", "Empty"),
  scene("loading", "Cargando", "Loading"),
  scene("error", "Error", "Error"),
  scene("live-streaming", "En vivo", "Live"),
  scene("step-error", "Paso con error", "Step error"),
  scene("cache-heavy", "Mucha caché", "Cache heavy"),
  scene("deep-tree", "Árbol profundo", "Deep tree"),
  scene("mxn", "Pesos", "MXN"),
  scene("tokens", "Tokens", "Tokens"),
]
