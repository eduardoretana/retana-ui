import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Squircle',
  description: 'Esquinas suaves nativas o recortadas.',
}

export default function Page() {
  return (
    <ExampleFrame title='Squircle' description='El borde y la sombra siguen la forma.'>
      <Demo />
    </ExampleFrame>
  )
}
