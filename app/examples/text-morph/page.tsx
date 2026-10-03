import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto que se transforma",
  description: "Las letras compartidas se quedan y el ancho sigue al nuevo rótulo.",
}

export default function Page() {
  return (
    <ExampleFrame title="Texto que se transforma" description="Las letras compartidas se quedan y el ancho sigue al nuevo rótulo.">
      <Demo />
    </ExampleFrame>
  )
}
