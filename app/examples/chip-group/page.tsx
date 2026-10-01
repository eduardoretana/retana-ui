import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Grupo de filtros",
  description: "Fichas que se marcan y pliegan el resto.",
}

export default function ChipGroupPage() {
  return (
    <ExampleFrame title="Grupo de filtros" description="La marca crece al elegir una ficha. Las que no caben quedan detrás de “más”.">
      <Demo />
    </ExampleFrame>
  )
}
