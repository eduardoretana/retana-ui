import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Carrusel de logos",
  description: "Carrusel infinito que se pausa al pasar el cursor.",
}

export default function LogoMarqueePage() {
  return (
    <ExampleFrame title="Carrusel de logos" description="Los nombres son estudios ficticios. El carrusel se detiene al pasar el cursor y respeta el movimiento reducido.">
      <Demo />
    </ExampleFrame>
  )
}
