import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Encabezado de mensajes',
  description: 'Miga, título, subtítulo y acciones. No es el encabezado de proyecto.',
}

export default function Page() {
  return (
    <ExampleFrame title='Encabezado de mensajes' description='Miga, título, subtítulo y acciones. No es el encabezado de proyecto.'>
      <Demo />
    </ExampleFrame>
  )
}
