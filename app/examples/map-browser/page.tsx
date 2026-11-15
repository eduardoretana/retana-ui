import type { Metadata } from "next"
import "maplibre-gl/dist/maplibre-gl.css"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Explorador de mapa",
  description: "Lista filtrable y mapa sincronizados: hover, selección, clústeres y detalle.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Explorador de mapa"
      description="Filtra por tipo, pasa el cursor por una tarjeta o un pin y abre el detalle. La lista es la fuente accesible; el mapa la repite."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
