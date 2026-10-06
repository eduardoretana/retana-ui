import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Háptica',
  description: 'Vibración opcional.',
}

export default function Page() {
  return (
    <ExampleFrame title='Háptica' description='Si el navegador no vibra, el disparo no hace nada.'>
      <Demo />
    </ExampleFrame>
  )
}
