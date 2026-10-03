import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Fortaleza de contraseña",
  description: "El medidor y las reglas responden mientras se escribe.",
}

export default function PasswordStrengthPage() {
  return (
    <ExampleFrame title="Fortaleza de contraseña" description="Cuatro tramos se llenan y cada regla marca su palomita. El ojo corta el trazo al mostrar el valor.">
      <Demo />
    </ExampleFrame>
  )
}
