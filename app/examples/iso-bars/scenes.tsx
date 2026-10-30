"use client"

import { useState } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { IsoBars, isoBarsLabels, isoBarsLabelsEs } from "@/registry/ui/iso-bars"

import { dense, empty, error, filled, highlight, loading, negative, single, type IsoFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: IsoFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  const [periodId, setPeriodId] = useState(fixture.periods[1]?.id ?? fixture.periods[0]?.id ?? "")
  return (
    <div className="chart-demo">
      <IsoBars
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        caption={text(locale, fixture.caption)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? isoBarsLabels : isoBarsLabelsEs}
        status={status}
        unit={{ suffix: "kg" }}
        emphasisKey={fixture.emphasisKey}
        periodId={periodId}
        periods={fixture.periods.map((period) => ({
          id: period.id,
          label: text(locale, period),
          points: period.points.map((point) => ({ key: point.key, label: text(locale, point), axisLabel: point.axis, value: point.value })),
        }))}
        onPeriodChange={(id) => {
          setPeriodId(id)
          log(formatSceneCall("onPeriodChange", [id]))
        }}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: IsoFixture }) {
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
  { id: "single", label: "Una barra", labelEn: "Single bar", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Doce meses", labelEn: "Twelve months", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Valor negativo", labelEn: "Negative value", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Mes activo", labelEn: "Active month", frame, render: Ready({ fixture: highlight }) },
]
