import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Ficha de la contraparte',
  description: 'Avance, datos, miembros y archivos. Lo sensible nace enmascarado.',
}

export default function Page() {
  return (
    <ExampleFrame title='Ficha de la contraparte' description='Avance, datos, miembros y archivos. Lo sensible nace enmascarado.'>
      <Demo />
    </ExampleFrame>
  )
}
