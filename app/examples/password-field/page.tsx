import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Campo de contraseña",
  description: "Texto sensible con un control para mostrarlo.",
}

export default function PasswordFieldPage() {
  return (
    <ExampleFrame title="Campo de contraseña" description="El ojo corta el trazo al mostrar el valor. El campo no cambia de tamaño.">
      <Demo />
    </ExampleFrame>
  )
}
