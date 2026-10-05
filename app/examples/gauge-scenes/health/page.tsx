import type { Metadata } from "next"

import { HealthDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Salud", description: "Anillos, pulso, sueño y metas del día." }

export default function Page() {
  return (
    <ScenePage title="Salud" description="Un día ficticio: anillos, pulso, sueño, pasos, agua y signos vitales.">
      <HealthDashboard />
    </ScenePage>
  )
}
