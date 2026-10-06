import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Iconos de tema',
  description: 'Catorce iconos animados.',
}

export default function Page() {
  return (
    <ExampleFrame title='Iconos de tema' description='Cada icono cambia con su propio estado, no con el tema de la página.'>
      <Demo />
    </ExampleFrame>
  )
}
