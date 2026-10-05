import type { Metadata } from "next"

import { Cockpit } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Cabina", description: "Los seis instrumentos de una avioneta." }

export default function Page() {
  return (
    <ScenePage title="Cabina" description="Velocidad, actitud, altitud, viraje, rumbo y variómetro, con un piloto de juguete.">
      <Cockpit />
    </ScenePage>
  )
}
