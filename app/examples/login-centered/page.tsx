import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Acceso centrado",
  description: "Primero la llave de acceso, luego el correo y el código.",
}

export default function LoginCenteredPage() {
  return (
    <ExampleFrame wide title="Acceso centrado" description="La llave del aparato va primero. El correo pide un código de seis cifras.">
      <Demo />
    </ExampleFrame>
  )
}
