"use client"

import { useState } from "react"

import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { RangePlan, rangePlanLabels, rangePlanLabelsEs } from "@/registry/ui/range-plan"

import { dense, empty, error, filled, highlight, loading, negative, single, type PlanFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: PlanFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  const [value, setValue] = useState(fixture.value)
  const [saved, setSaved] = useState(false)
  return (
    <div className="chart-demo">
      <RangePlan
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        step={text(locale, fixture.step)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? rangePlanLabels : rangePlanLabelsEs}
        status={status}
        min={fixture.min}
        max={fixture.max}
        value={value}
        suffix={fixture.suffix}
        onValueChange={(next) => {
          setValue(next)
          log(formatSceneCall("onValueChange", [next]))
        }}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
        actions={[
          { id: "adjust", label: sceneText(locale, "Ajustar", "Adjust"), variant: "outline", onClick: () => log(formatSceneCall("onAdjust")) },
          {
            id: "save",
            label: saved ? sceneText(locale, "Guardado", "Saved") : sceneText(locale, "Guardar plan", "Save plan"),
            onClick: () => {
              setSaved(true)
              log(formatSceneCall("onSave", [value]))
            },
          },
        ]}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: PlanFixture }) {
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
  { id: "single", label: "Un paso", labelEn: "Single step", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Rango amplio", labelEn: "Wide range", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Bajo cero", labelEn: "Below zero", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Valor alto", labelEn: "High value", frame, render: Ready({ fixture: highlight }) },
]
