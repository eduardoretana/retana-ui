import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Diálogo que crece',
  description: 'El botón se convierte en el diálogo.',
}

export default function Page() {
  return (
    <ExampleFrame title='Diálogo que crece' description='El foco entra al panel. Escape lo cierra y devuelve el foco.'>
      <Demo />
    </ExampleFrame>
  )
}
