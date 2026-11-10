import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Compositor del hilo',
  description: 'Adjuntar, preguntar a la IA y enviar. Si la ventana está cerrada, solo queda la plantilla.',
}

export default function Page() {
  return (
    <ExampleFrame title='Compositor del hilo' description='Adjuntar, preguntar a la IA y enviar. Si la ventana está cerrada, solo queda la plantilla.'>
      <Demo />
    </ExampleFrame>
  )
}
