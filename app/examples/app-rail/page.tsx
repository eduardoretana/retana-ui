import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: 'Riel de la app',
  description: 'Destinos del espacio. El activo queda marcado y el riel cabe en 56 px.',
}

export default function Page() {
  return (
    <ExampleFrame title='Riel de la app' description='Destinos del espacio. El activo queda marcado y el riel cabe en 56 px.'>
      <Demo />
    </ExampleFrame>
  )
}
