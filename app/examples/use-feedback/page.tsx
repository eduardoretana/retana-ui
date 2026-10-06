import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Sonido, háptica y animación.',
}

export default function Page() {
  return (
    <ExampleFrame title='Feedback' description='Cada canal se puede apagar. Nada se dispara solo.'>
      <Demo />
    </ExampleFrame>
  )
}
