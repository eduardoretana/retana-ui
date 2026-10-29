"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { DotMeter, dotMeterLabels, dotMeterLabelsEs } from "@/registry/ui/dot-meter"

import { dense, empty, error, filled, highlight, loading, negative, single, type DotFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: DotFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  return (
    <div className="chart-demo">
      <DotMeter
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? dotMeterLabels : dotMeterLabelsEs}
        status={status}
        value={fixture.value}
        limit={fixture.limit}
        cells={fixture.cells}
        suffix={locale === "en" ? "beds" : "camas"}
        onActiveChange={(index) => log(formatSceneCall("onActiveChange", [index]))}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: DotFixture }) {
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
  { id: "single", label: "Un punto", labelEn: "Single cell", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Muchos puntos", labelEn: "Many cells", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Valor negativo", labelEn: "Negative value", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Casi lleno", labelEn: "Nearly full", frame, render: Ready({ fixture: highlight }) },
]
