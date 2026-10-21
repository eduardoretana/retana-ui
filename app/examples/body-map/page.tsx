import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { BodyMapDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Mapa corporal",
  description: "Elige regiones en silueta frontal y posterior para registrar dónde duele. Funciona dentro de un form.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mapa corporal" description="Elige regiones en silueta frontal y posterior para registrar dónde duele. Funciona dentro de un form." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
