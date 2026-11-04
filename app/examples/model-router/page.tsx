import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Enrutador de modelos",
  description: "Política de enrutamiento con costo mezclado, reparto y respaldo.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Enrutador de modelos"
      description="El costo por 1K se mezcla en vivo. Desplegar le pide al anfitrión que aplique la política. Los montos de la demo ya están en MXN."
      wide
    >
      <Demo />
    </ExampleFrame>
  )
}
