"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ScrubArea, scrubAreaLabels, scrubAreaLabelsEs } from "@/registry/ui/scrub-area"

import { dense, empty, error, filled, highlight, loading, negative, single, type ScrubFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: ScrubFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  return (
    <div className="chart-demo">
      <ScrubArea
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? scrubAreaLabels : scrubAreaLabelsEs}
        status={status}
        suffix="kg"
        periods={fixture.periods.map((period) => ({
          id: period.id,
          label: text(locale, period),
          points: period.points.map((point) => ({ key: point.key, label: text(locale, point), axisLabel: point.axis, value: point.value })),
        }))}
        onPeriodChange={(id) => log(formatSceneCall("onPeriodChange", [id]))}
        onActiveChange={(key) => log(formatSceneCall("onActiveChange", [key]))}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: ScrubFixture }) {
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
  { id: "single", label: "Un punto", labelEn: "Single point", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Muchos puntos", labelEn: "Many points", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Valor negativo", labelEn: "Negative value", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Dos años", labelEn: "Two years", frame, render: Ready({ fixture: highlight }) },
]
