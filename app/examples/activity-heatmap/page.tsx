import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa de actividad",
  description: "Un calendario de cuadrados por día, con teclado y leyenda.",
}

export default function ActivityHeatmapPage() {
  return (
    <ExampleFrame title="Mapa de actividad" description="Las flechas saltan un día o una semana. Enter elige el día." wide>
      <Demo />
    </ExampleFrame>
  )
}
