import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { ActivityChatDemo } from "./demo"

export const metadata: Metadata = {
  title: "Conversación",
  description: "Mensajes, un evento y una nota de voz. Datos inventados, sin backend.",
}

export default function Page() {
  return (
    <ExampleFrame title="Conversación" description="Enter envía. La nota de voz dibuja la onda con datos y avisa onPlay. No hay audio." size="wide">
      <ActivityChatDemo />
    </ExampleFrame>
  )
}
