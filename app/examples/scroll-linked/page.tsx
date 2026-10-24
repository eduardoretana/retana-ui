import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Scroll ligado",
  description: "Fade, subida, escala o giro siguen el avance del scroll.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Scroll ligado"
      description="El efecto no se reproduce solo: avanza con el scroll. Si el navegador puede, lo hace con CSS. Si no, con el hook. Con movimiento reducido se queda en el estado final."
    >
      <Demo />
    </ExampleFrame>
  )
}
