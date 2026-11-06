"use client"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { VerifyEmail, type VerifyEmailPhase } from "@/registry/blocks/verify-email"

import { address, cooldown, empty, error, filled, invalid, loading, success } from "./fixtures"

const card = { size: "sm" as const, surface: "card" as const, padding: "sm" as const }

type Spec = { email?: string; otp?: boolean; phase?: VerifyEmailPhase }

function View({ locale, log, spec }: SceneRenderProps & { spec: Spec }) {
  return (
    <VerifyEmail
      locale={locale === "en" ? "en" : "es-MX"}
      brand={{ name: "Costa Atelier" }}
      email={spec.email || undefined}
      otp={spec.otp ?? false}
      phase={spec.phase}
      skipHref="/examples/sign-in"
      onResend={async () => {
        log(formatSceneCall("onResend", [address]))
      }}
      onVerifyCode={async (code) => {
        log(formatSceneCall("onVerifyCode", [code]))
        return code === "123456"
      }}
      onVerified={() => log(formatSceneCall("onVerified"))}
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
  scene("invalid", "Código inválido", "Invalid code", invalid),
  scene("cooldown", "Espera", "Cooldown", cooldown),
  scene("success", "Verificado", "Verified", success),
  scene("390", "390 px", "390 px", filled),
]
