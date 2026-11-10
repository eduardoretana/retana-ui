import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Tarjeta de monto',
  description: 'Un monto y un vencimiento. También sirve para una cotización.',
}

export default function Page() {
  return (
    <ExampleFrame title='Tarjeta de monto' description='Un monto y un vencimiento. También sirve para una cotización.'>
      <Demo />
    </ExampleFrame>
  )
}
