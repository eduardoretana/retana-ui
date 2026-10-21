import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { OrganViewerDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Visor de órganos 3D",
  description: "Rota, encuadra y selecciona estructuras de un modelo anatómico GLB con three.js. Colores desde tokens del tema.",
}

export default function Page() {
  return (
    <ExampleFrame title="Visor de órganos 3D" description="Rota, encuadra y selecciona estructuras de un modelo anatómico GLB con three.js. Colores desde tokens del tema." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
