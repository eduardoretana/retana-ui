import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista con encabezados fijos",
  description: "El encabezado se queda hasta que el siguiente lo empuja.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lista con encabezados fijos" description="El encabezado se pega al borde del scroll. El siguiente grupo lo reemplaza.">
      <Demo />
    </ExampleFrame>
  )
}
