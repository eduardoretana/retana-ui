import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mensaje de chat",
  description: "Burbuja de mensaje con avatar, hora, estados y acciones.",
}

export default function ChatMessagePage() {
  return (
    <ExampleFrame
      title="Mensaje de chat"
      description="Burbujas para la persona y el asistente, con copia, reintento y regeneración. Los datos son ficticios."
    >
      <Demo />
    </ExampleFrame>
  )
}
