import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Estados vacíos",
  description: "Varias escenas vacías en la misma tarjeta.",
}

export default function EmptyStatesPage() {
  return (
    <ExampleFrame wide title="Estados vacíos" description="Las pestañas cambian el dibujo. La acción limpia filtros, reintenta o busca la página.">
      <Demo />
    </ExampleFrame>
  )
}
