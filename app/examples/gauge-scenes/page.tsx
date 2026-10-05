import type { Metadata } from "next"

import { CarDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "./scene-page"

export const metadata: Metadata = {
  title: "Escenas de medidores",
  description: "Tablero, cabina, salud, monitor, casa, relojes y clima.",
}

export default function Page() {
  return (
    <ScenePage
      title="Escenas de medidores"
      description="Siete escenas armadas con el mismo kit. Los números son de un taller ficticio."
    >
      <CarDashboard />
    </ScenePage>
  )
}
