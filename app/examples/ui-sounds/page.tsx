import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Sonidos de interfaz',
  description: 'Cues sintetizados con silencio, volumen y tema.',
}

export default function Page() {
  return (
    <ExampleFrame title='Sonidos de interfaz' description='Nada suena hasta que pulsas. El silencio se recuerda.'>
      <Demo />
    </ExampleFrame>
  )
}
