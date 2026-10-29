"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { RangeLanes, rangeLanesLabels, rangeLanesLabelsEs } from "@/registry/ui/range-lanes"

import { dense, empty, error, filled, highlight, loading, negative, single, type LanesFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }
const ticks = [1, 4, 7, 10, 12].map((value) => ({ value, label: String(value) }))

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: LanesFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  return (
    <div className="chart-demo">
      <RangeLanes
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? rangeLanesLabels : rangeLanesLabelsEs}
        status={status}
        domain={{ min: 1, max: 12 }}
        ticks={ticks}
        activeId={fixture.activeId}
        lanes={fixture.lanes.map((lane) => ({ id: lane.id, label: text(locale, lane), start: lane.start, end: lane.end }))}
        onActiveChange={(id) => log(formatSceneCall("onActiveChange", [id]))}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: LanesFixture }) {
  return function SceneBody({ locale, log }: SceneRenderProps) {
    return <Chart fixture={fixture} locale={locale} log={log} />
  }
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ failed: true }, log)
  return <Chart fixture={error} locale={locale} log={log} status={sim.state.failed ? "error" : "ready"} onRetry={() => void sim.call(formatSceneCall("onRetry"), () => ({ failed: false }))} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: Ready({ fixture: filled }) },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: Ready({ fixture: empty }) },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: ({ locale, log }) => <Chart fixture={loading} locale={locale} log={log} status="loading" /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: ErrorScene },
  { id: "single", label: "Un rango", labelEn: "Single range", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Diez cultivos", labelEn: "Ten crops", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Rango invertido", labelEn: "Reversed range", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Rango activo", labelEn: "Active range", frame, render: Ready({ fixture: highlight }) },
]
