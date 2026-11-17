"use client"

import { useState } from "react"
import { MotionConfig } from "motion/react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { sceneText } from "@/app/catalog/scene-types"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { ViewTimeline } from "@/registry/ui/view-timeline"

import { dismissed, empty, error, extreme, filled, loading, projectFields, projectViews } from "./fixtures"

const wide = { size: "lg" as const, surface: "card" as const, padding: "sm" as const }

function Timeline({ locale, records, reduced = false, note }: SceneRenderProps & { records: readonly MultiRecord[]; reduced?: boolean; note?: string }) {
  const [rows, setRows] = useState<MultiRecord[]>([...records])
  const view = (
    <div className="flex flex-col gap-2">
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      <ViewTimeline
        records={rows}
        fields={projectFields}
        config={projectViews[2]!}
        locale={locale === "en" ? "en-US" : "es-MX"}
        today="2026-04-03"
        zoom="month"
        onMove={async (id, patch) => {
          setRows((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
      />
    </div>
  )
  if (!reduced) return view
  return <MotionConfig reducedMotion="always">{view}</MotionConfig>
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: wide, render: (props) => <Timeline {...props} records={filled} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: wide, render: (props) => <Timeline {...props} records={empty} /> },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame: wide,
    render: ({ locale }) => (
      <p className="text-sm text-muted-foreground" aria-busy="true">
        {sceneText(locale, loading.label, "Loading the schedule")}
      </p>
    ),
  },
  {
    id: "error",
    label: "Error",
    labelEn: "Error",
    frame: wide,
    render: ({ locale }) => <p role="alert" className="text-sm">{sceneText(locale, error.label, "The schedule could not be loaded.")}</p>,
  },
  {
    id: "dragging",
    label: "Arrastrando",
    labelEn: "Dragging",
    frame: wide,
    render: (props) => <Timeline {...props} records={filled} note={sceneText(props.locale, "La barra sigue el dedo.", "The bar is the finger.")} />,
  },
  {
    id: "dismissed",
    label: "Soltado",
    labelEn: "Released",
    frame: wide,
    render: (props) => <Timeline {...props} records={dismissed} note={sceneText(props.locale, "La barra quedó en la unidad soltada.", "The bar landed on the released unit.")} />,
  },
  { id: "reduced", label: "Menos movimiento", labelEn: "Reduced motion", frame: wide, render: (props) => <Timeline {...props} records={filled} reduced /> },
  {
    id: "keyboard",
    label: "Teclado",
    labelEn: "Keyboard",
    frame: wide,
    render: (props) => <Timeline {...props} records={filled} note={sceneText(props.locale, "Las flechas mueven. Shift y flechas cambian el fin.", "Arrows move. Shift and arrows change the end.")} />,
  },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: wide,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Timeline {...props} records={extreme()} />
      </div>
    ),
  },
]
