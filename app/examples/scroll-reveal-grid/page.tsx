import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rejilla que aparece al desplazar",
  description: "Tarjetas que entran con animation-timeline view() y animation-range. CSS puro, sin JavaScript.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Rejilla que aparece al desplazar"
      description="Cada tarjeta entra mientras cruza el recuadro. Las pares empiezan un poco después. Sin soporte o con menos movimiento, todo se ve quieto."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
