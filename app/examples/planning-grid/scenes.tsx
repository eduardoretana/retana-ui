"use client"

import { useState } from "react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { PlanningGrid, type HeatMode } from "@/registry/ui/planning-grid"
import type { PlanNode } from "@/registry/lib/planning-grid"

import { changedRows, errorCopy, gridLabels, lockedRows, periodWeights, periods, planRows, spreadRows, withNewRow } from "./fixtures"

const wide = { size: "desk" as const, surface: "card" as const, padding: "md" as const }
const narrow = { size: "sm" as const, surface: "card" as const, padding: "sm" as const }

type Spec = {
  rows: PlanNode[]
  baseline?: PlanNode[]
  heat?: HeatMode
  loading?: boolean
  error?: boolean
  frame?: Scene["frame"]
}

function View({ locale, log, spec }: SceneRenderProps & { spec: Spec }) {
  const [rows, setRows] = useState<readonly PlanNode[]>(spec.rows)
  return (
    <PlanningGrid
      rows={rows}
      periods={periods(locale)}
      periodWeights={periodWeights}
      baseline={spec.baseline ?? spec.rows}
      heat={spec.heat}
      loading={spec.loading}
      error={spec.error ? errorCopy[locale] : undefined}
      labels={gridLabels(locale)}
      onRowsChange={(next) => {
        log(formatSceneCall("onRowsChange", [next.length]))
        setRows(next)
      }}
      onSave={(next) => log(formatSceneCall("onSave", [next.length]))}
    />
  )
}

function scene(id: string, label: string, labelEn: string, spec: Spec): Scene {
  return {
    id,
    label,
    labelEn,
    frame: spec.frame ?? wide,
    render: (props) => <View {...props} spec={spec} />,
  }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled", { rows: planRows() }),
  scene("empty", "Vacío", "Empty", { rows: [] }),
  scene("loading", "Cargando", "Loading", { rows: planRows(), loading: true }),
  scene("error", "Error", "Error", { rows: planRows(), error: true }),
  scene("reforecast-mid-year", "Recorte a mitad de año", "Mid-year reforecast", { rows: planRows() }),
  scene("top-down-spread", "Reparto", "Top-down spread", { rows: spreadRows() }),
  scene("locked-cells", "Celdas bloqueadas", "Locked cells", { rows: lockedRows() }),
  scene("changed-cells-undo", "Cambios", "Changed cells", { rows: changedRows(), baseline: planRows() }),
  scene("new-row", "Nueva fila", "New row", { rows: withNewRow() }),
  scene("heat-by-row", "Calor por fila", "Heat by row", { rows: planRows(), heat: "row" }),
  scene("heat-by-column", "Calor por columna", "Heat by column", { rows: planRows(), heat: "column" }),
  scene("keyboard", "Teclado", "Keyboard", { rows: planRows() }),
  scene("390px", "390 px", "390 px", { rows: planRows(), frame: narrow }),
]
