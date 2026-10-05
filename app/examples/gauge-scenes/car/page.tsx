import type { Metadata } from "next"

import { CarDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Tablero", description: "Tacómetro y velocímetro con combustible." }

export default function Page() {
  return (
    <ScenePage title="Tablero" description="Un par de diales: revoluciones y velocidad, con el combustible cerrando el aro.">
      <CarDashboard />
    </ScenePage>
  )
}
