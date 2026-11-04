"use client"

import { useState } from "react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { ModelRouter } from "@/registry/ui/model-router"
import type { RouterPolicy } from "@/registry/lib/model-router"

import { environments, routerCurrency, routerLabels, routerLocale, scenesData, type RouterScene } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "card", padding: "md" }

function RouterSceneView({
  locale,
  log,
  scene,
  failDeploy = false,
}: SceneRenderProps & { scene: RouterScene; failDeploy?: boolean }) {
  const [policy, setPolicy] = useState<RouterPolicy>(scene.policy)
  const [deployed, setDeployed] = useState<RouterPolicy>(scene.deployed)
  return (
    <ModelRouter
      policy={policy}
      deployed={deployed}
      environments={[...environments]}
      status={scene.status}
      readOnly={scene.readOnly}
      deployPhase={scene.deployPhase}
      error={scene.error?.[locale]}
      labels={routerLabels(locale)}
      locale={routerLocale(locale)}
      currency={routerCurrency}
      onEnvironmentChange={(environmentId) => {
        log(formatSceneCall("onEnvironmentChange", [environmentId]))
        setPolicy((current) => ({ ...current, environmentId }))
      }}
      onPolicyChange={(next) => {
        log(formatSceneCall("onPolicyChange", [next.id]))
        setPolicy(next)
      }}
      onDeployRequest={async (next) => {
        log(formatSceneCall("onDeployRequest", [next.id]))
        if (failDeploy) throw new Error("deploy failed")
        setDeployed(next)
      }}
    />
  )
}

function view(id: keyof typeof scenesData, failDeploy = false) {
  const scene = scenesData[id]
  return function Render(props: SceneRenderProps) {
    return <RouterSceneView {...props} scene={scene} failDeploy={failDeploy} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: view("filled"), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: view("empty"), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: view("loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: view("error", true), frame },
  { id: "unsaved", label: "Sin guardar", labelEn: "Unsaved", render: view("unsaved"), frame },
  { id: "deploying", label: "Desplegando", labelEn: "Deploying", render: view("deploying"), frame },
  { id: "read-only", label: "Solo lectura", labelEn: "Read only", render: view("read-only"), frame },
  { id: "invalid", label: "Inválida", labelEn: "Invalid", render: view("invalid"), frame },
]
