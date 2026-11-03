"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { GuardRuleSimulator } from "@/registry/ui/guard-rule-simulator"
import type { GuardAction, Ruleset } from "@/registry/retana/lib/guard-rules"

import { clock, error, filledAction, filledRuleset, loading, mergeAction, mergeRuleset, missing } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function scene(
  ruleset: Ruleset | null,
  action: GuardAction | null,
  status: "idle" | "loading" | "error" = "idle",
) {
  return function Render({ locale }: SceneRenderProps) {
    return (
      <GuardRuleSimulator
        ruleset={ruleset}
        action={action}
        locale={locale}
        status={status}
        clock={clock}
        errorMessage={status === "error" ? sceneText(locale, "El ruleset ficticio no cargó.", "The fictional ruleset did not load.") : undefined}
      />
    )
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filledRuleset, filledAction), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(null, null), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading.ruleset, loading.action, "loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(error.ruleset, error.action, "error"), frame },
  { id: "missing", label: "Dato faltante", labelEn: "Missing fact", render: scene(filledRuleset, missing), frame },
  { id: "merge", label: "Merge", labelEn: "Merge", render: scene(mergeRuleset, mergeAction), frame },
]
