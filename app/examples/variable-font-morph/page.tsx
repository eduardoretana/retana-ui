import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Morph de fuente variable",
  description: "@property y font-variation-settings ligados al scroll. La demo usa el eje wght de Geist; el anfitrión puede pasar ELSH de Geist Pixel.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Morph de fuente variable"
      description="El peso del titular sigue el desplazamiento. Una copia invisible en el peso máximo reserva el espacio, así que nada se mueve alrededor."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
