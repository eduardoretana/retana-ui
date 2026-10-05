import type { Metadata } from "next"

import { MonitorDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Monitor", description: "Carga, temperatura, memoria y red." }

export default function Page() {
  return (
    <ScenePage title="Monitor" description="Un servidor de ejemplo: carga, temperatura, núcleos, memoria, red y discos.">
      <MonitorDashboard />
    </ScenePage>
  )
}
