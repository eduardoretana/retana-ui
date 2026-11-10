import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Hilo de conversación',
  description: 'Un registro en vivo, con tarjetas, escritura y reintento.',
}

export default function Page() {
  return (
    <ExampleFrame title='Hilo de conversación' description='Un registro en vivo, con tarjetas, escritura y reintento.'>
      <Demo />
    </ExampleFrame>
  )
}
