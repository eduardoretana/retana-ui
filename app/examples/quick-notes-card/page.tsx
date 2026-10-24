import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Notas rápidas",
  description: "Lista corta de notas con alta y borrado accesibles, y estado vacío.",
}

export default function Page() {
  return (
    <ExampleFrame title="Notas rápidas" description="Lista corta de notas con alta y borrado accesibles, y estado vacío.">
      <Demo />
    </ExampleFrame>
  )
}
