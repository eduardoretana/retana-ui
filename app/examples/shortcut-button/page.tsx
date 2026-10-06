import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Botón con atajo',
  description: 'Teclas que se hunden.',
}

export default function Page() {
  return (
    <ExampleFrame title='Botón con atajo' description='El atajo de esta demo es la tecla b.'>
      <Demo />
    </ExampleFrame>
  )
}
