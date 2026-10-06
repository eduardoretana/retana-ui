import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Botón con foco de luz',
  description: 'Un haz sigue al puntero.',
}

export default function Page() {
  return (
    <ExampleFrame title='Botón con foco de luz' description='El color sale de los tokens del anfitrión.'>
      <Demo />
    </ExampleFrame>
  )
}
