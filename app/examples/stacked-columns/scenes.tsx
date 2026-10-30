"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { StackedColumns, stackedColumnsLabels, stackedColumnsLabelsEs } from "@/registry/ui/stacked-columns"

import { dense, empty, error, filled, highlight, loading, negative, single, type StackFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: StackFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  return (
    <div className="chart-demo">
      <StackedColumns
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? stackedColumnsLabels : stackedColumnsLabelsEs}
        status={status}
        suffix="kg"
        series={fixture.series.map((item) => ({ id: item.id, label: text(locale, item) }))}
        periods={fixture.periods.map((period) => ({
          id: period.id,
          label: text(locale, period),
          points: period.points.map((point) => ({ key: point.key, label: text(locale, point), axisLabel: point.axis, values: point.values })),
        }))}
        note={{
          title: text(locale, fixture.note.title),
          body: text(locale, fixture.note.body),
          actionLabel: text(locale, fixture.note.action),
          onAction: () => log(formatSceneCall("onNote")),
        }}
        onPeriodChange={(id) => log(formatSceneCall("onPeriodChange", [id]))}
        onActiveChange={(key) => log(formatSceneCall("onActiveChange", [key]))}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: StackFixture }) {
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
  { id: "single", label: "Serie única", labelEn: "Single series", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Seis meses", labelEn: "Six months", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Valor negativo", labelEn: "Negative value", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Con nota", labelEn: "With note", frame, render: Ready({ fixture: highlight }) },
]
