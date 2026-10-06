import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Popover que crece',
  description: 'La superficie del botón crece hasta el panel.',
}

export default function Page() {
  return (
    <ExampleFrame title='Popover que crece' description='No es modal. Escape y un clic fuera lo cierran.'>
      <Demo />
    </ExampleFrame>
  )
}
