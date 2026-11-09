import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Filtro segmentado',
  description: 'El control segmentado, con objetivo de 44 px.',
}

export default function Page() {
  return (
    <ExampleFrame title='Filtro segmentado' description='El control segmentado, con objetivo de 44 px.'>
      <Demo />
    </ExampleFrame>
  )
}
