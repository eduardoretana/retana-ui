"use client"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { TimeOffStats } from "@/registry/ui/time-off-stats"

import { empty, error, errorCopy, filled, loading, pending, statsLabels, zero } from "./fixtures"

const frame = { size: "md" as const, surface: "card" as const, padding: "md" as const }

function View({ locale, spec }: SceneRenderProps & { spec: typeof filled | typeof empty | typeof zero }) {
  const broken = "error" in spec && spec.error
  return (
    <TimeOffStats
      available={spec.available}
      pending={spec.pending}
      years={spec.years}
      loading={"loading" in spec && spec.loading === true}
      error={broken ? errorCopy[locale] : undefined}
      labels={statsLabels(locale)}
    />
  )
}

function scene(id: string, label: string, labelEn: string, spec: typeof filled | typeof empty | typeof zero): Scene {
  return { id, label, labelEn, frame, render: (props) => <View {...props} spec={spec} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled", filled),
  scene("empty", "Vacío", "Empty", empty),
  scene("loading", "Cargando", "Loading", loading),
  scene("error", "Error", "Error", error),
  scene("zero", "Saldo en cero", "Zero balance", zero),
  scene("pending", "Pendiente", "Pending", pending),
]
