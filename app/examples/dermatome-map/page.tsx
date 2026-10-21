import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { DermatomeMapDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Mapa de dermatomas",
  description: "Mapa frontal y posterior de la piel que inerva cada nervio espinal; ideal para exploración sensitiva.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mapa de dermatomas" description="Mapa frontal y posterior de la piel que inerva cada nervio espinal; ideal para exploración sensitiva." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
