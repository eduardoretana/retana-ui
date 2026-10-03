import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Presencia con Liveblocks",
  description: "Adaptador de Liveblocks. La demo no abre una sala real.",
}

export default function PresenceLiveblocksPage() {
  return (
    <ExampleFrame
      title="Presencia con Liveblocks"
      description="El mapeo marca como agente a quien tiene un id que empieza por agent-. El cableado usa @liveblocks/node en el servidor, no el paquete AGPL."
    >
      <Demo />
    </ExampleFrame>
  )
}
