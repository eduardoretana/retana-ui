import type { Metadata } from "next"

import { WeatherDashboard } from "@/registry/blocks/gauge-scenes"

import { ScenePage } from "../scene-page"

export const metadata: Metadata = { title: "Clima", description: "Temperatura, viento, sol y barómetro en Puerto Bruma." }

export default function Page() {
  return (
    <ScenePage title="Clima" description="Una tarde ficticia en Puerto Bruma: temperatura, veleta, sol, barómetro y aire.">
      <WeatherDashboard />
    </ScenePage>
  )
}
