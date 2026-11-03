"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { GuardRuleBuilder } from "@/registry/ui/guard-rule-builder"
import type { GuardRule } from "@/registry/retana/lib/guard-rules"

import { empty, error, filled, loading, nested, readonly } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function scene(rule: GuardRule | null, status: "idle" | "loading" | "error" = "idle", readOnly = false) {
  return function Render({ locale, log }: SceneRenderProps) {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        {status === "error" ? <SceneStatus tone="error">{sceneText(locale, "No se guardó el borrador.", "The draft was not saved.")}</SceneStatus> : null}
        <GuardRuleBuilder
          rule={rule}
          locale={locale}
          status={status}
          readOnly={readOnly}
          errorMessage={status === "error" ? sceneText(locale, "No se guardó el borrador.", "The draft was not saved.") : undefined}
          onChange={(next) => log(`onChange(${JSON.stringify(next.name)})`)}
        />
      </div>
    )
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading, "loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(error, "error"), frame },
  { id: "readonly", label: "Solo lectura", labelEn: "Read only", render: scene(readonly, "idle", true), frame },
  { id: "nested", label: "Anidada", labelEn: "Nested", render: scene(nested), frame },
]
