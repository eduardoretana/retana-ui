import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Bitácora de guardas",
  description: "Registro de solo lectura. Cada decisión se agrega y no se borra.",
}

export default function Page() {
  return (
    <ExampleFrame title="Bitácora de guardas" description="Cuentas, versiones y respuestas ficticias. No hay botón de borrar.">
      <Demo />
    </ExampleFrame>
  )
}
