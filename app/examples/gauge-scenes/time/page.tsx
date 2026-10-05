import type { Metadata } from "next"

import { TimeDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Relojes", description: "Husos, cronógrafo, alarmas y cuentas atrás." }

export default function Page() {
  return (
    <ScenePage title="Relojes" description="Husos horarios, un cronógrafo con vueltas, alarmas y temporizadores.">
      <TimeDashboard />
    </ScenePage>
  )
}
