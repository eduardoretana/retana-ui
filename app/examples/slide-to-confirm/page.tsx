import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Deslizar para confirmar',
  description: 'Hay que cruzar el umbral.',
}

export default function Page() {
  return (
    <ExampleFrame title='Deslizar para confirmar' description='Las flechas del teclado también mueven el control.'>
      <Demo />
    </ExampleFrame>
  )
}
