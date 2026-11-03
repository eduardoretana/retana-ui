"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { GuardAuditLog, type AuditLogItem } from "@/registry/ui/guard-audit-log"

import { empty, error, filled, loading } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function scene(entries: readonly AuditLogItem[], status: "idle" | "loading" | "error" = "idle") {
  return function Render({ locale }: SceneRenderProps) {
    return (
      <GuardAuditLog
        entries={entries}
        locale={locale}
        status={status}
        errorMessage={status === "error" ? sceneText(locale, "No se leyó la bitácora ficticia.", "The fictional audit log did not load.") : undefined}
      />
    )
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading, "loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(error, "error"), frame },
]
