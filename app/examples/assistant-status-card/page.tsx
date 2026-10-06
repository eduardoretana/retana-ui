import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { AssistantStatusCardDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Estado del asistente",
  description: "Interruptor y un enlace a lo que pide atención.",
}

export default function Page() {
  return (
    <ExampleFrame title="Estado del asistente" description="Interruptor y un enlace a lo que pide atención.">
      <Demo />
    </ExampleFrame>
  )
}
