import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Zona magnética",
  description: "Zona de archivos que reacciona al cursor, con progreso y validación.",
}

export default function MagneticDropzonePage() {
  return (
    <ExampleFrame title="Zona magnética" description="Arrastra un archivo o elige uno. El tipo y el tamaño se validan, y el progreso avanza en este ejemplo.">
      <Demo />
    </ExampleFrame>
  )
}
