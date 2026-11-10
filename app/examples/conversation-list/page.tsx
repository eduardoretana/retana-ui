import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Lista de conversaciones',
  description: 'Búsqueda, filtro y secciones. Las flechas mueven la selección.',
}

export default function Page() {
  return (
    <ExampleFrame title='Lista de conversaciones' description='Búsqueda, filtro y secciones. Las flechas mueven la selección.'>
      <Demo />
    </ExampleFrame>
  )
}
