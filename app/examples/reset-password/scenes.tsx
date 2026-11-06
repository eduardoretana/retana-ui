"use client"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { ResetPassword, type ResetPasswordPhase, type ResetTokenState } from "@/registry/blocks/reset-password"

import { empty, error, filled, invalid, loading, success } from "./fixtures"

const card = { size: "sm" as const, surface: "card" as const, padding: "sm" as const }

type Spec = { password?: string; confirm?: string; phase?: ResetPasswordPhase; tokenState?: ResetTokenState }

function View({ locale, log, spec }: SceneRenderProps & { spec: Spec }) {
  return (
    <ResetPassword
      locale={locale === "en" ? "en" : "es-MX"}
      brand={{ name: "Costa Atelier" }}
      defaultPassword={spec.password ?? ""}
      defaultConfirm={spec.confirm ?? ""}
      phase={spec.phase}
      tokenState={spec.tokenState}
      signInHref="/examples/sign-in"
      requestHref="/examples/forgot-password"
      onSubmit={async (values) => {
        log(formatSceneCall("onSubmit", [values.password.length]))
      }}
    />
  )
}

function scene(id: string, label: string, labelEn: string, spec: Spec): Scene {
  return { id, label, labelEn, frame: card, render: (props) => <View {...props} spec={spec} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled", filled),
  scene("empty", "Vacío", "Empty", empty),
  scene("loading", "Cargando", "Loading", loading),
  scene("error", "Error", "Error", error),
  scene("invalid", "No coinciden", "Mismatch", invalid),
  scene("success", "Listo", "Updated", success),
  scene("token-invalid", "Enlace inválido", "Invalid link", { tokenState: "invalid" }),
  scene("token-expired", "Enlace vencido", "Expired link", { tokenState: "expired" }),
  scene("390", "390 px", "390 px", filled),
]
