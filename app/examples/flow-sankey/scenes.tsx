"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { FlowSankey, flowSankeyLabels, flowSankeyLabelsEs } from "@/registry/ui/flow-sankey"

import { dense, empty, error, filled, highlight, loading, negative, single, type FlowFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "sm" }

function text(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

function Chart({ fixture, locale, log, status = "ready", onRetry }: { fixture: FlowFixture; locale: SceneLocale; log: SceneRenderProps["log"]; status?: "ready" | "loading" | "empty" | "error"; onRetry?: () => void }) {
  return (
    <div className="chart-demo">
      <FlowSankey
        title={text(locale, fixture.title)}
        description={text(locale, fixture.description)}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? flowSankeyLabels : flowSankeyLabelsEs}
        status={status}
        activeId={fixture.activeId}
        nodes={fixture.nodes.map((node) => ({ id: node.id, label: text(locale, node), column: node.column }))}
        links={fixture.links}
        onActiveChange={(id) => log(formatSceneCall("onActiveChange", [id]))}
        onMenu={() => log(formatSceneCall("onMenu"))}
        onRetry={onRetry}
      />
    </div>
  )
}

function Ready({ fixture }: { fixture: FlowFixture }) {
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
  { id: "single", label: "Un tramo", labelEn: "Single link", frame, render: Ready({ fixture: single }) },
  { id: "dense", label: "Muchos nodos", labelEn: "Many nodes", frame, render: Ready({ fixture: dense }) },
  { id: "negative", label: "Enlace negativo", labelEn: "Negative link", frame, render: Ready({ fixture: negative }) },
  { id: "highlight", label: "Ruta activa", labelEn: "Active route", frame, render: Ready({ fixture: highlight }) },
]
