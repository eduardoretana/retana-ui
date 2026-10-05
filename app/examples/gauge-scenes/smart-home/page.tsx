import type { Metadata } from "next"

import { SmartHomeDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Casa", description: "Termostato, luces, volumen y carga." }

export default function Page() {
  return (
    <ScenePage title="Casa" description="Termostatos, atenuadores, volumen, carga del auto y la red. Se giran con el puntero o el teclado.">
      <SmartHomeDashboard />
    </ScenePage>
  )
}
