import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Tarjeta de métrica',
  description: 'Una barra en píldoras. El total y el avance llegan por props.',
}

export default function Page() {
  return (
    <ExampleFrame title='Tarjeta de métrica' description='Una barra en píldoras. El total y el avance llegan por props.'>
      <Demo />
    </ExampleFrame>
  )
}
