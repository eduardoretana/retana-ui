"use client"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { ForgotPassword, type ForgotPasswordPhase } from "@/registry/blocks/forgot-password"

import { empty, error, filled, invalid, loading, sent } from "./fixtures"

const card = { size: "sm" as const, surface: "card" as const, padding: "sm" as const }

type Spec = { email?: string; phase?: ForgotPasswordPhase }

function View({ locale, log, spec }: SceneRenderProps & { spec: Spec }) {
  return (
    <ForgotPassword
      locale={locale === "en" ? "en" : "es-MX"}
      brand={{ name: "Costa Atelier" }}
      defaultEmail={spec.email ?? ""}
      signInHref="/examples/sign-in"
      phase={spec.phase}
      onSubmit={async (email) => {
        log(formatSceneCall("onSubmit", [email]))
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
  scene("invalid", "Correo inválido", "Invalid email", invalid),
  scene("sent", "Enviado", "Sent", sent),
  scene("390", "390 px", "390 px", filled),
]
