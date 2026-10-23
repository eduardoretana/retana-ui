import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de curso o proceso",
  description: "Curso o proceso con avatares, avance y botón redondo para continuar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de curso o proceso" description="Curso o proceso con avatares, avance y botón redondo para continuar.">
      <Demo />
    </ExampleFrame>
  )
}
