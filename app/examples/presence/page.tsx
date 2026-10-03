import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Presencia",
  description: "Avatares, cursores, escritura y selección con un adaptador en memoria.",
}

export default function PresencePage() {
  return (
    <ExampleFrame
      wide
      title="Presencia"
      description="Tres personas y un agente simulado. Los botones muestran el cableado de Liveblocks y Supabase, sin conectar servicios."
    >
      <Demo />
    </ExampleFrame>
  )
}
