import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Dashboard analítico AE",
  description: "Pantalla completa para Asesor Experto: métricas, anillos, tarjeta destacada, notas, estados, barras y agenda. Datos ficticios.",
}

export default function Page() {
  return (
    <ExampleFrame title="Dashboard analítico AE" description="Pantalla completa para Asesor Experto: métricas, anillos, tarjeta destacada, notas, estados, barras y agenda. Datos ficticios." size="desk">
      <Demo />
    </ExampleFrame>
  )
}
