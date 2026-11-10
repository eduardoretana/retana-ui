import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Respuestas sugeridas',
  description: 'Chips que la persona aprueba. Esta pieza no envía el mensaje.',
}

export default function Page() {
  return (
    <ExampleFrame title='Respuestas sugeridas' description='Chips que la persona aprueba. Esta pieza no envía el mensaje.'>
      <Demo />
    </ExampleFrame>
  )
}
