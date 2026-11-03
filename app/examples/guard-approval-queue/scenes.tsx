"use client"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { GuardApprovalQueue, type ApprovalQueueItem } from "@/registry/ui/guard-approval-queue"

import { empty, error, expired, filled, loading, now } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function scene(items: readonly ApprovalQueueItem[], status: "idle" | "loading" | "error" = "idle", role: "approver" | "viewer" = "approver") {
  return function Render({ locale, log }: SceneRenderProps) {
    return (
      <GuardApprovalQueue
        items={items}
        now={now}
        locale={locale}
        status={status}
        role={role}
        errorMessage={status === "error" ? sceneText(locale, "La cola ficticia falló.", "The fictional queue failed.") : undefined}
        onApprove={(id) => log(`onApprove(${JSON.stringify(id)})`)}
        onReject={(id) => log(`onReject(${JSON.stringify(id)})`)}
      />
    )
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading, "loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(error, "error"), frame },
  { id: "expired", label: "Vencida", labelEn: "Expired", render: scene(expired), frame },
  { id: "viewer", label: "Lector", labelEn: "Viewer", render: scene(filled, "idle", "viewer"), frame },
]
