import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Burbuja de mensaje',
  description: 'Entrante o saliente, agrupada, con enviado, entregado, leído o reintento.',
}

export default function Page() {
  return (
    <ExampleFrame title='Burbuja de mensaje' description='Entrante o saliente, agrupada, con enviado, entregado, leído o reintento.'>
      <Demo />
    </ExampleFrame>
  )
}
