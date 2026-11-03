"use client"

import type { Scene, SceneFrame, SceneRenderProps } from "@/app/catalog/scene-types"
import { CiChecksLive, ciChecksLiveLabels, ciChecksLiveLabelsEs } from "@/registry/blocks/ci-checks-live"

import { empty, error, filled, fixtureTransport, loading } from "./transport"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }

function LiveScene({
  locale,
  mode,
  mergeEnabled = false,
}: SceneRenderProps & { mode: "filled" | "empty" | "loading" | "error"; mergeEnabled?: boolean }) {
  const input = mode === "filled" ? filled : mode === "empty" ? empty : mode === "loading" ? loading : error
  return (
    <CiChecksLive
      transport={fixtureTransport(input)}
      mergeEnabled={mergeEnabled}
      labels={locale === "en" ? ciChecksLiveLabels : ciChecksLiveLabelsEs}
      now={Date.parse("2026-11-02T15:00:30Z")}
      historyMs={{ unit: [20_000, 40_000] }}
    />
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <LiveScene {...props} mode="filled" /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <LiveScene {...props} mode="empty" /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <LiveScene {...props} mode="loading" /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <LiveScene {...props} mode="error" /> },
  { id: "merge", label: "Fusión", labelEn: "Merge", frame, render: (props) => <LiveScene {...props} mode="filled" mergeEnabled /> },
]
