import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Tarjeta de archivo',
  description: 'Nombre, peso y un estado de validación que llega por props.',
}

export default function Page() {
  return (
    <ExampleFrame title='Tarjeta de archivo' description='Nombre, peso y un estado de validación que llega por props.'>
      <Demo />
    </ExampleFrame>
  )
}
