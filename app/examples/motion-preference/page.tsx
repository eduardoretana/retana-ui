import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Preferencia de movimiento',
  description: 'Sistema, reducido o completo.',
}

export default function Page() {
  return (
    <ExampleFrame title='Preferencia de movimiento' description='La elección se guarda en este navegador.'>
      <Demo />
    </ExampleFrame>
  )
}
