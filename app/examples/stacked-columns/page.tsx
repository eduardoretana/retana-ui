import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Columnas apiladas",
  description: "Las pestañas cambian el rango. El puntero sincroniza los totales.",
}

export default function Page() {
  return (
    <ExampleFrame title="Columnas apiladas" description="Las pestañas cambian el rango. El puntero sincroniza los totales.">
      <Demo />
    </ExampleFrame>
  )
}
