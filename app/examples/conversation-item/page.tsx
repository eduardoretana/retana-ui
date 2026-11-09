import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Fila de conversación',
  description: 'Avatar, vista previa, etapa y no leídos. El canal entra por un slot.',
}

export default function Page() {
  return (
    <ExampleFrame title='Fila de conversación' description='Avatar, vista previa, etapa y no leídos. El canal entra por un slot.'>
      <Demo />
    </ExampleFrame>
  )
}
